import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkyService } from './sky.service';

@ApiTags('sky')
@Controller('api/sky')
export class SkyController {
  constructor(private readonly skyService: SkyService) {}

  @Get()
  @ApiOperation({ summary: 'Get all public starprints for the sky' })
  async getSky() {
    return this.skyService.getPublicStars();
  }
}
