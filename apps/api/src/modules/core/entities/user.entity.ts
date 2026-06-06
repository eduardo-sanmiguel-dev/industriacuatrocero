import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTenantEntity } from '../../../common/database/entities/base-tenant.entity';
import { Tenant } from './tenant.entity';

@Entity({ name: 'core_users' })
export class User extends BaseTenantEntity {
  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName!: string; // Nombres de la persona o Razón Social completa si es una organización corporativa

  @Column({ type: 'varchar', length: 150, name: 'last_name', nullable: true })
  lastName?: string; // Apellidos completos de la persona (Opcional/Nullable para soportar nombres de empresas)

  // 🌍 RELACIÓN CON LA ENTIDAD MAESTRA TENANT
  // Permite hacer JOINs directos si el backend requiere extraer la configuración regional (Moneda/Zona Horaria) de la empresa
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant; // Instancia relacional de la empresa a la que pertenece este usuario
}
