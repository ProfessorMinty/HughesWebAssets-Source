import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const doorwayRoot = resolve(
  repositoryRoot,
  "docs/edublogs-integration/classroom-explorations-archive/2025-2026"
);
const port = Number(process.env.HRV_ARCHIVE_DOORWAY_PORT || 4177);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error("HRV_ARCHIVE_DOORWAY_PORT must be an integer from 1024 through 65535.");
}

const [html, css, javascript] = await Promise.all([
  readFile(resolve(doorwayRoot, "HTML-BOX.html"), "utf8"),
  readFile(resolve(doorwayRoot, "CSS-BOX.css"), "utf8"),
  readFile(resolve(doorwayRoot, "JAVASCRIPT-BOX.js"), "utf8")
]);
const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Archive CDN Doorway QA</title>
    <style>html,body{margin:0}</style>
    <style>${css}</style>
  </head>
  <body class="page-id-2627">
    <div id="page">
      <header id="masthead" class="site-header"></header>
      <div id="content" class="site-content container">
        <div id="primary" class="content-area">
          <main id="main" class="site-main">
            <article class="page hentry">
              <header class="entry-header"></header>
              <div class="entry-content">${html}</div>
              <footer class="entry-footer"></footer>
            </article>
          </main>
        </div>
        <aside id="secondary" class="widget-area"></aside>
      </div>
      <footer id="colophon" class="site-footer"></footer>
    </div>
    <script>${javascript}</script>
  </body>
</html>`;

const server = createServer((request, response) => {
  if (request.method !== "GET" || request.url !== "/") {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  response.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(page);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`[archive-doorway-preview] http://127.0.0.1:${port}/`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
