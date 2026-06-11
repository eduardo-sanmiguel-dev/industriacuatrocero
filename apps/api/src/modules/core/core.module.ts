import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantPublicController } from './controllers/tenant-public.controller'; // 🚀 Registrar
import { TenantService } from './services/tenant.service'; // 🚀 Registrar
import { TenantComponent } from './entities/tenant-component.entity';
import { TenantPermission } from './entities/tenant-permission.entity';
import { TenantRole } from './entities/tenant-role.entity';
import { TenantRolePermission } from './entities/tenant-role-permission.entity';
import { TenantUserRole } from './entities/tenant-user-role.entity';
import { TenantUserException } from './entities/tenant-user-exception.entity';
import { Country } from './entities/country.entity';
import { SystemAccount } from './entities/system-account.entity';
import { Tenant } from './entities/tenant.entity';
import { TenantBrand } from './entities/tenant-brand.entity';
import { User } from './entities/user.entity';
import { TenantUserPreference } from './entities/tenant-user-preference.entity';

@Module({
  imports: [
    // Se añade TenantBrand al bloque maestro de inicialización relacional
    TypeOrmModule.forFeature([
      Tenant,
      User,
      Country,
      SystemAccount,
      TenantBrand,
      TenantComponent,
      TenantPermission,
      TenantRole,
      TenantRolePermission,
      TenantUserRole,
      TenantUserException,
      TenantUserPreference,
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
