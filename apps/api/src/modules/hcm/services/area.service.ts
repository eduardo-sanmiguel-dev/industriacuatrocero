import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HcmArea } from '../entities/area.entity';
import { TenantContextService } from '../../../common/context/tenant-context.service';

@Injectable()
export class AreaService {
  // Inyección estricta del repositorio nativo de TypeORM asignado a la entidad HcmArea
  constructor(
    @InjectRepository(HcmArea)
    private readonly areaRepository: Repository<HcmArea>,
    private readonly tenantContext: TenantContextService, // 🚀 Inyectamos el servicio de contexto para obtener el tenantId automáticamente
  ) {}

  /**
   * Obtiene la lista de áreas organizacionales filtradas estrictamente por empresa (Tenant)
   * @param tenantId UUID único de la organización cliente
   * @returns Promesa con el arreglo de áreas ordenadas alfabéticamente
   */
  async findAllByTenant(): Promise<HcmArea[]> {
    const currentTenantId = this.tenantContext.getTenantId();

    return this.areaRepository.find({
      where: {
        tenantId: currentTenantId, // 🚀 BLINDAJE: Aislamiento total de datos multi-tenant
      },
      order: {
        name: 'ASC', // ⏱️ OPTIMIZACIÓN: Entrega la lista ordenada alfabéticamente desde PostgreSQL
      },
    });
  }
}
