import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const appRoot = fileURLToPath(new URL("./apps/photo-album", import.meta.url));

export default defineConfig({
  root: appRoot,
  base: "./",
  publicDir: "public",
  build: {
    outDir: fileURLToPath(new URL("./dist/photo-album", import.meta.url)),
    emptyOutDir: true,
    sourcemap: true,
    target: "es2022",
    rollupOptions: {
      output: {
        entryFileNames: "assets/photo-album.js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) =>
          assetInfo.names.some((name) => name.endsWith(".css"))
            ? "assets/photo-album.css"
            : "assets/[name]-[hash][extname]",
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4174,
    strictPort: true,
  },
});
