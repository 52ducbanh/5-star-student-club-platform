import { Controller, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { SubmitGameDto } from './dto/submit-game.dto';

@ApiTags('games')
@Controller('api/sessions/:sessionId/games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post(':gameId')
  @ApiOperation({ summary: 'Submit a game result' })
  async submitGame(
    @Param('sessionId') sessionId: string,
    @Param('gameId') gameId: string,
    @Body() submitDto: SubmitGameDto,
  ) {
    return this.gamesService.submitGame(sessionId, gameId, submitDto);
  }
}
