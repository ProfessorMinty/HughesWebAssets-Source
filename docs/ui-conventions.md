# Hughes Room Views repository UI conventions

## Readable semantic typography

Every repository-owned application must define and consume these semantic tokens inside its application root:

```css
--text-body
--text-ui
--text-secondary
--text-small
--text-eyebrow
--text-heading-small
--text-heading-medium
--text-heading-large
```

The normal desktop body baseline is 18px and the narrow/mobile baseline is 17px. Interface controls remain at least 16px, secondary text remains at least 16px, and intentionally subordinate metadata or eyebrow text remains at least 15px. Components must use semantic tokens instead of inventing isolated fractional `rem` sizes.

The scale should feel comfortable, open, parent-friendly, classroom-friendly, and legible at a normal desktop viewing distance. Headings may be expressive, but supporting controls and metadata must never collapse into dashboard-sized text.

## Application-island ownership

Hughes Room Views styles must remain inside the repository application root. Critical image, modal, button, grid, box-sizing, overflow, and typography contracts may use stronger scoped rules when needed to resist WordPress or theme interference. Do not reset or restyle the surrounding Edublogs document.

The only permitted document-level presentation state is a temporary modal scroll lock on `html` and `body`. It must snapshot and restore prior inline values and the exact scroll position when the modal closes.
