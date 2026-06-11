import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { BaseTenantEntityFull } from '../../../common/database/entities/base-tenant-full.entity';

@Entity({ name: 'core_tenant_user_preferences' })
export class TenantUserPreference extends BaseTenantEntityFull {
  // 🚀 RELACIÓN 1:1 CON EL USUARIO
  // Un usuario tiene una única configuración de perfil, y una configuración le pertenece a un solo usuario
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId!: string; // Llave foránea única estricta

  // 🎨 CONFIGURACIÓN VISUAL DEL TEMA (Limitado estrictamente por Enum a nivel BD)
  @Column({
    type: 'varchar',
    length: 10,
    name: 'theme_mode',
    default: 'light',
  })
  themeMode!: 'light' | 'dark';

  // 🚚 PÁGINA DE INICIO PERSONALIZADA POR USUARIO
  // Guarda la ruta física del frontend (ej: '/ssoma/hallazgos' o '/sgp/registro').
  // Si está en null, el sistema aplicará la Estrategia de Prioridades por defecto.
  @Column({
    type: 'varchar',
    length: 150,
    name: 'default_landing_page',
    nullable: true,
  })
  defaultLandingPage?: string;

  // 📊 CONFIGURACIÓN DE REJILLAS CORPORATIVAS (AG GRID STATE)
  // Almacena un objeto JSONB binario mapeado por ID de pantalla.
  // Al ser 'jsonb', TypeORM lo mapeará nativamente como un Record/Objeto en TypeScript.
  @Column({ type: 'jsonb', name: 'ag_grid_state', nullable: true })
  agGridState?: Record<string, any>; // 🚀 Tipado elástico pero estructurado en el código
}
