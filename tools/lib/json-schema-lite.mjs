export class StructuralValidationError extends Error {
  constructor(issues) {
    super(`Structural validation failed with ${issues.length} issue(s).`);
    this.name = "StructuralValidationError";
    this.issues = issues;
  }
}

function typeMatches(value, expected) {
  if (expected === "null") return value === null;
  if (expected === "array") return Array.isArray(value);
  if (expected === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (expected === "integer") return Number.isInteger(value);
  return typeof value === expected;
}

export function validateSchema(value, schema, rootPath = "$") {
  const issues = [];
  function visit(v, s, path) {
    if (!s || typeof s !== "object") return;
    if (Object.prototype.hasOwnProperty.call(s, "const") && v !== s.const) issues.push({ path, code: "SCHEMA_CONST", message: `must equal ${JSON.stringify(s.const)}` });
    if (Array.isArray(s.enum) && !s.enum.some((item) => item === v)) issues.push({ path, code: "SCHEMA_ENUM", message: `must be one of ${s.enum.join(", ")}` });
    if (s.type) {
      const expected = Array.isArray(s.type) ? s.type : [s.type];
      if (!expected.some((t) => typeMatches(v, t))) {
        issues.push({ path, code: "SCHEMA_TYPE", message: `must be ${expected.join(" or ")}` });
        return;
      }
    }
    if (typeof v === "string") {
      if (Number.isInteger(s.minLength) && v.length < s.minLength) issues.push({ path, code: "SCHEMA_MIN_LENGTH", message: `must have at least ${s.minLength} character(s)` });
      if (s.pattern && !(new RegExp(s.pattern).test(v))) issues.push({ path, code: "SCHEMA_PATTERN", message: `does not match ${s.pattern}` });
    }
    if (typeof v === "number" && typeof s.minimum === "number" && v < s.minimum) issues.push({ path, code: "SCHEMA_MINIMUM", message: `must be >= ${s.minimum}` });
    if (Array.isArray(v)) {
      if (Number.isInteger(s.minItems) && v.length < s.minItems) issues.push({ path, code: "SCHEMA_MIN_ITEMS", message: `must contain at least ${s.minItems} item(s)` });
      if (s.uniqueItems) {
        const seen = new Set(v.map((item) => JSON.stringify(item)));
        if (seen.size !== v.length) issues.push({ path, code: "SCHEMA_UNIQUE_ITEMS", message: "must not contain duplicate items" });
      }
      if (s.items) v.forEach((item, i) => visit(item, s.items, `${path}[${i}]`));
    }
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      const props = s.properties || {};
      for (const required of s.required || []) {
        if (!Object.prototype.hasOwnProperty.call(v, required)) issues.push({ path: `${path}.${required}`, code: "SCHEMA_REQUIRED", message: "is required" });
      }
      for (const [key, child] of Object.entries(v)) {
        if (Object.prototype.hasOwnProperty.call(props, key)) visit(child, props[key], `${path}.${key}`);
        else if (s.additionalProperties === false) issues.push({ path: `${path}.${key}`, code: "SCHEMA_UNKNOWN_PROPERTY", message: "is not allowed" });
      }
    }
  }
  visit(value, schema, rootPath);
  if (issues.length) throw new StructuralValidationError(issues);
  return value;
}
