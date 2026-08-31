import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameResult, GameType } from './entities/game-result.entity';
import { SessionStatus } from '../sessions/entities/player-session.entity';
import { SessionsService } from '../sessions/sessions.service';
import { SubmitGameDto } from './dto/submit-game.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../common/exceptions/domain-error.enum';
import { ScoringService } from './scoring/scoring.service';
import { validateRawGameResult } from './validation/raw-result-validator';
import type { GameId, SubmitGameResponse } from '@5ss/contracts';

@Injectable()
export class GamesService {
  private readonly GAME_ORDER = [
    GameType.SOLVE,
    GameType.SENSE,
    GameType.SPRINT,
    GameType.SUPPORT,
    GameType.SYNC
  ];

  constructor(
    @InjectRepository(GameResult)
    private readonly resultRepository: Repository<GameResult>,
    private readonly sessionsService: SessionsService,
    private readonly scoringService: ScoringService,
  ) {}

  async submitGame(sessionId: string, gameId: string, submitDto: SubmitGameDto): Promise<SubmitGameResponse> {
    const session = await this.sessionsService.findOne(sessionId);
    
    if (session.status !== SessionStatus.IN_PROGRESS) {
      throw new DomainException(DomainErrorCode.INVALID_GAME_STATE, 'Session is not in progress');
    }

    if (!Object.values(GameType).includes(gameId as GameType)) {
      throw new DomainException(DomainErrorCode.INVALID_GAME, 'Invalid game ID');
    }

    const typedGameId = gameId as GameType;
    const contractGameId = typedGameId as GameId;
    const completedGames = session.completedGameIds;
    
    if (completedGames.includes(contractGameId)) {
      throw new DomainException(DomainErrorCode.GAME_ALREADY_SUBMITTED, 'Game already submitted');
    }

    const expectedGameIndex = completedGames.length;
    if (this.GAME_ORDER[expectedGameIndex] !== typedGameId) {
      throw new DomainException(DomainErrorCode.INVALID_GAME_STATE, 'Games must be played in strict order');
    }

    // Authoritative Server-side Validation of Raw Result Payload
    validateRawGameResult(typedGameId, submitDto.rawResult);

    const result = this.resultRepository.create({
      sessionId,
      gameId: typedGameId,
      rawResult: submitDto.rawResult,
    });

    try {
      await this.resultRepository.save(result);
    } catch {
      throw new DomainException(DomainErrorCode.GAME_ALREADY_SUBMITTED, 'Game already submitted');
    }

    const newCompleted: GameId[] = [...completedGames, contractGameId];
    if (newCompleted.length === 5) {
      await this.sessionsService.updateStatus(sessionId, SessionStatus.READY_TO_GENERATE);
    }

    return { success: true, completedGameIds: newCompleted };
  }
}
