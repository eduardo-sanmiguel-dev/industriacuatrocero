import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { Tenant } from './tenant.entity';
import { BaseAuditEntity } from '../../../common/database/entities';

@Entity({ name: 'core_tenant_brands' })
export class TenantBrand extends BaseAuditEntity {
  // 🎨 CONFIGURACIÓN DE IDENTIDAD VISUAL (LOGOTIPOS)
  @Column({ type: 'varchar', length: 255, name: 'logo_url', nullable: true })
  logoUrl?: string; // URL del logotipo principal (ej: subido a un bucket de AWS S3 o Cloudinary) para el menú lateral

  @Column({ type: 'varchar', length: 255, name: 'favicon_url', nullable: true })
  faviconUrl?: string; // Icono de la pestaña del navegador web personalizado por empresa

  // 🖌️ CONFIGURACIÓN DE PALETA DE COLORES (Soportan formatos Hexadecimales '#HEX' o variables CSS)
  @Column({
    type: 'varchar',
    length: 30,
    name: 'primary_color',
    default: '#4F46E5',
  })
  primaryColor!: string; // Color de acento corporativo principal (ej: botones, enlaces activos)

  @Column({
    type: 'varchar',
    length: 30,
    name: 'sidebar_bg_color',
    default: '#1F2937',
  })
  sidebarBgColor!: string; // Color de fondo personalizado para el menú de navegación izquierdo

  // 📝 CONFIGURACIÓN DE TEXTOS Y REUNIONES CORPORATIVAS (SLOGANS)
  @Column({
    type: 'varchar',
    length: 100,
    name: 'company_legal_name',
    nullable: true,
  })
  companyLegalName?: string; // Razón social o nombre legal formal de la empresa para pies de página o recibos

  @Column({
    type: 'varchar',
    length: 150,
    name: 'login_welcome_text',
    nullable: true,
  })
  loginWelcomeText?: string; // Frase o saludo personalizado que se pintará exclusivamente en su formulario de subdominio

  // 🔗 RELACIÓN UNO A UNO (1:1) CON EL TENANT MADRE
  @OneToOne(() => Tenant, (tenant) => tenant.brand, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant; // Instancia de la empresa dueña de esta identidad visual

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string; // Enlace físico multi-tenant directo en la base de datos
}
