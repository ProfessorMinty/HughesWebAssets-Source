# Classroom Explorations Hub visual authority

## Governing rule

The permanent repository-backed Classroom Explorations Hub must preserve and modernize the actual Classroom Explorations museum. It must not reinterpret the Hub as a generic dashboard, card directory, or minimalist landing page.

Architecture may change. Content state may change. The museum identity remains the visual authority unless Arctic explicitly approves a later redesign.

## Authoritative museum evidence

The primary frozen source is the August 4 Edublogs recovery snapshot:

- repository: `ProfessorMinty/HughesEDUBlogsBackupsRepo`
- repository commit: `cd1df67c529b47c36ee7b7c527bfbd15e4cc76a8`
- file: `2026-08-04_03-38-08_backup/pages/classroom-explorations-17.html`
- blob SHA: `1bda6132c0ba3f54c637a1bcc7bd8dd8a09b6eb6`
- public route identity: `https://rmhughes.edublogs.org/classroom-explorations/`
- WordPress page ID: `17`

That source is historical evidence only. Production must not load code or data from the private backup repository.

## Museum elements that must survive modernization

The repository renderer and scoped CSS must preserve the recognizable system represented by the frozen source, including:

- `.hub-wrap` museum composition;
- atmospheric sky layers: stars, clouds, and aurora;
- floating exploration icon parade;
- museum entrance hero;
- animated compass badge and sweeping beam;
- `Museum Entrance • Greenhouse Glow • Discovery Hub` entrance identity;
- Classroom Explorations title and original curiosity/STEM subtitle;
- Inquiry, Teamwork, Creativity, and Real-World Science learning pillars;
- Exploration Oath;
- Museum at a Glance orientation panel;
- Welcome Theater;
- Featured Exhibit Hall treatment for the current Exploration;
- green/pink Zinnia greenhouse identity while Zinnia is current;
- purple Learning Lantern treatment for This Week We Learned;
- crystalline museum divider language;
- green Archive Gallery treatment for current-year Past Explorations;
- purple Learning Archive treatment for current-year Past TWWL;
- deliberate museum doorway treatment for prior school years;
- `Pack your curiosity—adventures await.` museum footer;
- rings, spores, sparkles, compass motion, atmospheric motion, and optional local celebration where accessible;
- responsive 3-column / 2-column / 1-column archive behavior;
- `prefers-reduced-motion` support.

The exact historical content inside those museum rooms is not frozen. The manifest determines current content.

## Approved 2026–2027 launch substitution

The museum is preserved while its content is updated to the already-approved permanent launch state:

1. Welcome Theater keeps the approved welcome video.
2. Current Exploration is `Summer Bloom Adoption Project` / Zinnia.
3. Current This Week We Learned is an intentional `Coming Soon` state until an approved recap exists.
4. Current-year Past Explorations begins empty.
5. Current-year Past TWWL begins empty.
6. Prior 2025–2026 content is not embedded as individual cards on the current Hub.
7. One `Last Year Content` / 2025–2026 museum doorway represents the separate archive destination until that archive is converted.

An empty current-year gallery is still rendered as a museum gallery wing. Empty data does not justify deleting the museum room.

## Deleted-widget migration contract

The old Edublogs widgets were removed before this repository conversion. Their saved source is migration evidence, not a runtime dependency.

Hub-specific behavior that the museum still needs must be moved into the permanent Hub architecture. In particular:

- hide the theme-generated duplicate WordPress page title for page 17;
- neutralize the Amadeus article/card shell where it prevents the full-width museum;
- make the page-17 content lane full width and remove the sidebar lane for this route;
- contain compatibility behavior to page 17 / the Hub root;
- keep the semantic fallback recognizable as Classroom Explorations rather than a bare error box.

These responsibilities belong in the page-local Edublogs compatibility bridge or repository-scoped Hub package, not in recreated global widgets.

## Explicitly retired behavior

Do not restore the old Footer Left Exploration Helper.

That helper scraped visible links from the Hub to infer Exploration/TWWL membership and previous/next navigation. It is incompatible with the permanent archive structure and the future child-page navigation model.

Also do not restore:

- fake public-looking celebration counts;
- permanent helper-hide localStorage state;
- Hub membership inferred from rendered DOM scraping;
- broad global CSS rescue rules merely because the deleted widgets once contained them;
- the old forced auto-scroll unless a later verified requirement explicitly reinstates it.

A local optional Celebrate animation is allowed. It must not imply shared state and must honor reduced motion.

## Permanent data/renderer boundary

The friendly Hub source remains authoritative for changing content:

`apps/classroom-explorations-hub/content/hub.source.json`

The normalizer validates and generates the strict browser manifest. The repository renderer maps that data into the preserved museum composition. Generated manifests and rendered HTML are outputs, not editing surfaces.

The future Hub Swapper must edit the friendly source transactionally and preserve this data/visual contract unless a separately approved redesign changes it.

## Regression guard

`tools/verify-classroom-explorations-hub-dist.mjs` intentionally checks for museum signatures in the production runtime/CSS and rejects the previously introduced generic replacement-card renderer signatures.

If that verifier fails because a museum signature disappears, do not weaken the verifier merely to make CI green. First determine whether the change was an explicitly approved museum redesign or accidental visual drift.
