import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionResponseDto } from './dto/session-response.dto';

@ApiTags('sessions')
@Controller('api/sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new player session' })
  @ApiResponse({ type: SessionResponseDto })
  async create(@Body() createSessionDto: CreateSessionDto): Promise<SessionResponseDto> {
    return this.sessionsService.create(createSessionDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a session by ID' })
  @ApiResponse({ type: SessionResponseDto })
  async findOne(@Param('id') id: string): Promise<SessionResponseDto> {
    return this.sessionsService.findOne(id);
  }
}
