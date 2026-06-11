import { Entity, Column, OneToMany } from 'typeorm';
import { TenantRolePermission } from './tenant-role-permission.entity';
import { BaseTenantEntity } from '../../../common/database/entities/base-tenant.entity';

@Entity({ name: 'core_tenant_roles' })
export class TenantRole extends BaseTenantEntity {
  @Column({ type: 'varchar', length: 100, name: 'name' })
  name!: string; // Nombre del rol (ej: 'Supervisor de Turno', 'Coordinador de Logística')

  @Column({ type: 'varchar', length: 255, name: 'description', nullable: true })
  description?: string; // Nota explicativa de las responsabilidades del rol

  @Column({ type: 'boolean', name: 'is_system_default', default: false })
  isSystemDefault!: boolean; // true si es un rol protegido creado por ti que el cliente no puede borrar (ej: Admin)

  // 🔗 RELACIÓN HACIA LA TABLA INTERMEDIA DE ROMPIMIENTO
  @OneToMany(
    () => TenantRolePermission,
    (rolePermission) => rolePermission.tenantRole,
  )
  rolePermissions!: TenantRolePermission[];
}
