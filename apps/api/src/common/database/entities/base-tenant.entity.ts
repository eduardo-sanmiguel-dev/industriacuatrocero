import { Column, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAuditEntity } from './base-audit.entity';
import { Tenant } from '../../../modules/core/entities/tenant.entity';

// 🚀 BLINDAJE DE RENDIMIENTO: Crea un índice compuesto B-Tree en PostgreSQL combinando tenant_id y el id
// Esto garantiza que consultas con millones de filas operativas sean instantáneas por cliente
@Index(['tenantId', 'id'])
export abstract class BaseTenantEntity extends BaseAuditEntity {
  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  // 🌍 COMPONENTE MULTI-TENANT
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;
}
