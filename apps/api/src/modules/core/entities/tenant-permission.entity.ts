import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantComponent } from './tenant-component.entity'; // 🚀 Enlace con la Tabla A (Padre)
import { BaseAuditEntity } from '../../../common/database/entities';

@Entity({ name: 'core_tenant_permissions' })
export class TenantPermission extends BaseAuditEntity {
  // 🔗 RELACIÓN N:1 CON EL COMPONENTE PADRE
  // Muchos permisos específicos pertenecen a un único componente del sistema
  @ManyToOne(() => TenantComponent, (component) => component.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenant_component_id' })
  tenantComponent!: TenantComponent;

  @Column({ type: 'uuid', name: 'tenant_component_id' })
  tenantComponentId!: string; // Llave foránea física indexada en PostgreSQL

  // 🛠️ ACCIÓN ATÓMICA DE SEGURIDAD (Estándar CRUD Unificado)
  @Column({
    type: 'varchar',
    length: 20,
    name: 'action',
  })
  action!: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'; // Acotado estrictamente a nivel de tipo de datos

  // 💻 LLAVE COMPUESTA SEMÁNTICA E INDEXADA
  @Column({ type: 'varchar', length: 100, name: 'code', unique: true })
  code!: string; // Código legible para programadores/guards (ej: 'sst:CREATE', 'hcm:READ', 'bi:DELETE')

  @Column({ type: 'varchar', length: 150, name: 'description', nullable: true })
  description?: string; // Explicación técnica (ej: 'Permite registrar incidentes de riesgo en plantas')
}
