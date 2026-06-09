import { Module } from '@nestjs/common';
import { CoreService } from './core.service';
import { CoreController } from './core.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant, User, Country, SystemAccount, TenantBrand } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      User,
      Country,
      SystemAccount,
      TenantBrand,
    ]),
  ],
  controllers: [CoreController],
  providers: [CoreService],
  exports: [TypeOrmModule],
})
export class CoreModule {}
