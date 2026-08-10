# Edublogs Photo Album three-box contract

The existing Photo Album page connects to the repository-owned application through three page-local boxes. These files are deliberately small and contain no Photo Album application logic.

1. Paste `HTML-BOX.html` into the page's HTML box.
2. Paste `CSS-BOX.css` into the page's CSS box.
3. Replace `__IMMUTABLE_COMMIT_SHA__` in `JAVASCRIPT-BOX.js` with the full published commit SHA, then paste the result into the page's JavaScript box.

The JavaScript box loads the committed `bootstrap.js` release artifact from jsDelivr. That repository bootstrap loads the pinned production stylesheet and module and passes the permanent Worker manifest URL to the application.

The commit-SHA replacement is intentionally performed after publication because a commit cannot contain its own final hash. Never replace it with mutable `@main`.

Current permanent release directory:

```text
releases/photo-album/2026.08.10.2/
```

This directory is immutable after publication. Future changes receive a new release identifier.
