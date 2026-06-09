import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantBrand } from './entities/tenant-brand.entity';
import { User } from './entities/user.entity';
import { Country } from './entities/country.entity';
import { SystemAccount } from './entities/system-account.entity';

import { TenantPublicController } from './controllers/tenant-public.controller'; // 🚀 Registrar
import { TenantService } from './services/tenant.service'; // 🚀 Registrar

@Module({
  imports: [
    // Se añade TenantBrand al bloque maestro de inicialización relacional
    TypeOrmModule.forFeature([
      Tenant,
      User,
      Country,
      SystemAccount,
      TenantBrand,
    ]),
  ],
  controllers: [
    TenantPublicController, // 👈 Registrado aquí para habilitar la URL pública
  ],
  providers: [
    TenantService, // 👈 Registrado aquí para resolver la dependencia del controlador
  ],
  exports: [
    TypeOrmModule,
    TenantService, // Exportamos por si el modulo de Auth lo requiere en el futuro
  ],
})
export class CoreModule {}
