import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/", // 👈 ensures correct routing on Vercel
  plugins: [react()],
  server: {
    fs: {
      allow: [".."],
    },
  },
});

