module.exports = {
  apps: [
    {
      name: "industriacautrocero",
      // 🚀 SOLUCIÓN: Como 'cwd' ya te mete a /apps/api, el script está directo en dist/main.js
      script: "dist/main.js",
      cwd: "./apps/api", // Te posiciona en la carpeta del backend primero
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "3G",

      // 📈 LOGS CENTRALIZADOS (Subimos un nivel con ../.. para que se guarden en la raíz real del monorrepo)
      error_file: "../../logs/api-error.log",
      out_file: "../../logs/api-out.log",
      time: true,
    },
  ],
};
