import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { SystemAccount } from '../../core/entities/system-account.entity';
import { LoginDto } from '../dto/login.dto';
import { TenantContextService } from '../../../common/context/tenant-context.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(SystemAccount)
    private readonly accountRepository: Repository<SystemAccount>,
    private readonly jwtService: JwtService,
    // 🚀 INYECCIÓN DEL ALS: Le permite al servicio leer el inquilino de la memoria de forma automática
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Ejecuta el inicio de sesión de un usuario aislando los datos por su subdominio web
   * @param loginDto Objeto con el correo y la contraseña (de 8 a 128 caracteres)
   * @returns Token de acceso firmado con contexto multi-tenant sellado
   */
  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    // 🧠 AUTOMÁTICO: Recuperamos el UUID de la organización directamente del hilo de ejecución actual
    const currentTenantId = this.tenantContext.getTenantId();

    // 🔍 CONSULTA INDEXADA: Atacamos el índice compuesto UNIQUE (email, tenant_id) de PostgreSQL
    const account = await this.accountRepository.findOne({
      where: {
        email: loginDto.email,
        tenantId: currentTenantId, // Filtra instantáneamente la cuenta asignada a este subdominio específico
      },
      select: {
        id: true,
        email: true,
        passwordHash: true, // Forzamos la lectura del hash oculto requerido por Argon2id
        tenantId: true,
      },
      relations: {
        user: true, // Traemos la identidad de la persona física (core_users) para el ID del token
      },
    });

    // Control defensivo unificado para mitigar ataques de enumeración de usuarios
    if (!account || !account.user) {
      throw new UnauthorizedException(
        'Credenciales incorrectas para esta organización.',
      );
    }

    // 🔒 VERIFICACIÓN CRIPTOGRÁFICA: Validamos la contraseña contra el hash Argon2id de última generación
    const isPasswordValid = await argon2.verify(
      account.passwordHash,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    // 🧠 PAYLOAD MULTI-TENANT SELLADO: Guardamos la identidad y el inquilino en el cuerpo del token
    const payload = {
      sub: account.user.id, // UUID de core_users
      email: account.email,
      tenantId: account.tenantId, // Queda incrustado de forma segura e inalterable para el AuthGuard futuro
    };

    // Retornamos el token firmado listo para que Vite o Expo lo almacenen de forma segura
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
