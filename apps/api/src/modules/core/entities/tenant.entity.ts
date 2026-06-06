import { Entity, Column, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAuditEntity } from '../../../common/database/entities';
import { Country } from './country.entity';

// Tipo estricto en código para limitar las opciones del modelo de monetización SaaS
export type PlanType = 'BASIC' | 'PRO' | 'PREMIUM';

@Entity({ name: 'core_tenants' })
export class Tenant extends BaseAuditEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, name: 'subdomain' })
  subdomain!: string; // Identificador único para el enrutamiento dinámico web (ej: ://example.com)

  @Column({ type: 'varchar', length: 150 })
  name!: string; // Razón social o nombre legal completo de la organización cliente

  @Column({
    type: 'varchar',
    length: 150,
    name: 'commercial_name',
    nullable: true,
  })
  commercialName?: string; // Nombre comercial, marca o alias público de la empresa (Opcional)

  @Column({ type: 'varchar', length: 50, name: 'tax_id', unique: true })
  taxId!: string; // Identificador fiscal único del país (RFC en México, NIT en Colombia)

  @Column({ type: 'varchar', length: 50, name: 'timezone' })
  timezone!: string; // Identificador de zona horaria IANA (ej: America/Mexico_City, America/Bogota)

  @Column({ type: 'varchar', length: 3, name: 'currency' })
  currency!: string; // Código de moneda ISO 4217 (MXN, COP) para la gestión transaccional local

  @Column({ type: 'varchar', length: 20, name: 'plan_type' })
  planType!: PlanType; // Nivel de suscripción activo que define qué tarjetas/módulos se desbloquean en los frontends

  // 🌍 RELACIÓN MUCHOS A UNO (N:1) CON EL CATÁLOGO MAESTRO DE PAÍSES
  @ManyToOne(() => Country, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'country_id' }) // 🚀 CAMBIO SENSATO: Cambiamos el nombre a country_id porque ahora apuntará al UUID de core_countries
  country!: Country; // Instancia del país al que pertenece la organización cliente
}
