# Edublogs integration — HRV global site shell

The permanent Hughes Room Views site shell is Source-owned at:

`apps/site-shell/`

The immutable browser release is:

`releases/site-shell/2026.08.14.1/`

The exact sitewide Edublogs loader is:

`global-site-shell-loader.html`

## Integration rule

Use **one** sitewide Custom HTML integration seam for this loader after the legacy Footer Left/Center/Right responsibilities have been migrated and verified.

It is acceptable for this new loader to occupy the same Edublogs widget area that formerly held Footer Center, but it is **not** the old Footer Center renamed. The old 36 KB compatibility stylesheet is deleted; the new seam contains only the small pinned loader shown here.

## What the loader fetches

- `site-shell.css`: shared header/navigation presentation only;
- `site-shell.js`: guarded global auto-scroll only.

The loader is pinned to exact repository commit `fe22709942b07002cd06d0034b508495f3321318`, which contains immutable shell release `2026.08.14.1`.

## Failure behavior

If the shell assets fail to load, normal Amadeus/base-theme behavior remains. Page applications keep their own independent integration and failure policies. The shell loader does not mount, repair, or replace any page application.

## Do not add here

- Home, Posts, Zinnia, Contact, Class Library, Bat, Hub, or Photo Album behavior;
- generic typography/form/button/widget rescue CSS;
- retired helper-navigation code;
- page-title suppression unless a future sitewide requirement is separately proven.
