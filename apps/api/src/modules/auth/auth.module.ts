import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './services/auth.service';
import { CoreModule } from '../core/core.module';
import { env } from '../../env';
import { AUTH_TOKENS } from './constants/auth.constants';
import { PermissionCacheService } from '../core/services/permission-cache.service';

@Module({
  imports: [
    CoreModule,
    // 🔑 Configuración del motor de firmas de tokens JWT para tu plataforma SaaS
    // 🔑 FIRMADOR PRINCIPAL: Utiliza la configuración por defecto de NestJS (para los Access Tokens de 15 min)
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: env.JWT_SECRET, // Llave maestra de acceso común
        signOptions: {
          expiresIn: '15m', // ⏱️ Expira estrictamente en 15 minutos para seguridad en la red
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PermissionCacheService,
    // 🚀 FIRMADOR DE REFRESH AUXILIAR: Instanciación limpia, 100% tipada y libre de 'any'
    {
      provide: AUTH_TOKENS.REFRESH_JWT_SERVICE,
      useFactory: (): JwtService => {
        // Retornamos una instancia real de la clase usando los entornos validados por Zod
        return new JwtService({
          secret: env.JWT_REFRESH_SECRET, // ⚡ Validado y tipado nativamente por tu env.ts
          signOptions: {
            expiresIn: '7d', // 🔒 Cierre forzado: Expiración máxima e inalterable de una semana
          },
        });
      },
    },
  ],
  exports: [AuthService, JwtModule, AUTH_TOKENS.REFRESH_JWT_SERVICE],
})
export class AuthModule {}
