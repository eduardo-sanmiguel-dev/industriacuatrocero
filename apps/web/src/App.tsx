import { useEffect, useState } from "react";
// 🌎 CONTRATO MONOREPO: Importamos la interfaz pública desde tu paquete compartido
import { TenantPublicBrandResponse } from "@synergy/types";
import { api } from "./api"; // Tu ApiClient instanciado con Axios

export default function App() {
  // Estado tipado para almacenar la respuesta estética del Tenant
  const [brandJson, setBrandJson] = useState<TenantPublicBrandResponse | null>(
    null,
  );
  const [errorLog, setErrorLog] = useState<string | null>(null);

  useEffect(() => {
    // 1. 🔍 REGLA MULTI-TENANT DE RED: Extraemos el Host actual del navegador web
    const host = window.location.host; // Ejemplo: '://synergy.com' o 'localhost:5173'
    const subdomain = host.split(".")[0] || "";

    // 💡 ESCAPE DE DESARROLLO LOCAL: Si estás programando en localhost,
    // forzamos el subdominio 'trujillo' para que el script no falle al no encontrar el prefijo.
    const targetSubdomain =
      subdomain === "localhost" || subdomain === "127" ? "trujillo" : subdomain;

    // 2. 🚀 LLAMADA AL ENDPOINT MAESTRO PÚBLICO:
    // Invocamos la ruta definitiva mapeada por tu RouterModule de NestJS
    api
      .get<TenantPublicBrandResponse>(
        `/core/tenants/subdomain/${targetSubdomain}/brand`,
      )
      .then((data) => {
        // Almacenamos el JSON recibido con éxito (200 OK)
        setBrandJson(data);
      })
      .catch((err: unknown) => {
        console.error("Error en el descubrimiento del Tenant:", err);
        setErrorLog(
          "No se pudo conectar con el servidor o el subdominio no existe.",
        );
      });
  }, []);

  // 🎨 RENDERIZACIÓN DE AUDITORÍA VISUAL (JSON IMPRESO EN TIEMPO REAL)
  return (
    <div
      style={{
        padding: "24px",
        fontFamily: "monospace",
        backgroundColor: "#1e1e1e",
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ color: "#4F46E5" }}>
        🛡️ Synergy SaaS - Control de Descubrimiento Multi-tenant
      </h2>
      <p style={{ color: "#aaa" }}>
        Origen de red detectado:{" "}
        <strong style={{ color: "#fff" }}>{window.location.host}</strong>
      </p>
      <hr style={{ borderColor: "#333", margin: "20px 0" }} />

      {errorLog && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#7a1a1a",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        >
          ❌ {errorLog}
        </div>
      )}

      {brandJson ? (
        <div>
          <h4 style={{ color: "#2ecc71" }}>
            ✅ Respuesta Exitosa del Servidor (JSON Puro):
          </h4>
          {/* 🚀 IMPRESIÓN DEL JSON: El formato (null, 2) fuerza a React a pintar el objeto indentado */}
          <pre
            style={{
              backgroundColor: "#2d2d2d",
              padding: "16px",
              borderRadius: "6px",
              overflowX: "auto",
              border: "1px solid #444",
              fontSize: "14px",
            }}
          >
            {JSON.stringify(brandJson, null, 2)}
          </pre>
        </div>
      ) : (
        <div style={{ color: "#f1c40f" }}>
          ⏳ Consultando metadatos de Marca Blanca a la API...
        </div>
      )}
    </div>
  );
}
