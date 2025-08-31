import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    port: 3000,
    allowedHosts: [
      ".ngrok-free.app", // Allow all ngrok subdomains
      "localhost",
    ],
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({ customViteReactPlugin: true }), // Place this before viteReact()
    viteReact(),
    tailwindcss(),
  ],
});
