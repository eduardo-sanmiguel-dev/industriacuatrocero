import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HcmArea } from './entities/area.entity';
import { AreaController } from './controllers/area.controller';
import { AreaService } from './services/area.service';

@Module({
  imports: [TypeOrmModule.forFeature([HcmArea])],
  controllers: [AreaController],
  providers: [AreaService],
  exports: [AreaService],
})
export class HcmModule {}
