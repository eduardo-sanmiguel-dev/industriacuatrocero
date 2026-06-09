import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { SystemAccount } from '../../core/entities/system-account.entity';
import { LoginDto } from '../dto/login.dto';
import { TenantContextService } from '../../../common/context/tenant-context.service';
import { AUTH_TOKENS } from '../constants/auth.constants';

// Interfaz interna estricta para el retorno acoplado del doble firmado asíncrono
interface TokenPairResult {
  accessToken: string;
  refreshToken: string;
  userPayload: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(SystemAccount)
    private readonly accountRepository: Repository<SystemAccount>,

    // 🔑 Inyección por defecto del módulo (Se encargará de los Access Tokens de 15 minutos)
    private readonly accessTokenService: JwtService,

    // 🚀 INYECCIÓN PERSONALIZADA: Traemos el firmador secundario de 7 días registrado en tu AuthModule
    @Inject(AUTH_TOKENS.REFRESH_JWT_SERVICE)
    private readonly refreshTokenService: JwtService,

    // Lector automático del contexto del almacenamiento local asíncrono (ALS)
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Valida las credenciales con Argon2id y genera un par híbrido de tokens (Access 15m + Refresh 7d)
   * @param loginDto Datos de acceso (correo y contraseña de 8 a 128 caracteres)
   * @returns Promesa con los dos tokens generados y la ficha limpia del perfil del usuario
   */
  async loginAndGenerateTokens(loginDto: LoginDto): Promise<TokenPairResult> {
    // AUTOMÁTICO: Extraemos el UUID de la organización directo de la memoria del hilo de la petición
    const currentTenantId = this.tenantContext.getTenantId();

    // 🔍 CONSULTA INDEXADA: Atacamos el índice compuesto único (email + tenantId) de PostgreSQL
    const account = await this.accountRepository.findOne({
      where: {
        email: loginDto.email,
        tenantId: currentTenantId, // Aislamiento estricto multi-tenant por subdominio web
        isActive: true, // Solo permitimos el acceso a cuentas activas para mitigar riesgos de seguridad en cuentas inactivas o bloqueadas
      },
      select: {
        id: true,
        email: true,
        passwordHash: true, // Forzamos la carga del hash oculto requerido por Argon2id
        tenantId: true,
      },
      relations: {
        user: true, // Cargamos la relación formal con la identidad madre (core_users)
      },
    });

    // Control defensivo unificado para mitigar ataques maliciosos de enumeración de cuentas
    if (!account || !account.user) {
      throw new UnauthorizedException(
        'Credenciales incorrectas para esta organización.',
      );
    }

    // 🔒 VERIFICACIÓN CRIPTOGRÁFICA: Validamos la contraseña contra el hash avanzado de Argon2id
    const isPasswordValid = await argon2.verify(
      account.passwordHash,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    // Identificador único de la persona física
    const userIdStr = account.user.id;

    // 🧠 METADATOS COMPARTIDOS PARA AMBOS TOKENS
    const payload = {
      sub: userIdStr,
      email: account.email,
      tenantId: account.tenantId, // Sellado inalterable del inquilino actual
    };

    // FIRMADO PARALELO ASÍNCRONO: Cada motor aplica sus propias llaves y tiempos de expiración
    const accessToken = this.accessTokenService.sign(payload); // Expira en 15 minutos
    const refreshToken = this.refreshTokenService.sign(payload); // Expira en 7 días exactos

    // Retornamos el bloque unificado libre de variables nulas o indefinidas para TypeScript
    return {
      accessToken,
      refreshToken,
      userPayload: {
        id: userIdStr,
        firstName: account.user.firstName ?? '', // Operador de fusión nula para calmar el linter
        lastName: account.user.lastName ?? '',
        email: account.email,
      },
    };
  }

  /**
   * Valida un Refresh Token de 7 días y emite un nuevo par de llaves (Rotación de Tokens)
   * @param rawRefreshToken El token de larga duración enviado por el cliente
   * @returns Nuevo par de tokens y datos del usuario
   */
  async refreshSession(rawRefreshToken: string): Promise<TokenPairResult> {
    try {
      // 1. 🔒 SOLUCIÓN DE TIPADO: Forzamos el casteo estricto 'as JwtPayload' para destruir el tipo 'any' de raíz
      const decoded =
        this.refreshTokenService.verify<JwtPayload>(rawRefreshToken);

      // Al estar tipado con la interfaz, estas variables ya son 100% strings válidos para el linter
      const userIdStr = decoded.sub;
      const currentTenantId = decoded.tenantId;

      // 2. 🔍 CONSULTA INDEXADA: Buscamos por Email + TenantId (Aprovechando tu índice compuesto)
      const account = await this.accountRepository.findOne({
        where: {
          email: decoded.email, // 🚀 CORRECCIÓN: Buscamos por el email legítimo sellado en el JWT
          tenantId: currentTenantId,
        },
        select: {
          id: true,
          email: true,
          tenantId: true,
        },
        relations: { user: true },
      });

      // Si el usuario fue desactivado o borrado en Recursos Humanos, bloqueamos la renovación
      if (!account || !account.user) {
        throw new UnauthorizedException(
          'La sesión ya no es válida para esta organización.',
        );
      }

      // 3. 🔄 ROTACIÓN DE LLAVES: Creamos el nuevo Payload sellado con tipos garantizados
      const payload: JwtPayload = {
        sub: userIdStr,
        email: account.email,
        tenantId: currentTenantId,
      };

      // Emitimos el nuevo par de tokens con sus respectivos cronómetros reiniciados
      const newAccessToken = this.accessTokenService.sign(payload); // 15 minutos nuevos
      const newRefreshToken = this.refreshTokenService.sign(payload); // 7 días nuevos

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        userPayload: {
          id: userIdStr,
          firstName: account.user.firstName ?? '',
          lastName: account.user.lastName ?? '',
          email: account.email,
        },
      };
    } catch {
      throw new UnauthorizedException(
        'Sesión expirada o inválida. Por favor, inicia sesión de nuevo.',
      );
    }
  }

  /**
   * Recupera el perfil completo del usuario actual cruzando los metadatos del Tenant
   * @param userId UUID de la identidad en core_users
   * @returns Contrato tipado con el perfil unificado
   */
  async getProfile(userId: string): Promise<any> {
    const currentTenantId = this.tenantContext.getTenantId();

    const account = await this.accountRepository.findOne({
      // 🚀 SOLUCIÓN: Atacamos la relación 'user' pidiéndole el ID de forma explícita
      where: {
        tenantId: currentTenantId,
        user: {
          id: userId,
        },
      },
      relations: {
        user: { tenant: true },
      },
    });

    if (!account || !account.user || !account.user.tenant) {
      throw new UnauthorizedException(
        'No se encontraron datos válidos para este usuario.',
      );
    }

    return {
      user: {
        id: account.user.id,
        firstName: account.user.firstName ?? '',
        lastName: account.user.lastName ?? '',
        email: account.email,
      },
      tenant: {
        id: account.user.tenant.id,
        subdomain: account.user.tenant.subdomain,
      },
    };
  }
}
