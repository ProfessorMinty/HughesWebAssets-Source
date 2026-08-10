# Hughes Room Views Photo Album design authority

This document records the approved product and visual direction for the permanent Photo Album.

## Authority order

When implementation and design disagree, use this order:

1. Arctic's stated product intent and Poppet's approved design choices.
2. The project architecture and UX decisions documented here and in the governing Hughes Room Views architecture records.
3. Observed behavior on the real Edublogs host.
4. Current repository code.

Repository code is an implementation of the design. It is not the source of truth for the design itself. Existing code may be refined or replaced when it diverges from the approved experience.

## Approved visual direction

The approved direction is based on the B1Pro concept with restrained C1Pro ornamentation.

- Keep the page light, spacious, contemporary, and easy to read.
- Keep the large featured/current-memory hero as the visual centerpiece.
- Keep the four current albums in a clean horizontal row on wide screens.
- Give each album a distinct identity instead of four generic matching cards.
- Borrow pumpkin, science, mushroom, zinnia, and similar subject ornamentation in a toned-down form.
- Concentrate the magical layer around the hero, subtle glow, tiny sparkles, glass depth, and interaction states.
- Do not turn the upper page into a giant portal, gear, or spectacle that competes with the photographs.
- Keep a deliberate Previous Year Memories control/doorway.

The B1Pro reference controls the optical language of the hero: luminous cyan/lilac atmosphere, layered translucent glass, inner rim lighting, soft bloom, photographic depth, and a dominant current memory floating inside a stable glass object. A pale translucent rectangle by itself is not sufficient glassmorphism.

The C1Pro reference controls the subject-identity layer: pumpkin/vine corner work, science/atom/constellation geometry, mushroom/fern woodland ornament, and zinnia/floral framing. These details are borrowed into the clean B1Pro card chassis rather than turning the entire page into the C1Pro portal scene.

## Featured Memories carousel contract

Poppet explicitly approved the carousel direction.

The hero is a real carousel, not a slideshow wearing carousel controls.

Its visual model is:

`restrained previous memory ← dominant current memory → restrained next memory`

The center image is always the dominant photograph. Previous and next memories remain visibly present as quieter previews so the structure is immediately understandable.

The carousel draws from the selected school-year photo pool and uses a randomized in-memory order for the visit. It should:

- rotate automatically while the page is active;
- keep rotating when a mouse pointer happens to rest over it;
- not become silently or permanently paused because focus, theme behavior, viewport-observer state, or hidden environment heuristics changed;
- provide a visible Pause/Resume control;
- reset its autoplay clock after manual Previous/Next navigation;
- allow Previous, Next, side-preview clicks, swipe, and arrow-key navigation;
- open the current center image in the lightbox;
- visibly move persistent photographs through previous/current/next positions;
- recycle an offscreen slide only after its travel has completed;
- never replace a visible photograph mid-transition;
- never use a stage-wide white flash or wipe to disguise an image replacement.

Full-motion transitions should feel smooth and photographic rather than snappy. The center photograph moves laterally while receding, the incoming side photograph simultaneously moves forward, enlarges, sharpens, brightens, and gains luminous depth, and the next far memory enters behind the active plane. The glass shell remains visually stable while the photographs move inside it.

### Motion-control law

Do not implement a hidden alternate reduced-motion carousel mode without a visible product control representing that mode.

The launch carousel uses the explicit Pause/Resume control as its user-facing motion control. Do not add a `prefers-reduced-motion` branch that silently replaces the approved carousel travel with a different presentation while no Full/Reduced motion setting exists in the interface.

If a future release adds reduced-motion behavior, expose a clear user-facing control such as `Motion: Full / Reduced`, remember the user's choice, document the behavior, and test both modes explicitly.

## Album row

The four current albums should read as one clean family while retaining distinct themed identities. Card geometry and typography stay coherent, while each subject receives its own restrained ornamental frame and color language.

The current intended theme language is:

- harvest / pumpkin: warm gold-orange, pumpkin and vine corner work;
- discovery / science: blue-lilac, atom, gear, constellation, or geometric linework;
- woodland / mushroom: sage/forest, mushrooms, ferns, curved botanical detail;
- garden / zinnia: rose/floral, blooms, stems, and leaf detail;
- constellation fallback: violet-blue celestial linework.

## School-year home and archive contract

An archived school year is not a list page. It is a nested Photo Album front page using the same permanent Year Home component as the current school year.

Selecting an older year must provide the same visual and interaction chassis:

- hero copy appropriate to that year;
- Featured Memories carousel populated from that year's photographs;
- that year's album row and themed album cards;
- View All Photos for that year;
- album routes for that year;
- gallery/lightbox behavior shared with the current year;
- a clear doorway back to the current year and to the year index.

This is launch-critical because a new current school year can legitimately begin with zero photographs while the prior-year archive remains the rich populated Photo Album experience families can explore.

The current-year empty state should therefore feel intentional and should lead visitors toward the most recent published archive when one exists.

## Visual release gate

Automated tests, TypeScript, a successful Vite build, and correct DOM structure are necessary but cannot approve the Photo Album presentation.

Before a Photo Album home release is promoted to the live Edublogs page, visually compare it against the approved B1Pro and C1Pro references and answer all of the following:

- Does the hero immediately read as layered glass rather than a pale card?
- Is the current photograph unquestionably the visual centerpiece?
- Can a viewer visibly follow a photograph traveling side → center → side?
- Does the motion feel smooth, dimensional, and photographic rather than like a swap, flash, or resize trick?
- Do the album cards visibly carry their subject identities while still reading as one family?
- Does the magical layer support the photographs rather than overpower them?
- Is typography comfortably readable?
- Would Arctic be comfortable placing the live result directly beside the reference concepts shown to Poppet?

If the final answer is no, the presentation is not finished regardless of test status.
