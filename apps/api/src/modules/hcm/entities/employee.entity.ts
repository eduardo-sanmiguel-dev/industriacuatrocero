import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { BaseTenantEntityFull } from '../../../common/database/entities/base-tenant-full.entity';
import { User } from '../../core/entities/user.entity';
import { HcmArea } from './area.entity';
import { HcmJob } from './job.entity';

// Tipo estricto en código para el sexo biológico requerido para trámites gubernamentales y médicos
export type BiologicalSex = 'MALE' | 'FEMALE';

// 🚀 BLINDAJE MULTI-TENANT:
@Index(['tenantId', 'employeeCode'], { unique: true })
@Index(['tenantId', 'governmentId'], { unique: true })
@Entity({ name: 'hcm_employees' })
export class HcmEmployee extends BaseTenantEntityFull {
  @Column({ type: 'varchar', length: 50, name: 'employee_code' })
  employeeCode!: string; // Código, número de nómina o legajo interno único que identifica al trabajador en la empresa

  @Column({ type: 'varchar', length: 50, name: 'government_id' })
  governmentId!: string; // Identificador oficial obligatorio ante el gobierno (NSS en México, Cédula de Ciudadanía en Colombia)

  @Column({ type: 'varchar', length: 10, name: 'biological_sex' })
  biologicalSex!: BiologicalSex; // Sexo biológico del trabajador registrado ante las instituciones de salud

  @Column({ type: 'date', name: 'hire_date' })
  hireDate!: Date;

  @Column({ type: 'date', name: 'termination_date', nullable: true })
  terminationDate?: Date;

  // 💼 RELACIÓN MUCHOS A UNO (N:1) CON EL CATÁLOGO DE PUESTOS
  @ManyToOne(() => HcmJob, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'job_id' })
  job!: HcmJob; // Instancia del puesto o cargo formal que desempeña el trabajador

  @Column({ type: 'uuid', name: 'job_id' })
  jobId!: string; // ID puro del puesto en la base de datos para consultas directas de alta velocidad

  // 📂 RELACIÓN MUCHOS A UNO (N:1) CON EL CATÁLOGO DE ÁREAS ORGANIZACIONALES
  @ManyToOne(() => HcmArea, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'area_id' })
  area!: HcmArea; // Instancia del área corporativa o proceso estratégico al que pertenece el empleado

  @Column({ type: 'uuid', name: 'area_id' })
  areaId!: string; // ID puro del área en la base de datos para indexación y filtrado multi-tenant inmediato

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
