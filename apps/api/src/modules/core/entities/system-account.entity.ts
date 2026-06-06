import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { BaseTenantEntity } from '../../../common/database/entities/base-tenant.entity';
import { User } from './user.entity';

@Entity({ name: 'core_system_accounts' })
export class SystemAccount extends BaseTenantEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150, name: 'email' })
  email!: string; // Correo electrónico único utilizado como identificador principal para el inicio de sesión

  @Column({
    type: 'varchar',
    length: 255,
    name: 'password_hash',
    select: false,
  })
  passwordHash!: string; // Hash seguro de la contraseña (select: false impide su filtración accidental en queries comunes)

  // 🔗 RELACIÓN UNO A UNO (1:1) CON LA TABLA MADRE DE IDENTIDADES
  // Vincula esta cuenta de acceso con el registro de identidad básica (Nombres/Apellidos)
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User; // Instancia de la identidad de usuario a la que pertenecen estas credenciales
}
