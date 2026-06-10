import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(() => {
  return {
    plugins: [
      tailwindcss(),
      react(),
      VitePWA({
        strategies: "injectManifest", // 🚀 ACTIVACIÓN: Control de código nativo
        srcDir: "src", // Carpeta donde vivirá tu archivo
        filename: "sw.ts", // Nombre de tu archivo fuente de control (puede ser .ts o .js)
        registerType: "prompt",
        injectManifest: {
          // Le indica a Workbox qué archivos compilar en producción
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          // 🔒 Evita que el Service Worker intente generar hashes corruptos si la API responde lento
          dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
        },
      }),
    ],
  };
});
