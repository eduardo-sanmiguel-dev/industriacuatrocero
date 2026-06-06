import { Controller } from '@nestjs/common';
import { HcmService } from './hcm.service';

@Controller('hcm')
export class HcmController {
  constructor(private readonly hcmService: HcmService) {}
}
