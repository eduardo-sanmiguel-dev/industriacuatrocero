import React, { useEffect, useState } from "react";
import {
  Factory,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import { useTenantBrand } from "./hooks/useTenantBrand";
import { useTenantBrandStore } from "./store/tenantBrand.store";
import { isDevelopment } from "./env";

const DEFAULT_BRAND = {
  companyLegalName: "CORE OS",
  loginWelcomeText:
    "Plataforma de operación, trazabilidad e integridad de recursos para plantas de manufactura de alta capacidad con control inmediato en tiempo real.",
  primaryColor: "#2563eb",
  sidebarBgColor: "#0f172a",
  logoUrl: null as string | null,
  faviconUrl: null as string | null,
};

function resolveText(value: string | null | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function applyFavicon(href: string | null) {
  if (!href) return;

  const selector = 'link[rel="icon"]';
  let link = document.querySelector<HTMLLinkElement>(selector);

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.append(link);
  }

  link.href = href;
}

export default function LoginPage() {
  const brandJson = useTenantBrandStore((state) => state.tenantBrand);
  const brandError = useTenantBrandStore((state) => state.tenantBrandError);
  const brandLoading = useTenantBrandStore((state) => state.tenantBrandLoading);
  const selectedTenantSubdomain = useTenantBrandStore(
    (state) => state.selectedTenantSubdomain,
  );
  const setSelectedTenantSubdomain = useTenantBrandStore(
    (state) => state.setSelectedTenantSubdomain,
  );

  const { availableTenants, isLoadingTenants, needsTenantSelection } =
    useTenantBrand();

  // Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Interface State
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const brand = brandJson?.brand;
  const companyName = resolveText(
    brand?.companyLegalName,
    DEFAULT_BRAND.companyLegalName,
  );
  const welcomeText = resolveText(
    brand?.loginWelcomeText,
    DEFAULT_BRAND.loginWelcomeText,
  );
  const primaryColor = resolveText(
    brand?.primaryColor,
    DEFAULT_BRAND.primaryColor,
  );
  const sidebarBgColor = resolveText(
    brand?.sidebarBgColor,
    DEFAULT_BRAND.sidebarBgColor,
  );
  const logoUrl = brand?.logoUrl?.trim() || DEFAULT_BRAND.logoUrl;
  const faviconUrl = brand?.faviconUrl?.trim() || DEFAULT_BRAND.faviconUrl;

  useEffect(() => {
    document.title = `${companyName} | Acceso`;
    applyFavicon(faviconUrl);
  }, [companyName, faviconUrl]);

  const brandVars = {
    ["--brand-primary" as const]: primaryColor,
    ["--brand-sidebar" as const]: sidebarBgColor,
  } as React.CSSProperties;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validación básica: Cualquier correo y contraseña no vacíos son válidos
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Por favor complete todos los campos obligatorios.");
      return;
    }

    setLoading(true);
    setLoadingStep(1);

    // Simulación de conexión estable directa
    setTimeout(() => {
      setLoadingStep(2);
      setTimeout(() => {
        setLoading(false);
        setAuthSuccess(true);
        setLoadingStep(0);
      }, 900);
    }, 800);
  };

  const resetState = () => {
    setAuthSuccess(false);
    setUsername("");
    setPassword("");
    setErrorMsg(null);
  };

  return (
    <div
      id="saas-login-container"
      style={brandVars}
      className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col lg:flex-row relative overflow-hidden select-none selection:bg-blue-600 selection:text-white"
    >
      {/* Refined Ambient Orbs (Immersive UI style) */}
      <div className="absolute top-[-20%] left-[-10%] w-150 h-150 bg-blue-900/10 rounded-full blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-125 h-125 bg-cyan-950/20 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* ========================================================================================= */}
      {/* LEFT PANEL - Quiet, Premium, Elegant Typography (Minimalist) */}
      {/* ========================================================================================= */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[48%] relative flex-col justify-between p-16 xl:p-24 border-r border-slate-900 bg-slate-950/80 z-10"
        style={{ backgroundColor: sidebarBgColor }}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl shadow-lg flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="h-5 w-5 object-contain"
              />
            ) : (
              <Factory className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <span className="font-extrabold tracking-wider text-lg bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
              {companyName}
            </span>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
              {brandLoading ? "CARGANDO MARCA" : "PLATAFORMA SAAS"}
            </p>
          </div>
        </div>

        {/* Big quiet typography */}
        <div className="my-auto max-w-sm">
          <h1 className="text-4xl xl:text-5xl font-light tracking-tight leading-[1.12] text-white">
            Industria 4.0 <br />
            <span className="font-semibold" style={{ color: primaryColor }}>
              impulsada por IA.
            </span>
          </h1>
          <p className="mt-6 text-slate-400 tracking-wide leading-relaxed text-sm">
            {welcomeText}
          </p>
          {brandError && (
            <p className="mt-4 text-[11px] text-amber-300 font-mono leading-relaxed">
              No se pudo cargar la marca del tenant. Se usará el estilo por
              defecto.
            </p>
          )}
        </div>

        {/* Minimal compliance sign-off */}
        <div className="text-[11px] font-mono text-slate-650 flex items-center gap-6">
          <span>© 2026 {companyName}</span>
          <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACCESO SEGURO ACTIVADO
          </span>
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* RIGHT PANEL - Streamlined Minimalist Credentials Panel */}
      {/* ========================================================================================= */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-16 xl:p-24 relative z-10 bg-white text-slate-800">
        {/* Mobile Display Logo Only */}
        <div className="flex lg:hidden items-center gap-2 absolute top-8 left-8">
          <div
            className="p-2 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="h-4 w-4 object-contain"
              />
            ) : (
              <Factory className="h-4 w-4 text-white" />
            )}
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900 tracking-wide">
              {companyName}
            </span>
            <span
              className="text-[8px] font-mono block font-bold tracking-widest"
              style={{ color: primaryColor }}
            >
              INDUSTRIAL v4.8
            </span>
          </div>
        </div>

        {/* Central Card Form Area */}
        <div className="w-full max-w-85 mx-auto my-auto py-4">
          {!authSuccess ? (
            <div className="space-y-6 animate-fade-in-up">
              {isDevelopment && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                  <p className="text-[10px] font-bold tracking-wider uppercase text-slate-600">
                    Selector de tenant (solo desarrollo)
                  </p>
                  <select
                    value={selectedTenantSubdomain ?? ""}
                    onChange={(e) => {
                      setSelectedTenantSubdomain(e.target.value || null);
                    }}
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 outline-none focus:border-slate-500"
                  >
                    <option value="">Selecciona un tenant registrado</option>
                    {availableTenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.subdomain}>
                        {tenant.commercialName || tenant.name} (
                        {tenant.subdomain})
                      </option>
                    ))}
                  </select>
                  {isLoadingTenants && (
                    <p className="text-[11px] text-slate-500">
                      Cargando tenants registrados...
                    </p>
                  )}
                </div>
              )}

              {/* Titles */}
              <div>
                {logoUrl && (
                  <div className="mb-4 flex w-full items-center justify-center">
                    <img
                      src={logoUrl}
                      alt={`${companyName} logo`}
                      className="h-auto w-auto max-h-14 sm:max-h-16 lg:max-h-32 max-w-56 sm:max-w-64 lg:max-w-lg object-contain"
                    />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-1">
                  Acceso Industrial
                </h2>
                {brandLoading ? (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Cargando identidad visual del tenant...
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-1">
                    {companyName}
                  </p>
                )}
              </div>

              {/* Validation warnings */}
              {errorMsg && (
                <div className="p-3 rounded-xl border border-rose-100 bg-rose-50 text-rose-800 text-xs flex items-start gap-2.5 animate-headshake">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block text-[11px]">
                      Error de verificación
                    </strong>
                    <span className="text-[10.5px] block text-rose-700 leading-tight">
                      {errorMsg}
                    </span>
                  </div>
                </div>
              )}

              {/* Main Compact Input Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ID / Email Fields */}
                <div className="space-y-1">
                  <label
                    htmlFor="user-id"
                    className="text-[10px] font-bold tracking-wider text-slate-500 uppercase"
                  >
                    Identificación corporativa o correo
                  </label>
                  <div className="relative">
                    <input
                      id="user-id"
                      type="text"
                      disabled={loading}
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder="usuario@empresa.com"
                      className="w-full h-11 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 text-xs text-slate-900 placeholder-slate-400 rounded-lg pl-3 pr-8 outline-none transition-all duration-250"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className="text-[10px] font-bold tracking-wider text-slate-500 uppercase"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      disabled={loading}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder="Contraseña de seguridad"
                      className="w-full h-11 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 text-xs text-slate-900 placeholder-slate-400 rounded-lg pl-3 pr-10 outline-none transition-all space-y-1"
                    />
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 p-1 cursor-pointer transition-colors"
                      title={showPassword ? "Ocultar" : "Mostrar"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Extras */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-555 hover:text-slate-800 transition-colors select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 text-blue-600 bg-slate-50 border-slate-350 rounded focus:ring-offset-0 focus:ring-1 focus:ring-blue-500/20"
                    />
                    <span>Recordar sesión</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessToast(
                        "Protocolo de restablecimiento enviado a su supervisor.",
                      );
                      setTimeout(() => setSuccessToast(null), 4000);
                    }}
                    style={{ color: primaryColor }}
                    className="font-semibold cursor-pointer text-[10.5px]"
                  >
                    ¿Olvidó sus credenciales?
                  </button>
                </div>

                {/* Actions */}
                <div className="pt-2">
                  <button
                    type={
                      brandError || needsTenantSelection ? "button" : "submit"
                    }
                    disabled={loading || needsTenantSelection}
                    style={{ backgroundColor: primaryColor }}
                    className="w-full h-11 text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition-all duration-200 transform active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 relative overflow-hidden cursor-pointer"
                  >
                    {loading ? (
                      <div className="flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>
                          {loadingStep === 1 && "AUTORIZANDO..."}
                          {loadingStep === 2 && "CREANDO TÚNEL..."}
                        </span>
                      </div>
                    ) : needsTenantSelection ? (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <span>Selecciona un tenant</span>
                      </>
                    ) : !brandError ? (
                      <>
                        <span>Iniciar Sesión</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <span>Error de marca</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // --- COMPACT SUCCESS STATE ---
            <div className="text-center py-4 space-y-5 animate-fade-in-up">
              <div className="h-12 w-12 mx-auto rounded-full bg-emerald-100 border border-emerald-500/50 flex items-center justify-center mb-1">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 animate-pulse" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Conexión Establecida
                </h2>
                <p className="text-[11px] font-mono font-bold text-blue-600 mt-0.5 uppercase tracking-wide">
                  TÚNEL DE SEGURIDAD ESTABLECIDO
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] text-left space-y-2.5 shadow-2xs">
                <p className="text-slate-655 leading-relaxed font-semibold">
                  Acceso concedido exitosamente. Se han inicializado
                  correctamente todos los hilos logísticos y flujos de datos
                  remotos de su terminal corporativa.
                </p>

                <div className="border-t border-slate-200 pt-2.5 space-y-1.5 font-mono text-slate-550 text-[10.5px]">
                  <div className="flex justify-between">
                    <span>USUARIO:</span>
                    <span className="text-slate-900 font-bold">{username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ESTADO:</span>
                    <span className="text-emerald-700 font-bold uppercase">
                      CONECTADO
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>IDENTIFICADOR:</span>
                    <span className="font-bold" style={{ color: primaryColor }}>
                      CORE_TUNNEL_ESTABLISHED
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessToast(
                      "Descargando manifiesto SST de terminal...",
                    );
                    setTimeout(() => setSuccessToast(null), 3500);
                  }}
                  style={{ backgroundColor: primaryColor }}
                  className="w-full text-white text-xs py-2.5 rounded-lg font-bold font-mono shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                  <span>Descargar Manifiesto</span>
                </button>

                <button
                  type="button"
                  onClick={resetState}
                  className="text-slate-550 hover:text-slate-800 text-[11px] font-mono transition-all flex items-center justify-center gap-1 cursor-pointer mx-auto"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Volver</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating toast notifications */}
      {successToast && (
        <div
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl border bg-white text-slate-800 shadow-[0_10px_35px_rgba(0,0,0,0.12)] max-w-xs flex items-start gap-2.5 animate-toast-slide-in"
          style={{ borderColor: primaryColor }}
        >
          <div
            className="p-1 rounded shrink-0"
            style={{ backgroundColor: `${primaryColor}14` }}
          >
            <AlertCircle
              className="h-4.5 w-4.5"
              style={{ color: primaryColor }}
            />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-900 mb-0.5">
              AVISO DEL SISTEMA
            </p>
            <p className="text-[10.5px] text-slate-600 leading-normal font-semibold">
              {successToast}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
