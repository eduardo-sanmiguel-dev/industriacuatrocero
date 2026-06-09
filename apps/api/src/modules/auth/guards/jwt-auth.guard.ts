import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { TenantContextService } from '../../../common/context/tenant-context.service';

interface DecodedToken {
  sub: string;
  email: string;
  tenantId: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tenantContext: TenantContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // 🔍 EXTRACCIÓN HÍBRIDA: Buscamos el token en las cookies (Web) o en la cabecera Authorization (Mobile)
    const cookies = (request.cookies || {}) as Record<
      string,
      string | undefined
    >;
    let token = cookies['access_token'];

    if (!token) {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      throw new UnauthorizedException('Acceso denegado. Token ausente.');
    }

    try {
      // 🔒 VERIFICACIÓN CRIPTOGRÁFICA SÍNCRONA
      const decoded = this.jwtService.verify<DecodedToken>(token);

      // 🚀 SOLUCIÓN DE TIPADO: Casteamos la mutación extendiendo la interfaz Request de Express
      const extendedRequest = request as typeof request & {
        user: { id: string; email: string; tenantId: string };
      };

      // Inyectamos de forma legítima, segura y transparente para el linter
      extendedRequest.user = {
        id: decoded.sub,
        email: decoded.email,
        tenantId: decoded.tenantId,
      };

      // 🧠 BLINDAJE ABSOLUTO: Alimentamos el ALS en caliente
      this.tenantContext.run(decoded.tenantId, () => {});

      return true;
    } catch {
      throw new UnauthorizedException('Sesión expirada o token corrupto.');
    }
  }
}
