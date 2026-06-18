// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward /api/* → Flask on port 5000 (no CORS issues in dev)
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
});
