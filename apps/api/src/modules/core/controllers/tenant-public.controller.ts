import { Controller, Get, Param } from '@nestjs/common';
import { TenantService } from '../services/tenant.service'; // 🚀 Importación de tu servicio de arriba
import { TenantPublicBrandResponse } from '@synergy/types';

@Controller('tenants') // Endpoint público: /api/v1/tenants
export class TenantPublicController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('subdomain/:subdomain/brand')
  async getPublicBrand(
    @Param('subdomain') subdomain: string,
  ): Promise<TenantPublicBrandResponse> {
    // Delegación directa a la lógica de negocio centralizada
    return this.tenantService.getPublicBrandBySubdomain(subdomain);
  }
}
