import { Entity, Column, Index } from 'typeorm';
import { BaseAuditEntity } from '../../../common/database/entities/base-audit.entity';

@Entity({ name: 'core_countries' })
export class Country extends BaseAuditEntity {
  // 🚀 El 'id' UUID ya viene heredado de BaseAuditEntity automáticamente de forma limpia

  @Index({ unique: true }) // Garantiza rapidez en búsquedas y evita duplicados en la base de datos
  @Column({ type: 'varchar', length: 2, name: 'country_code' })
  countryCode!: string; // Código ISO de 2 letras: 'MX', 'CO', 'US'

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string; // Nombre oficial: 'México', 'Colombia'

  @Column({ type: 'varchar', length: 5, name: 'phone_code' })
  phoneCode!: string; // Prefijo telefónico: '+52', '+57'

  @Column({ type: 'varchar', length: 3, name: 'currency_code' })
  currencyCode!: string; // Código ISO de la moneda: 'MXN', 'COP'
}
