import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/database/entities';

@Entity({ name: 'core_users' })
export class User extends BaseTenantEntity {
  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName!: string; // Nombres de la persona o Razón Social completa si es una organización corporativa

  @Column({ type: 'varchar', length: 150, name: 'last_name', nullable: true })
  lastName?: string; // Apellidos completos de la persona (Opcional/Nullable para soportar nombres de empresas)
}
