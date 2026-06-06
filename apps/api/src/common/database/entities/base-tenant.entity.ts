import { Column, Index } from 'typeorm';
import { BaseAuditEntity } from './base-audit.entity';

// 🚀 BLINDAJE DE RENDIMIENTO: Crea un índice compuesto B-Tree en PostgreSQL combinando tenant_id y el id
// Esto garantiza que consultas con millones de filas operativas sean instantáneas por cliente
@Index(['tenantId', 'id'])
export abstract class BaseTenantEntity extends BaseAuditEntity {
  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string; // El pilar de tu arquitectura multi-tenant; asocia obligatoriamente cada registro a un Tenant
}
