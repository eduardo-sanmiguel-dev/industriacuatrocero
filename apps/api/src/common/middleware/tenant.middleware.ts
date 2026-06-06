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
    // 🚀 Al importar de 'express', req.headers.host vuelve a ser totalmente legal y tipado de forma segura
    const host = req.headers.host || '';

    // Extraemos la primera posición del subdominio de forma limpia
    const subdomain = host.split('.')[0] || '';

    const targetSubdomain = subdomain.includes('localhost')
      ? 'trujillo'
      : subdomain;

    const tenant = await this.tenantRepository.findOne({
      where: { subdomain: targetSubdomain, isActive: true },
      select: {
        id: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException(
        `La organización "${targetSubdomain}" no existe.`,
      );
    }

    // Envolvemos la petición dentro de tu nuevo almacén asíncrono (ALS)
    this.tenantContext.run(tenant.id, () => {
      next();
    });
  }
}
