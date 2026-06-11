import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantRole } from './tenant-role.entity';
import { TenantPermission } from './tenant-permission.entity';
import { BaseTenantEntity } from '../../../common/database/entities/base-tenant.entity';

@Entity({ name: 'core_tenant_role_permissions' })
// 🔒 BLINDAJE INDEXADO DE PRODUCCIÓN:
// Forzamos una restricción única compuesta. No puede haber registros duplicados del mismo permiso en el mismo rol bajo la misma empresa.
@Index(['tenantId', 'tenantRoleId', 'tenantPermissionId'], { unique: true })
export class TenantRolePermission extends BaseTenantEntity {
  // 👥 RELACIÓN CON EL ROL
  @ManyToOne(() => TenantRole, (role) => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenant_role_id' })
  tenantRole!: TenantRole;

  @Column({ type: 'uuid', name: 'tenant_role_id' })
  tenantRoleId!: string;

  // 🔑 RELACIÓN CON EL PERMISO GRANULAR
  @ManyToOne(() => TenantPermission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_permission_id' })
  tenantPermission!: TenantPermission;

  @Column({ type: 'uuid', name: 'tenant_permission_id' })
  tenantPermissionId!: string;
}
