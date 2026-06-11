import { Entity, Column, OneToMany } from 'typeorm';
import { TenantPermission } from './tenant-permission.entity';
import { BaseAuditEntity } from '../../../common/database/entities';

@Entity({ name: 'core_tenant_components' })
export class TenantComponent extends BaseAuditEntity {
  @Column({ type: 'varchar', length: 100, name: 'name', unique: true })
  name!: string; // Nombre legible (ej: 'Seguridad y Salud en el Trabajo', 'Gestión Humana')

  @Column({ type: 'varchar', length: 50, name: 'code', unique: true })
  code!: string; // 💻 LLAVE TECNOLÓGICA: Código unificado para validaciones en guards (ej: 'sst', 'hcm', 'bi')

  @Column({ type: 'varchar', length: 255, name: 'description', nullable: true })
  description?: string; // Explicación de las capacidades de este componente de software

  // 🔗 RELACIÓN 1:N HACIA LA TABLA B (PERMISOS DE LA SUITE)
  // Un componente de la plataforma agrupa múltiples acciones CRUD granulares
  @OneToMany(() => TenantPermission, (permission) => permission.tenantComponent)
  permissions!: TenantPermission[];
}
