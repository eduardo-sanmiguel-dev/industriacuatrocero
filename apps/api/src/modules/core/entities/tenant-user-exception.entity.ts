import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { TenantPermission } from './tenant-permission.entity';
import { BaseTenantEntity } from '../../../common/database/entities/base-tenant.entity';

@Entity({ name: 'core_tenant_user_exceptions' })
// 🔒 BLINDAJE DE EXCEPCIONES: Evita duplicados redundantes de la misma acción para el mismo usuario
@Index(['tenantId', 'userId', 'tenantPermissionId'], { unique: true })
export class TenantUserException extends BaseTenantEntity {
  // 👤 RELACIÓN CON EL USUARIO EXCEPCIONADO
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  // 🔑 RELACIÓN CON EL PERMISO GRANULAR AFECTADO
  @ManyToOne(() => TenantPermission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_permission_id' })
  tenantPermission!: TenantPermission;

  @Column({ type: 'uuid', name: 'tenant_permission_id' })
  tenantPermissionId!: string;

  // ⚙️ INTERRUPTOR DE ANULACIÓN (GRANT / DENY)
  @Column({ type: 'boolean', name: 'is_granted', default: true })
  isGranted!: boolean; // true = Agrega el permiso (Excepción). false = Revoca el permiso explícitamente.
}
