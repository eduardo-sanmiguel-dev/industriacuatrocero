import { DataSource } from 'typeorm';
import { env, isProduction } from '../env';
import { join } from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  synchronize: false,
  migrationsRun: isProduction,
  //logging: !isProduction,
  entities: [join(__dirname, '../**/*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations/*.{ts,js}')],
});
