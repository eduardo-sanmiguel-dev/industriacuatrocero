import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
  Get,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

// 🌎 CONTRATO MONOREPO: Interfaz unificada de tu paquete compartido
import { LoginResponse, UserProfileResponse } from '@synergy/types';
import { isProduction } from '../../../env';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth') // Ruta macro: http://localhost:3000/api/v1/auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto,
  ): Promise<LoginResponse> {
    // 🧠 DOBLE FIRMADO ASÍNCRONO: Validamos credenciales y generamos tokens en el servicio
    const tokenResult = await this.authService.loginAndGenerateTokens(loginDto);

    // 🚀 DELEGACIÓN: Centralizamos el envío de cookies o JSON en la función privada
    return this.handleHybridResponse(req, res, tokenResult);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() refreshTokenDto?: RefreshTokenDto, // 🚀 CAMBIO 1: Hacemos el DTO opcional con '?' para evitar el colapso si viene vacío
  ): Promise<LoginResponse> {
    // 1. 🔍 EXTRACCIÓN HÍBRIDA MULTI-TENANT
    const cookies = (req.cookies || {}) as Record<string, string | undefined>;
    const webRefreshToken = cookies['refresh_token'];

    // 🚀 CAMBIO 2: Usamos el encadenamiento opcional (?.) para que si refreshTokenDto es undefined, no rompa el hilo
    const tokenToValidate = webRefreshToken || refreshTokenDto?.refreshToken;

    // Si ambos vienen vacíos (limpios por el logout web o móvil), arrojamos el 401 controlado estándar de NestJS
    if (!tokenToValidate) {
      throw new UnauthorizedException(
        'Token de renovación ausente o sesión expirada.',
      );
    }

    // 🔄 ROTACIÓN DE LLAVES: El servicio procesa y regenera el par de tokens de forma segura
    const tokenResult = await this.authService.refreshSession(tokenToValidate);

    return this.handleHybridResponse(req, res, tokenResult);
  }

  /**
   * 🛠️ ÚNICA FUENTE DE VERDAD: Helper privado para centralizar la entrega híbrida de tokens (Web vs Móvil)
   */
  private handleHybridResponse(
    req: Request,
    res: Response,
    data: {
      accessToken: string;
      refreshToken: string;
      userPayload: LoginResponse['user'];
    },
  ): LoginResponse {
    const { accessToken, refreshToken, userPayload } = data;

    // Evaluamos el origen de la petición utilizando las firmas comunes de red
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();

    // Determinamos si el tráfico viene de la aplicación móvil de Expo o emuladores nativos
    const isMobile =
      userAgent.includes('expo') ||
      userAgent.includes('okhttp') ||
      userAgent.includes('darwin');

    if (!isMobile) {
      // 🌐 CLIENTE WEB (Vite): Inyectamos ambos tokens en cookies HttpOnly separadas

      // 1. Cookie del Access Token (15 minutos)
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isProduction, // Solo en producción para mitigar riesgos en desarrollo
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutos exactos
        path: '/',
      });

      // 2. Cookie del Refresh Token (7 días para el cierre semanal forzado)
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProduction, // Solo en producción para mitigar riesgos en desarrollo
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días exactos
        path: '/api/v1/auth/refresh', // Mitigación de riesgos OWASP
      });

      return {
        message: 'Sesión iniciada correctamente.',
        user: userPayload,
      };
    }

    // 📱 CLIENTE MÓVIL (Expo): Retornamos el Access Token libre en el JSON para el SecureStore
    return {
      message: 'Sesión iniciada correctamente.',
      accessToken: accessToken,
      user: userPayload,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): { message: string } {
    // 🧠 DETECCIÓN DE ENTORNO: Evaluamos si el tráfico viene del navegador web o de Expo
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const isMobile =
      userAgent.includes('expo') ||
      userAgent.includes('okhttp') ||
      userAgent.includes('darwin');

    if (!isMobile) {
      // 🌐 CLIENTE WEB (Vite): Destruimos las cookies seguras inyectando expiración inmediata
      this.clearHybridCookies(res);

      return {
        message: 'Sesión cerrada correctamente.',
      };
    }

    // 📱 CLIENTE MÓVIL (Expo): Respuesta limpia para indicar que la app móvil ya puede purgar su SecureStore
    return {
      message: 'Sesión cerrada correctamente.',
    };
  }

  /**
   * 🛠️ HELPER PRIVADO: Centraliza la destrucción absoluta de las cookies en el navegador web
   */
  private clearHybridCookies(res: Response): void {
    // 1. Sobreescribimos la cookie de acceso con valor vacío y maxAge en 0
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0, // ⏱️ Expira en el mismo milisegundo (Postgres/Navegador la borran de inmediato)
      path: '/',
    });

    // 2. Sobreescribimos la cookie de renovación con valor vacío y maxAge en 0
    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0,
      path: '/api/v1/auth/refresh', // Debe coincidir exactamente con el path original de seguridad
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard) // 🔒 Protege el endpoint: Rechaza peticiones sin sesión activa
  async getMe(@Req() req: Request): Promise<UserProfileResponse> {
    // 🚀 SOLUCIÓN DE TIPADO: Creamos un cast específico mapeando el objeto inyectado por el Guard
    const requestWithUser = req as Request & {
      user: { id: string; email: string; tenantId: string };
    };

    const authUser = requestWithUser.user;

    // 🚀 CONSULTA: Retornamos el perfil limpio consultando el servicio con tipos 100% seguros
    return this.authService.getProfile(authUser.id);
  }
}
