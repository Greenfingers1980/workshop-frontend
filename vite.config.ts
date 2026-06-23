import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Full configuration for Vercel deployment and local development
export default defineConfig({
  // Ensures correct routing for React Router on Vercel
  base: "/",

  plugins: [react()],

  server: {
    fs: {
      allow: [".."], // allows access to parent directories if needed
    },
  },

  // ✅ Added build settings for Vercel compatibility
  build: {
    outDir: "dist", // Vercel expects the build output here
    assetsDir: "assets",
    sourcemap: false,
  },

  // ✅ Added resolve alias (optional but helpful for imports)
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
