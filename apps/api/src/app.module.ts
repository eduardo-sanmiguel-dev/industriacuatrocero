import { ServeStaticModule } from '@nestjs/serve-static';
import { Module } from '@nestjs/common';

import { join } from 'path';

import { TypeOrmModule } from '@nestjs/typeorm';
import { env } from 'process';
import { isDevelopment, isProduction } from './env';
import { CoreModule } from './modules/core/core.module';
import { HcmModule } from './modules/hcm/hcm.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../..', 'apps', 'web', 'dist'),
      exclude: ['/api/(.*)'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: isDevelopment,
      migrationsRun: isProduction,
      migrations: [join(__dirname, 'database/migrations/*.{ts,js}')],
    }),
    CoreModule,
    HcmModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
