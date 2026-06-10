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
    // 1. 🔒 EXCLUSIÓN QUIRÚRGICA: Si es el endpoint público de descubrimiento estético, pasamos de largo
    const currentPath = req.originalUrl || req.url || '';
    if (
      currentPath.includes('/tenants/subdomain/') &&
      currentPath.includes('/brand')
    ) {
      return next();
    }

    // 2. 🌍 EXTRACCIÓN SAAS INMUNE A CLOUDFLARE:
    // Capturamos el origen real desde las cabeceras que el navegador web inyecta de forma obligatoria
    const originHeader = req.headers.origin || req.headers.referer || '';

    // Si la petición viene de Postman o Expo (móviles) y no trae referer, caemos defensivamente al host de red
    const rawHost = originHeader || req.headers.host || '';

    // 🧠 LIMPIEZA DE PROTOCOLOS (REGEXP):
    // Removemos 'http://', 'https://', 'www.' y cualquier diagonal residual o puertos (ej: :5173)
    const cleanHost = rawHost
      .replace(/^(https?:\/\/)?(www\.)?/, '') // Pone fin a los protocolos de internet
      .split('/')[0] // Corta cualquier sub-ruta colgante de la URL
      .split(':')[0]; // Remueve el puerto si estás probando localmente en desarrollo

    // 🚀 AISLAMIENTO DE SUBDOMINIO: Cortamos el primer segmento antes del primer punto
    const parts = cleanHost.split('.');
    const targetSubdomain = parts[0] || ''; // Extrae limpiamente la palabra 'hada' o 'trujillo'

    // Regla de escape automática para desarrollo local en tu computadora
    const cleanSubdomain =
      targetSubdomain === 'localhost' || targetSubdomain === '127'
        ? 'hada'
        : targetSubdomain;

    console.log(
      `📡 [Multi-Tenant] Host procesado: "${cleanHost}" | Subdominio aislado: "${cleanSubdomain}"`,
    );

    // 3. 🔍 CONSULTA INDEXADA: Buscamos la empresa en la base de datos de producción
    const tenant = await this.tenantRepository.findOne({
      where: { subdomain: cleanSubdomain, isActive: true },
      select: { id: true },
    });

    if (!tenant) {
      throw new NotFoundException(
        `La organización corporativa "${cleanSubdomain}" no existe o fue suspendida.`,
      );
    }

    // 🧠 ASIGNACIÓN ALS: Amarramos de forma invisible el UUID de la empresa para blindar TypeORM
    this.tenantContext.run(tenant.id, () => {
      next();
    });
  }
}
