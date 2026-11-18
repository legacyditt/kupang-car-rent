import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ["gsap", "gsap/ScrollTrigger", "@gsap/react"],
          motion: ["motion/react", "motion/react-m"],
          router: ["@tanstack/react-router"],
        },
      },
    },
  },
});

