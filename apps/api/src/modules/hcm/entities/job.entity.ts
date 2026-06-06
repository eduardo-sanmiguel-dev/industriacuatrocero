import { Entity, Column, Index } from 'typeorm';
import { BaseTenantEntityFull } from '../../../common/database/entities/base-tenant-full.entity';

// 🚀 BLINDAJE MULTI-TENANT: Impide puestos duplicados dentro de la misma organización,
// pero permite que 'Hada' y 'Trujillo' tengan el puesto "Gerente" de forma aislada.
@Index(['tenantId', 'name'], { unique: true })
@Entity({ name: 'hcm_jobs' })
export class HcmJob extends BaseTenantEntityFull {
  @Column({ type: 'varchar', length: 150, name: 'name' })
  name!: string; // Nombre formal del puesto, cargo o posición laboral (ej: 'Operador de Envasado', 'Auditor de Calidad')
}
