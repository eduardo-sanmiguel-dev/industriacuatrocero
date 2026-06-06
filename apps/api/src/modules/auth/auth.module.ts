import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './services/auth.service';
import { CoreModule } from '../core/core.module';
import { env } from '../../env';

@Module({
  imports: [
    CoreModule,
    // 🔑 Configuración del motor de firmas de tokens JWT para tu plataforma SaaS
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: {
        expiresIn: '8h', // Tiempo de vida estándar para una jornada laboral corporativa
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule], // Exportamos para que tus otros módulos (como HCM) puedan validar tokens usando el Guard
})
export class AuthModule {}
