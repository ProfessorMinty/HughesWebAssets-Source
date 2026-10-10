import {
  canonicalJson,
  sha256Text,
  validateHubSemantics,
  validateRouteRegistry
} from "./classroom-explorations-hub-contract.mjs";
import {
  registerExploration,
  registerTwwl,
  setCurrentExploration,
  setCurrentTwwl,
  setCurrentTwwlComingSoon,
  setFeaturedMedia,
  reorderPastExplorations,
  reorderPastTwwl,
  updateExploration,
  updateTwwl,
  updateMedia,
  upsertPreviousYearArchive
} from "./classroom-explorations-hub-operations.mjs";

export class HubTransactionError extends Error {
  constructor(code, message, detail = {}) {
    super(message);
    this.name = "HubTransactionError";
    this.code = code;
    this.detail = detail;
  }
}

function clone(value) {
  return structuredClone(value);
}

function ensureObject(value, code, message) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HubTransactionError(code, message);
  }
  return value;
}

function ensureString(value, code, message) {
  if (typeof value !== "string" || value.length === 0) {
    throw new HubTransactionError(code, message);
  }
  return value;
}

function commandDefinitions(control) {
  return new Map(Object.values(control.commands).map((definition) => [definition.operation, definition]));
}

function pointerSegments(pointer) {
  if (typeof pointer !== "string" || !pointer.startsWith("/")) {
    throw new HubTransactionError("HUB_CONTROL_PATH_INVALID", `Invalid control path ${pointer}.`);
  }

  return pointer
    .slice(1)
    .split("/")
    .map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"));
}

function valueAtPointer(document, pointer) {
  let current = document;
  for (const segment of pointerSegments(pointer)) {
    if (!current || typeof current !== "object" || !(segment in current)) {
      throw new HubTransactionError(
        "HUB_CONTROL_PATH_INVALID",
        `Control path ${pointer} does not resolve in the authoring document.`
      );
    }
    current = current[segment];
  }
  return current;
}

function rejectUnapprovedPatch(patch, allowedFields, immutableFields = []) {
  ensureObject(patch, "HUB_COMMAND_PAYLOAD_INVALID", "Command patch must be an object.");
  const allowed = new Set(allowedFields);
  const immutable = new Set(immutableFields);

  for (const key of Object.keys(patch)) {
    if (immutable.has(key)) {
      throw new HubTransactionError(
        "HUB_STABLE_ID_IMMUTABLE",
        `The stable field ${key} cannot be changed.`
      );
    }
    if (!allowed.has(key)) {
      throw new HubTransactionError(
        "HUB_EDIT_FIELD_FORBIDDEN",
        `Field ${key} is not editable through this Hub command.`
      );
    }
  }
}

function addRoute(registry, route) {
  ensureObject(route, "HUB_COMMAND_PAYLOAD_INVALID", "Route registration payload must be an object.");
  const next = clone(registry);

  if (next.routes.some((item) => item.ref === route.ref)) {
    throw new HubTransactionError("HUB_ROUTE_REF_DUPLICATE", `Route ref already exists: ${route.ref}`);
  }

  if (next.routes.some((item) => item.wordpressPageId === route.wordpressPageId)) {
    throw new HubTransactionError(
      "HUB_ROUTE_PAGE_ID_MISMATCH",
      `WordPress page ID already exists: ${route.wordpressPageId}`
    );
  }

  next.routes.push(clone(route));
  validateRouteRegistry(next);
  return next;
}

function ensureCommandEnvelope(command, control) {
  ensureObject(command, "HUB_COMMAND_INVALID", "Hub command must be an object.");

  if (command.schemaVersion !== "1.0") {
    throw new HubTransactionError("HUB_COMMAND_SCHEMA_UNSUPPORTED", "Unsupported Hub command schema.");
  }

  ensureString(command.commandId, "HUB_COMMAND_INVALID", "Hub command requires commandId.");
  ensureString(command.idempotencyKey, "HUB_COMMAND_INVALID", "Hub command requires idempotencyKey.");
  ensureString(command.operation, "HUB_COMMAND_INVALID", "Hub command requires operation.");

  if (command.targetPageId !== control.target.pageId) {
    throw new HubTransactionError(
      "HUB_COMMAND_TARGET_MISMATCH",
      `Command targets ${command.targetPageId}; expected ${control.target.pageId}.`
    );
  }

  if (!commandDefinitions(control).has(command.operation)) {
    throw new HubTransactionError(
      "HUB_COMMAND_UNSUPPORTED",
      `Operation ${command.operation} is not declared by the Hub control manifest.`
    );
  }

  ensureObject(command.expected, "HUB_COMMAND_INVALID", "Hub command requires expected document revisions.");
  ensureObject(command.payload ?? {}, "HUB_COMMAND_PAYLOAD_INVALID", "Hub command payload must be an object.");
}

export function documentRevisions(source, routes) {
  return {
    authoringSha256: sha256Text(canonicalJson(source)),
    routesSha256: sha256Text(canonicalJson(routes))
  };
}

function requireFresh(command, source, routes) {
  const actual = documentRevisions(source, routes);
  const expected = command.expected;

  if (
    expected.authoringSha256 !== actual.authoringSha256 ||
    expected.routesSha256 !== actual.routesSha256
  ) {
    throw new HubTransactionError(
      "HUB_TRANSACTION_STALE",
      "Hub source or route registry changed after this command was prepared.",
      { expected, actual }
    );
  }

  return actual;
}

function editNode(source, control, payload) {
  const nodeId = ensureString(
    payload.nodeId,
    "HUB_COMMAND_PAYLOAD_INVALID",
    "edit-node requires nodeId."
  );
  const definition = control.editor.nodes.find((node) => node.nodeId === nodeId);

  if (!definition) {
    throw new HubTransactionError("HUB_EDIT_NODE_UNKNOWN", `Unknown editable node ${nodeId}.`);
  }

  rejectUnapprovedPatch(payload.patch, definition.editableFields, ["nodeId"]);
  const next = clone(source);
  const node = valueAtPointer(next, definition.path);

  if (node.nodeId !== nodeId) {
    throw new HubTransactionError(
      "HUB_EDIT_NODE_MISMATCH",
      `Control path ${definition.path} does not contain ${nodeId}.`
    );
  }

  Object.assign(node, clone(payload.patch));
  return next;
}

function updateContent(source, registry, control, payload) {
  const kind = ensureString(
    payload.kind,
    "HUB_COMMAND_PAYLOAD_INVALID",
    "update-content requires kind."
  );
  const contentId = ensureString(
    payload.contentId,
    "HUB_COMMAND_PAYLOAD_INVALID",
    "update-content requires contentId."
  );
  const catalog = control.editor.catalogs.find((item) => item.kind === kind);

  if (!catalog) {
    throw new HubTransactionError("HUB_CONTENT_KIND_UNSUPPORTED", `Unsupported content kind ${kind}.`);
  }

  rejectUnapprovedPatch(payload.patch, catalog.editableFields, catalog.immutableFields);

  if (kind === "exploration") return updateExploration(source, registry, contentId, payload.patch);
  if (kind === "twwl") return updateTwwl(source, registry, contentId, payload.patch);
  if (kind === "media") return updateMedia(source, registry, contentId, payload.patch);

  throw new HubTransactionError("HUB_CONTENT_KIND_UNSUPPORTED", `Unsupported content kind ${kind}.`);
}

function registerOptionalRoute(registry, route) {
  return route ? addRoute(registry, route) : registry;
}

function registerOptionalExploration(source, registry, exploration) {
  if (!exploration) return source;
  if (source.data.explorations.some((item) => item.id === exploration.id)) return source;
  return registerExploration(source, registry, exploration);
}

function registerOptionalTwwl(source, registry, item) {
  if (!item) return source;
  if (source.data.twwl.some((entry) => entry.id === item.id)) return source;
  return registerTwwl(source, registry, item);
}

function rollSchoolYear(source, routes, payload) {
  const nextSource = clone(source);
  let nextRoutes = routes;
  const schoolYear = ensureObject(
    payload.schoolYear,
    "HUB_COMMAND_PAYLOAD_INVALID",
    "roll-school-year requires a schoolYear object."
  );
  ensureString(schoolYear.id, "HUB_COMMAND_PAYLOAD_INVALID", "schoolYear requires id.");
  ensureString(schoolYear.label, "HUB_COMMAND_PAYLOAD_INVALID", "schoolYear requires label.");

  const outgoingYear = nextSource.data.composition.currentSchoolYear;
  if (!nextSource.data.schoolYears.some((item) => item.id === schoolYear.id)) {
    nextSource.data.schoolYears.unshift(clone(schoolYear));
  }

  nextRoutes = registerOptionalRoute(nextRoutes, payload.route);
  let projected = registerOptionalExploration(nextSource, nextRoutes, payload.exploration);

  const currentExplorationId = ensureString(
    payload.currentExplorationId,
    "HUB_COMMAND_PAYLOAD_INVALID",
    "roll-school-year requires currentExplorationId."
  );

  projected.data.composition.currentSchoolYear = schoolYear.id;
  projected = setCurrentExploration(projected, nextRoutes, currentExplorationId, {
    archiveOutgoing: false
  });
  projected = setCurrentTwwlComingSoon(projected, nextRoutes);

  if (payload.previousYearArchive) {
    const archive = clone(payload.previousYearArchive);
    if (archive.schoolYear !== outgoingYear) {
      throw new HubTransactionError(
        "HUB_ARCHIVE_YEAR_INVALID",
        `Previous-year archive must describe outgoing year ${outgoingYear}.`
      );
    }
    projected = upsertPreviousYearArchive(projected, nextRoutes, archive);
  }

  return { source: projected, routes: nextRoutes };
}

export function applyHubCommand({ source, routes, control, command }) {
  ensureCommandEnvelope(command, control);
  validateHubSemantics(source, routes);
  const before = requireFresh(command, source, routes);
  const payload = command.payload ?? {};

  let nextSource = clone(source);
  let nextRoutes = clone(routes);
  let result = {};

  switch (command.operation) {
    case "hub.swap-current-exploration": {
      nextRoutes = registerOptionalRoute(nextRoutes, payload.route);
      nextSource = registerOptionalExploration(nextSource, nextRoutes, payload.exploration);
      const nextExplorationId = ensureString(
        payload.nextExplorationId,
        "HUB_COMMAND_PAYLOAD_INVALID",
        "swap-current-exploration requires nextExplorationId."
      );
      const outgoingExplorationId = nextSource.data.composition.currentExplorationId;
      nextSource = setCurrentExploration(nextSource, nextRoutes, nextExplorationId, {
        archiveOutgoing: payload.archiveOutgoing !== false
      });
      result = { outgoingExplorationId, currentExplorationId: nextExplorationId };
      break;
    }

    case "hub.edit-node": {
      nextSource = editNode(nextSource, control, payload);
      result = { nodeId: payload.nodeId, editedFields: Object.keys(payload.patch ?? {}) };
      break;
    }

    case "hub.update-content": {
      nextSource = updateContent(nextSource, nextRoutes, control, payload);
      result = {
        kind: payload.kind,
        contentId: payload.contentId,
        editedFields: Object.keys(payload.patch ?? {})
      };
      break;
    }

    case "hub.set-current-twwl": {
      nextRoutes = registerOptionalRoute(nextRoutes, payload.route);
      nextSource = registerOptionalTwwl(nextSource, nextRoutes, payload.twwl);
      const contentId = ensureString(
        payload.contentId,
        "HUB_COMMAND_PAYLOAD_INVALID",
        "set-current-twwl requires contentId."
      );
      nextSource = setCurrentTwwl(nextSource, nextRoutes, contentId, {
        archiveOutgoing: payload.archiveOutgoing !== false
      });
      result = { currentTwwlId: contentId };
      break;
    }

    case "hub.set-current-twwl-coming-soon": {
      nextSource = setCurrentTwwlComingSoon(nextSource, nextRoutes);
      result = { state: "coming-soon" };
      break;
    }

    case "hub.set-featured-media": {
      const mediaId = ensureString(
        payload.mediaId,
        "HUB_COMMAND_PAYLOAD_INVALID",
        "set-featured-media requires mediaId."
      );
      nextSource = setFeaturedMedia(nextSource, nextRoutes, mediaId);
      result = { featuredMediaId: mediaId };
      break;
    }

    case "hub.reorder-gallery": {
      if (!Array.isArray(payload.orderedIds)) {
        throw new HubTransactionError(
          "HUB_COMMAND_PAYLOAD_INVALID",
          "reorder-gallery requires orderedIds."
        );
      }
      if (payload.gallery === "pastExplorations") {
        nextSource = reorderPastExplorations(nextSource, nextRoutes, payload.orderedIds);
      } else if (payload.gallery === "pastTwwl") {
        nextSource = reorderPastTwwl(nextSource, nextRoutes, payload.orderedIds);
      } else {
        throw new HubTransactionError(
          "HUB_COMMAND_PAYLOAD_INVALID",
          "gallery must be pastExplorations or pastTwwl."
        );
      }
      result = { gallery: payload.gallery, orderedIds: [...payload.orderedIds] };
      break;
    }

    case "hub.publish-archive": {
      const archive = {
        id: ensureString(
          payload.archiveId,
          "HUB_COMMAND_PAYLOAD_INVALID",
          "publish-archive requires archiveId."
        ),
        schoolYear: ensureString(
          payload.schoolYear,
          "HUB_COMMAND_PAYLOAD_INVALID",
          "publish-archive requires schoolYear."
        ),
        state: "published",
        routeRef: ensureString(
          payload.routeRef,
          "HUB_COMMAND_PAYLOAD_INVALID",
          "publish-archive requires routeRef."
        )
      };
      nextSource = upsertPreviousYearArchive(nextSource, nextRoutes, archive);
      result = { archiveId: archive.id, schoolYear: archive.schoolYear, state: archive.state };
      break;
    }

    case "hub.roll-school-year": {
      const rolled = rollSchoolYear(nextSource, nextRoutes, payload);
      nextSource = rolled.source;
      nextRoutes = rolled.routes;
      result = {
        currentSchoolYear: nextSource.data.composition.currentSchoolYear,
        currentExplorationId: nextSource.data.composition.currentExplorationId,
        currentTwwlState: nextSource.data.composition.currentTwwl.state
      };
      break;
    }

    default:
      throw new HubTransactionError(
        "HUB_COMMAND_UNSUPPORTED",
        `Unsupported operation ${command.operation}.`
      );
  }

  validateHubSemantics(nextSource, nextRoutes);
  const after = documentRevisions(nextSource, nextRoutes);
  const changedDocuments = [];
  if (before.authoringSha256 !== after.authoringSha256) changedDocuments.push("authoring");
  if (before.routesSha256 !== after.routesSha256) changedDocuments.push("routes");

  return {
    schemaVersion: "1.0",
    commandId: command.commandId,
    idempotencyKey: command.idempotencyKey,
    operation: command.operation,
    targetPageId: control.target.pageId,
    status: "projected",
    changedDocuments,
    before,
    after,
    result,
    documents: {
      source: nextSource,
      routes: nextRoutes
    }
  };
}
