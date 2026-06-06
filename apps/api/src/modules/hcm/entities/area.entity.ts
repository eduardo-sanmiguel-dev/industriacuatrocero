import { Entity, Column, Index } from 'typeorm';
import { BaseTenantEntityFull } from '../../../common/database/entities/base-tenant-full.entity';

// 🚀 BLINDAJE MULTI-TENANT: Índice compuesto único por empresa
@Index(['tenantId', 'name'], { unique: true })
@Entity({ name: 'hcm_areas' })
export class HcmArea extends BaseTenantEntityFull {
  // 🌟 CLAVE: Nombre explícito para evitar colisiones globales
  @Column({ type: 'varchar', length: 150, name: 'name' })
  name!: string; // Nombre formal de la macro-división o proceso estratégico de recursos humanos
}
