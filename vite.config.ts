import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "lucide-react": path.resolve(
        __dirname,
        "node_modules/lucide-react/dist/esm/icons/index.js"
      ),
    },
  },
  optimizeDeps: {},
});
