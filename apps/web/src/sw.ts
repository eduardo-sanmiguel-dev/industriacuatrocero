/// <reference lib="webworker" />

import { precacheAndRoute } from "workbox-precaching";
// 🚀 Las importaciones ahora serán 100% reconocidas tras el comando pnpm add
import { registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope;

// Inyección automática que realiza Vite en el build de producción
precacheAndRoute(self.__WB_MANIFEST);

// 🔒 REGLA DE EXCLUSIÓN DEFINITIVA MULTI-TENANT:
// Evitamos que el Service Worker intente cachear o interceptar consultas de datos,
// garantizando que las llamadas a /api/v1/core/... viajen directo a internet en tiempo real.
registerRoute(
  // 🚀 SOLUCIÓN AL ERROR IMPLICIT 'ANY': Tipamos explícitamente el parámetro desestructurado como URL nativa
  ({ url }: { url: URL }) => url.pathname.startsWith("/api"),
  new NetworkFirst(), // Forzamos a que consulte siempre al servidor NestJS primero
);

// Escuchar cuando el usuario presiona "Actualizar Ahora" desde React
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting(); // Fuerza la muerte inmediata de la caché e instala la nueva versión
  }
});

// Escuchar cuando el usuario presiona "Actualizar Ahora" desde React
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting(); // Obliga al Service Worker viejo a morir inmediatamente
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
