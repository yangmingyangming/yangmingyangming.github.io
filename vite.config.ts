import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist/client",
    sourcemap: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("three") || id.includes("@react-three")) return "webgl";
          if (id.includes("gsap") || id.includes("lenis")) return "motion";
          if (id.includes("react") || id.includes("scheduler")) return "react";
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom/client", "three", "gsap"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.tsx"],
    },
  },
  plugins: [react()],
});
