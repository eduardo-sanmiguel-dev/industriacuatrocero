import { Controller, Get } from '@nestjs/common';
import { AreaService } from '../services/area.service';
import { HcmArea } from '../entities/area.entity';

@Controller('areas') // Ruta final expandida por el RouterModule: /api/v1/hcm/areas
export class AreaController {
  // Inyección de dependencia estricta del servicio de áreas
  constructor(private readonly areaService: AreaService) {}

  @Get()
  async findAll(): Promise<HcmArea[]> {
    // 🚀 PUREZA ABSOLUTA: Cero parámetros, cabeceras o decoradores HTTP.
    // El servicio se encarga de aislar de forma automática e invisible los datos por empresa.
    return this.areaService.findAllByTenant();
  }
}
