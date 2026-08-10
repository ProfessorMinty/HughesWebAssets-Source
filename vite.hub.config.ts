import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const appRoot = fileURLToPath(new URL("./apps/classroom-explorations-hub", import.meta.url));
const entry = fileURLToPath(new URL("./apps/classroom-explorations-hub/src/entry.ts", import.meta.url));

export default defineConfig({
  root: appRoot,
  publicDir: "public",
  build: {
    outDir: fileURLToPath(new URL("./dist/classroom-explorations-hub", import.meta.url)),
    emptyOutDir: true,
    sourcemap: true,
    target: "es2022",
    rollupOptions: {
      input: entry,
      preserveEntrySignatures: "exports-only",
      output: {
        format: "es",
        entryFileNames: "assets/classroom-explorations-hub.js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) =>
          assetInfo.names.some((name) => name.endsWith(".css"))
            ? "assets/classroom-explorations-hub.css"
            : "assets/[name]-[hash][extname]",
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 4183,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4184,
    strictPort: true,
  },
});
