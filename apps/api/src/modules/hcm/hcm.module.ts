import { Module } from '@nestjs/common';
import { HcmService } from './hcm.service';
import { HcmController } from './hcm.controller';

@Module({
  controllers: [HcmController],
  providers: [HcmService],
})
export class HcmModule {}
