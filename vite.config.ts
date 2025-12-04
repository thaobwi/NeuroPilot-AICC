import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    // Must match the GitHub repo name
    base: "/NeuroPilot-AICC/",

    // Expose safe public keys only
    define: {
      // Keep your current exposure of env if your app reads process.env.*
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      // (FYI: the Vite-native way is import.meta.env.VITE_*)
    },

    resolve: {
      alias: {
        // If you prefer '@/...' to point to project root; change to 'src' if you want '@/components' from /src/components
        "@": path.resolve(__dirname, "."),
        // "@": path.resolve(__dirname, "src"),
      },
    },

    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: true,
    },
  };
});
