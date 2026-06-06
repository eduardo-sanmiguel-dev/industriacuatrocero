import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HcmArea } from './entities';
import { AreaController } from './controllers';
import { AreaService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([HcmArea])],
  controllers: [AreaController],
  providers: [AreaService],
  exports: [AreaService],
})
export class HcmModule {}
