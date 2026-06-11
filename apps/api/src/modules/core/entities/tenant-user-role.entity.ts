import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantRole } from './tenant-role.entity';
import { User } from './user.entity'; // Asegura la ruta exacta de tu entidad core_users
import { BaseTenantEntity } from '../../../common/database/entities/base-tenant.entity';

@Entity({ name: 'core_tenant_user_roles' })
// 🔒 BLINDAJE MULTI-TENANT: Un usuario solo puede tener asignado un rol específico una única vez por empresa
@Index(['tenantId', 'userId', 'tenantRoleId'], { unique: true })
export class TenantUserRole extends BaseTenantEntity {
  // 👤 RELACIÓN CON LA IDENTIDAD DEL USUARIO
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  // 👥 RELACIÓN CON EL ROL ASIGNADO
  @ManyToOne(() => TenantRole, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_role_id' })
  tenantRole!: TenantRole;

  @Column({ type: 'uuid', name: 'tenant_role_id' })
  tenantRoleId!: string;
}
