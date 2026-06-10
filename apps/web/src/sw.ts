/// <reference lib="webworker" />

import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
// 🚀 CAMBIO CLAVE: Importamos NetworkOnly en lugar de NetworkFirst
import { NetworkOnly } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope;

// Inyección automática de archivos estáticos que realiza Vite (HTML, JS, CSS)
precacheAndRoute(self.__WB_MANIFEST);

// 🔒 BLINDAJE ABSOLUTO DE RED:
// Le prohibimos terminantemente al Service Worker guardar en caché o adivinar
// cualquier petición que empiece con la palabra "/api".
// La PWA se apartará y obligará al navegador a ir siempre a internet a consultar a Nginx.
registerRoute(
  ({ url }: { url: URL }) => url.pathname.startsWith("/api"),
  new NetworkOnly(), // ⚡ Internet puro. Cero intervención de la caché local.
);

// Escuchar el mensaje de actualización manual de React
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Ejemplo 2: Controlar las notificaciones Push globales de tu SaaS (Hada / Trujillo)
/* self.addEventListener("push", (event) => {
  const data = event.data
    ? event.data.json()
    : { title: "Synergy SaaS", body: "Nueva actualización" };

  (self as any).registration.showNotification(data.title, {
    body: data.body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
  });
});
 */
