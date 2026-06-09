module.exports = {
  apps: [
    {
      name: "industriacuatrocero", // Nombre identificador del proceso en PM2
      script: "./apps/api/dist/main.js", // 🚀 Ejecuta directamente el JavaScript puro de NestJS compilado
      cwd: "./apps/api", // Directorio de ejecución de la API
      instances: 1, // 🔒 FIJO: Una sola instancia corriendo en el servidor
      exec_mode: "fork", // 🚀 MODO FORK: Hilo único directo, sin clúster ni duplicación de backend
      watch: false, // Desactivado para producción para evitar reinicios por logs
      max_memory_restart: "1G", // Protección defensiva si ocurre una fuga de memoria

      // 📈 LOGS CENTRALIZADOS EN LA RAÍZ
      error_file: "./logs/api-error.log",
      out_file: "./logs/api-out.log",
      time: true, // Agrega la estampa de tiempo UTC a los logs
    },
  ],
};
