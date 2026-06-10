import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      VitePWA({
        strategies: "injectManifest", // 🚀 ACTIVACIÓN: Control de código nativo
        srcDir: "src", // Carpeta donde vivirá tu archivo
        filename: "sw.ts", // Nombre de tu archivo fuente de control (puede ser .ts o .js)
        registerType: "prompt",
      }),
    ],
  };
});
