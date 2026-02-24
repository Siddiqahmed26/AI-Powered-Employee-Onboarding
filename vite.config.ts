import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 8080,
    strictPort: true,
    open: true,
    hmr: {
      overlay: false,
    },
  },
  preview: {
    port: 8080,
    strictPort: true,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "lucide-react",
      "@tanstack/react-query",
      "recharts",
    ],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});