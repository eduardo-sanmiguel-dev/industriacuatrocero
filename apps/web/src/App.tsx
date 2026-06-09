import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const LoginPage = () => {
  const { updateServiceWorker } = useRegisterSW({
    onNeedRefresh() {
      console.log(
        "✨ Nueva versión detectada en producción. Actualizando portal de Synergy...",
      );
      // 🔄 Fuerza la recarga física de la ventana del navegador aplicando los últimos cambios del deploy
      window.location.reload();
    },
    onOfflineReady() {
      console.log(
        "📲 Aplicación multi-tenant lista para operar fuera de línea (Offline).",
      );
    },
  });

  useEffect(() => {
    // 🧠 POLLING DEFENSIVO: Cada 5 minutos le pregunta al servidor si subiste un nuevo deploy,
    // garantizando que si el operador de Trujillo deja la pantalla abierta todo el día, se actualice sola.
    const interval = setInterval(
      () => {
        updateServiceWorker(true);
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [updateServiceWorker]);

  return <div>Coraje Perro</div>;
};

export default LoginPage;

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
