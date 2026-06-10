import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { TenantService } from '../services/tenant.service'; // 🚀 Importación de tu servicio de arriba
import { TenantPublicBrandResponse, TenantPublicOption } from '@synergy/types';
import { isDevelopment } from '../../../env';

@Controller('tenants') // Endpoint público: /api/v1/tenants
export class TenantPublicController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('registered')
  async getRegisteredTenants(): Promise<TenantPublicOption[]> {
    if (!isDevelopment) {
      throw new NotFoundException('Recurso no disponible.');
    }

    return this.tenantService.getRegisteredPublicTenants();
  }

  @Get('subdomain/:subdomain/brand')
  async getPublicBrand(
    @Param('subdomain') subdomain: string,
  ): Promise<TenantPublicBrandResponse> {
    // Delegación directa a la lógica de negocio centralizada
    return this.tenantService.getPublicBrandBySubdomain(subdomain);
  }
}
