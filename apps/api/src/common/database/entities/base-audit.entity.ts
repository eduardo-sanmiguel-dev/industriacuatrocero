import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // Llave primaria interna única (UUID) para evitar la predicción de IDs por URL

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean = true; // Flag de control operativo para deshabilitar o suspender lógicamente el registro

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date; // Marca de tiempo exacta de la creación en la base de datos almacenada de forma estricta en UTC

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date; // Fecha de la última modificación del registro controlada nativamente por PostgreSQL en UTC
}
