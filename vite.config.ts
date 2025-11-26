import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    // GitHub Pages under /NeuroPilot-AICC/
    // (You can keep the ternary, but locking it avoids surprises)
    base: "/NeuroPilot-AICC/",

    // Prefer Vite's import.meta.env with VITE_* keys
    // Remove this whole "define" block after you migrate to VITE_*.
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        // '@' => project root (C:/.../NeuroPilot-AICC)
        // why: your files are at ./components, ./constants, ./App.tsx, not under ./src
        "@": path.resolve(__dirname, "."),
      },
    },

    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: true,
    },
  };
});
