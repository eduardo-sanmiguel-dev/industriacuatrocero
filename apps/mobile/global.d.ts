// <reference types="nativewind/types" />
/// <reference types="expo/types" />

// 🚀 SOPORTE MAESTRO DE RECURSOS GRÁFICOS:
// Permite que Expo maneje e importe imágenes sin que TypeScript rompa el tipado
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg";
declare module "*.webp";

// 🌐 COMPATIBILIDAD CON ARQUITECTURA HÍBRIDA (MONOREPO):
// Mantiene a salvo el compilador nativo en caso de cruzar referencias estéticas de la web
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "@global.css" {
  const content: any;
  export default content;
}
