import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../modules/core/entities/tenant.entity';
import { TenantContextService } from '../context/tenant-context.service'; // 🚀 Importamos el ALS

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly tenantContext: TenantContextService, // 🚀 Inyectamos el servicio de contexto
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const host = req.headers.host || '';

    // 🚀 BLINDAJE EN BACKEND: Forzamos la lectura de la primera posición del arreglo
    const targetSubdomain = host.split('.')[0] || '';

    console.log({
      targetSubdomain,
      headers: req.headers,
      host,
    });

    // Regla de escape local si la requieres
    const cleanSubdomain =
      targetSubdomain === 'localhost' || targetSubdomain === '127'
        ? 'hada'
        : targetSubdomain;

    console.log({ cleanSubdomain });

    const tenant = await this.tenantRepository.findOne({
      where: { subdomain: cleanSubdomain, isActive: true },
      select: { id: true },
    });

    if (!tenant) {
      // 🛡️ Esto te revelará exactamente qué palabra está intentando buscar tu backend en la base de datos
      throw new NotFoundException(
        `La organización "${cleanSubdomain}" no existe.`,
      );
    }

    this.tenantContext.run(tenant.id, () => {
      next();
    });
  }
}
