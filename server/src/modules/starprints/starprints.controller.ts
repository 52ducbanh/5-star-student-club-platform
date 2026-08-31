import { Controller, Post, Get, Param, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StarprintsService } from './starprints.service';
import { GenerateStarprintDto, PublishStarprintDto } from './dto/generate-starprint.dto';

@ApiTags('starprints')
@Controller('api/starprints')
export class StarprintsController {
  constructor(private readonly starprintsService: StarprintsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a starprint from completed games' })
  async generate(@Body() dto: GenerateStarprintDto) {
    return this.starprintsService.generate(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a starprint by ID' })
  async findOne(@Param('id') id: string) {
    return this.starprintsService.findOne(id);
  }

  @Post(':id/publish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Publish a starprint to the sky' })
  async publish(@Param('id') id: string, @Body() dto: PublishStarprintDto) {
    await this.starprintsService.publish(id, dto);
    return { success: true };
  }
}
