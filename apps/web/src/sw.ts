// 🚀 BLINDAJE DE TIPADO SW: Le enseña a TypeScript las propiedades globales de los Service Workers
/// <reference lib="webworker" />

import { precacheAndRoute } from "workbox-precaching";

// 🤖 Declaramos el entorno global de forma estricta para el Service Worker
declare const self: ServiceWorkerGlobalScope;

// Inyección automática que realiza Vite en el build de producción
precacheAndRoute(self.__WB_MANIFEST);

// Resto de tu código nativo (Listeners, Push, etc.)...

// 🛠️ TU CÓDIGO NATIVO DEL SERVICE WORKER:
// A partir de aquí puedes controlar y programar lo que tú quieras en el navegador

// Ejemplo 1: Escuchar cuando el usuario presiona "Actualizar Ahora" desde React
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    (self as any).skipWaiting();
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
