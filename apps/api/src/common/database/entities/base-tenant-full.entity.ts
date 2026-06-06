import { Column } from 'typeorm';
import { BaseTenantEntity } from './base-tenant.entity';

export abstract class BaseTenantEntityFull extends BaseTenantEntity {
  @Column({ type: 'uuid', name: 'created_by' })
  createdBy!: string; // ID del usuario de 'core_users' que insertó originalmente el registro en el sistema

  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy?: string; // ID del último usuario de 'core_users' que modificó la información de este registro
}
