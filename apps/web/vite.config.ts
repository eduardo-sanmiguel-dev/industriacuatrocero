import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command }) => {
  return {
    plugins: [
      react(),
      VitePWA({
        // Desactiva el Service Worker en desarrollo para que no guarde caché corrupta
        disable: command === "serve",
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
        manifest: {
          name: "Synergy Core",
          short_name: "Synergy",
          description: "Mi increíble aplicación monorepo",
          theme_color: "#ffffff",
          icons: [
            {
              src: "vite.svg", // Puedes usar los iconos que ya tienes en public/
              sizes: "192x192",
              type: "image/svg+xml",
            },
            {
              src: "typescript.svg",
              sizes: "512x512",
              type: "image/svg+xml",
            },
          ],
        },
      }),
    ],
  };
});
