import { Module } from '@nestjs/common';
import { CoreService } from './core.service';
import { CoreController } from './core.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant, User, Country, SystemAccount } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, User, Country, SystemAccount])],
  controllers: [CoreController],
  providers: [CoreService],
  exports: [TypeOrmModule],
})
export class CoreModule {}
