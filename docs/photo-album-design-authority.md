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
- Concentrate the magical layer around the hero, subtle glow, tiny sparkles, and interaction states.
- Do not turn the upper page into a giant portal, gear, or spectacle that competes with the photographs.
- Keep a deliberate Previous Year Memories control/doorway.

## Featured Memories carousel contract

Poppet explicitly approved the carousel direction.

The hero is a real carousel, not a slideshow wearing carousel controls.

Its visual model is:

`restrained previous memory ← dominant current memory → restrained next memory`

The center image is always the dominant photograph. Previous and next memories remain visibly present as quieter previews so the structure is immediately understandable.

The carousel draws from the current-year photo pool and uses a randomized in-memory order for the visit. It should:

- rotate automatically while the hero is visible and the page is active;
- keep rotating when a mouse pointer happens to rest over it;
- not become permanently paused merely because a pointer click left focus on a carousel control;
- pause for intentional keyboard focus so keyboard users are not fighting moving content;
- reset its autoplay clock after manual Previous/Next navigation;
- allow Previous, Next, side-preview clicks, and arrow-key navigation;
- open the current center image in the lightbox;
- visibly move previous/current/next through their positions during full-motion transitions;
- use a calm crossfade rather than spatial movement when reduced motion is requested;
- preserve reduced-motion support without disabling the carousel's content rotation entirely.

Full-motion transitions should feel smooth and photographic rather than snappy. The intended movement is a gentle glide with restrained depth, scale, opacity, and glow changes. The magic supports the photograph rather than overpowering it.

## Album row and archive doorway

The four current albums should read as one clean family while retaining distinct themed identities. Ornamentation may vary by subject, but card structure stays coherent.

Previous Year Memories is a permanent, deliberate doorway. It remains visible even when historical manifests are not yet populated, and it must not invent historical content.
