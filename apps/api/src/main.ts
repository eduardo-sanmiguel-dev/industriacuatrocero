import { NestFactory } from '@nestjs/core';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AppModule } from './app.module';
import { env } from './env';
import { VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // 🚀 Habilita la lectura automática de cookies seguras

  // 1. Asigna el prefijo global básico (solo 'api')
  app.setGlobalPrefix('api');

  // 2. 🚀 ACTIVA EL VERSIONADO NATIVO POR URI
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1', // Hace que por defecto todo sea v1
  });

  // 1. Definir los orígenes permitidos
  const whitelist = env.CORS_WHITELIST;

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Las Apps Móviles (Expo) y herramientas como Postman/Insomnia
      // no envían la cabecera 'origin' (es undefined).
      // Si es undefined o está en la whitelist, permitimos el acceso.
      if (!origin || whitelist.includes(origin)) {
        return callback(null, true);
      }

      // --- AQUÍ ENTRA LA MAGIA PARA EL MULTI-TENANT ---
      // Esta Regex valida que el origen empiece con http:// o https://
      // y termine exactamente en .industriacuatrocero.com o sea el dominio raíz.
      const tenantRegex =
        /^https?:\/\/(?:[a-z0-9-]+\.)*industriacuatrocero\.com$/i;

      if (tenantRegex.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por políticas de CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // ¡Crucial! Permite el envío de cookies HttpOnly y cabeceras de autenticación
    allowedHeaders: 'Content-Type, Accept, Authorization',
  };

  // 2. Habilitar CORS con configuración híbrida (Web + Mobile)
  app.enableCors(corsOptions);

  await app.listen(env.PORT);
  console.log(`API corriendo en: http://localhost:${env.PORT}`);
}

bootstrap().catch((err) => console.error('Error al iniciar la API:', err));
