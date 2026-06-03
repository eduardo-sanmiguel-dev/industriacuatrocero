const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Encuentra la raíz del proyecto móvil y la raíz del monorepo entero
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Le dice a Metro que vigile también la carpeta raíz del monorepo
config.watchFolders = [workspaceRoot];

// 2. Fuerza a Metro a buscar dependencias en el node_modules local y el global
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
