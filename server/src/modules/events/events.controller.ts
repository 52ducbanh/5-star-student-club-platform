import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { RegisterEventDto } from './dto/register-event.dto';

@ApiTags('events')
@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published events ordered by startAt DESC' })
  async findAll() {
    return this.eventsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a single published event by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.eventsService.findBySlug(slug);
  }

  @Post(':eventId/registrations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register for an event; eventId is the UUID route param' })
  async register(
    @Param('eventId') eventId: string,
    @Body() dto: RegisterEventDto,
  ) {
    return this.eventsService.register(eventId, dto);
  }
}
