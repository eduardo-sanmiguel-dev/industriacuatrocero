import { Module, Global } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';

@Global() // 🚀 CLAVE: Hace que este módulo e inyección sean accesibles en todo el monorepo automáticamente
@Module({
  providers: [TenantContextService],
  exports: [TenantContextService], // Exportamos para que los servicios de base de datos lo consuman
})
export class TenantContextModule {}
