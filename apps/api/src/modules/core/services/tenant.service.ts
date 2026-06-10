import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';

// 🌎 CONTRATO COMPARTIDO: Importamos la interfaz exacta desde tu paquete centralizado de Turborepo
import { TenantPublicBrandResponse, TenantPublicOption } from '@synergy/types';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Busca un inquilino activo por su subdominio y extrae de forma segura su configuración de marca blanca
   * @param subdomain Prefijo extraído de la URL de red (ej: 'trujillo' o 'hada')
   * @returns Contrato tipado con la identidad visual pública de la organización
   */
  async getPublicBrandBySubdomain(
    subdomain: string,
  ): Promise<TenantPublicBrandResponse> {
    // 🔍 CONSULTA INDEXADA: Buscamos el subdominio y cargamos en un solo bloque la relación 1:1 estética
    const tenant = await this.tenantRepository.findOne({
      where: {
        subdomain: subdomain,
        isActive: true, // 🛡️ BLINDAJE: Si la empresa está suspendida, el login no se disfrazará
      },
      relations: {
        brand: true,
      },
      select: {
        id: true,
        subdomain: true,
        // Al mapear las relaciones, TypeORM infiere el resto del esquema basándose en brand.entity
      },
    });

    // Control defensivo: Si el subdominio no existe en la base de datos, abortamos el flujo de red
    if (!tenant) {
      throw new NotFoundException(
        `La organización con el subdominio "${subdomain}" no existe.`,
      );
    }

    // 🧠 TRANSFORMACIÓN SEGURA: Retornamos únicamente strings cosméticos inofensivos para el cliente anónimo
    return {
      id: tenant.id,
      subdomain: tenant.subdomain,
      brand: tenant.brand
        ? {
            companyLegalName: tenant.brand.companyLegalName ?? null,
            loginWelcomeText: tenant.brand.loginWelcomeText ?? null,
            primaryColor: tenant.brand.primaryColor,
            sidebarBgColor: tenant.brand.sidebarBgColor,
            logoUrl: tenant.brand.logoUrl ?? null,
            faviconUrl: tenant.brand.faviconUrl ?? null,
          }
        : null,
    };
  }

  async getRegisteredPublicTenants(): Promise<TenantPublicOption[]> {
    const tenants = await this.tenantRepository.find({
      where: { isActive: true },
      select: {
        id: true,
        subdomain: true,
        name: true,
        commercialName: true,
      },
      order: {
        name: 'ASC',
      },
    });

    return tenants.map((tenant) => ({
      id: tenant.id,
      subdomain: tenant.subdomain,
      name: tenant.name,
      commercialName: tenant.commercialName ?? null,
    }));
  }
}
