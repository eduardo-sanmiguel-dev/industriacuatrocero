import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export default function App() {
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  // 🧠 CAPA DE CONTROL DE LA PWA
  const {
    needRefresh: [, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onNeedRefresh() {
      // 🔥 EVENTO DETECTADO: El navegador ya descargó el nuevo deploy en segundo plano,
      // pero la versión vieja sigue corriendo de forma segura para no interrumpir al usuario.
      console.log("✨ Existe una nueva actualización lista en el servidor.");
      setShowUpdateBanner(true); // Encendemos nuestro banner personalizado de React
    },
    onOfflineReady() {
      console.log("📲 La aplicación ya puede operar sin conexión a internet.");
    },
  });

  useEffect(() => {
    // 🔍 VIGILANTE CONSTANTE: Le pregunta al servidor cada 5 minutos si hay un nuevo deploy.
    // Al estar en modo 'prompt', solo descargará los bytes nuevos sin romper nada.
    const interval = setInterval(
      () => {
        updateServiceWorker(false); // Pasamos 'false' para que verifique silenciosamente
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [updateServiceWorker]);

  /**
   * 🚀 DISPARADOR DEL CONTROL: El usuario decide aplicar la actualización
   */
  const handleApplyUpdate = () => {
    // 1. Le ordena al Service Worker en espera que tome el control, limpie la caché vieja y se active
    updateServiceWorker(true);

    // 2. Apagamos el banner de la interfaz
    setShowUpdateBanner(false);
    setNeedRefresh(false);

    // 3. Forzamos la recarga física limpia de la pestaña para que asimile el último build de producción
    window.location.reload();
  };

  return (
    <div style={{ padding: "20px", position: "relative" }}>
      <h1>Test Synergy SaaS - Portal Corporativo</h1>
      <p>Bienvenido al sistema de administración de Capital Humano.</p>

      {/* 🎨 TU BANNER DE MARCA BLANCA PERSONALIZADO */}
      {showUpdateBanner && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "var(--primary-color, #4F46E5)",
            color: "#fff",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <span>
            📢 Hay una nueva actualización disponible con mejoras para tu
            organización.
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleApplyUpdate}
              style={{
                backgroundColor: "#fff",
                color: "#000",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Actualizar Ahora
            </button>
            <button
              onClick={() => setShowUpdateBanner(false)}
              style={{
                backgroundColor: "transparent",
                color: "#fff",
                border: "1px solid #fff",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Más tarde
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* import { useEffect, useState } from "react";
// 🚀 CONTRATO MONOREPO: Importamos la interfaz exacta del perfil compartido
import { UserProfileResponse } from "@synergy/types";
import { api } from "./api"; // Tu cliente instanciado

export default function App() {
  // 🧠 ESTADO TIPIFICADO: Almacena la estructura completa devuelta por el endpoint /auth/me
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);

  useEffect(() => {
    // 🌐 CONSULTA DIRECTA: Invocamos el endpoint privado usando el método HTTP genérico
    api
      .get<UserProfileResponse>("/auth/me")
      .then((data) => {
        // Guardamos el payload unificado (User + Tenant)
        setProfile(data);
      })
      .catch((err: unknown) => {
        // 🔒 TIPADO DEFENSIVO: Declaramos 'err: unknown' para eliminar el error implicitAny del linter
        console.error("Error al recuperar el perfil de la sesión:", err);
      });
  }, []);

  // 🎨 RENDERIZACIÓN ADAPTADA A RECURSOS HUMANOS (HCM)
  // Si 'profile' existe, extraemos dinámicamente sus propiedades limpias
  return profile ? (
    <div>
      Hola, {profile.user.firstName} {profile.user.lastName} 
      <small style={{ display: 'block', color: '#666' }}>
        Organización: {profile.tenant.subdomain}
      </small>
    </div>
  ) : (
    <div>Cargando sesión corporativa...</div>
  );
}
 */
