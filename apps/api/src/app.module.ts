import { ServeStaticModule } from '@nestjs/serve-static';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { join } from 'path';

import { TypeOrmModule } from '@nestjs/typeorm';
import { env } from 'process';
import { isDevelopment, isProduction } from './env';
import { CoreModule } from './modules/core/core.module';
import { HcmModule } from './modules/hcm/hcm.module';
import { RouterModule } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { TenantMiddleware } from './common/middleware';
import { TenantContextModule } from './common/context/tenant-context.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../..', 'apps', 'web', 'dist'),
      //exclude: ['/api/*path'],
      exclude: ['/api/{:path}'],
      // exclude: [/^\/api/ as unknown as string],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: isDevelopment,
      migrationsRun: isProduction,
      migrations: [join(__dirname, 'database/migrations/*.{ts,js}')],
    }),
    TenantContextModule,
    CoreModule,
    HcmModule,
    RouterModule.register([
      {
        path: 'hcm', // Prefijo global que se inyectará al inicio de todas las rutas del módulo
        module: HcmModule, // Aplica para todos los controladores registrados dentro de HcmModule
      },
      {
        path: 'core', // 🚀 NUEVO: Prefijo global para las tablas base (Países, Tenants, Usuarios)
        module: CoreModule,
      },
    ]),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  // 🌍 APLICACIÓN GLOBAL DEL MIDDLEWARE
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        // 🚀 SOLUCIÓN: Excluimos de forma explícita este endpoint del aislamiento automático
        // permitiendo que cualquier usuario anónimo consulte marcas visuales por el parámetro
        'core/tenants/subdomain/(.*)/brand',
        // Si tienes rutas de saas-admin globales, agrégalas también aquí
      )
      .forRoutes('*'); // 🚀 Aplica para el 100% de los endpoints de la API de forma automática
  }
}
