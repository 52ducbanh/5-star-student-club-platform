import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerSession, SessionStatus } from './entities/player-session.entity';
import { GameResult } from '../games/entities/game-result.entity';
import { Starprint } from '../starprints/entities/starprint.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../common/exceptions/domain-error.enum';
import type { GameId, SessionStatus as ContractSessionStatus } from '@5ss/contracts';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(PlayerSession)
    private readonly sessionRepository: Repository<PlayerSession>,
    @InjectRepository(GameResult)
    private readonly gameResultRepository: Repository<GameResult>,
    @InjectRepository(Starprint)
    private readonly starprintRepository: Repository<Starprint>,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<SessionResponseDto> {
    const session = this.sessionRepository.create({
      nickname: createSessionDto.nickname,
      status: SessionStatus.IN_PROGRESS,
    });
    await this.sessionRepository.save(session);
    
    return this.mapToResponse(session, [], null);
  }

  async findOne(id: string): Promise<SessionResponseDto> {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session) {
      throw new DomainException(DomainErrorCode.SESSION_NOT_FOUND, 'Session not found', 404);
    }
    
    const results = await this.gameResultRepository.find({
      where: { sessionId: id },
      order: { createdAt: 'ASC' },
    });
    const completedGameIds = results.map(r => r.gameId as GameId);

    const starprint = await this.starprintRepository.findOne({ where: { sessionId: id } });
    const starprintId = starprint ? starprint.id : null;
    
    return this.mapToResponse(session, completedGameIds, starprintId);
  }

  async updatePhoto(id: string, photoUrl: string): Promise<void> {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session) {
      throw new DomainException(DomainErrorCode.SESSION_NOT_FOUND, 'Session not found', 404);
    }
    session.photoUrl = photoUrl;
    await this.sessionRepository.save(session);
  }

  async updateStatus(id: string, status: SessionStatus): Promise<void> {
    await this.sessionRepository.update(id, { status });
  }

  private mapToResponse(session: PlayerSession, completedGameIds: GameId[], starprintId: string | null): SessionResponseDto {
    return {
      id: session.id,
      nickname: session.nickname,
      photoUrl: session.photoUrl,
      status: session.status as ContractSessionStatus,
      completedGameIds,
      starprintId,
    };
  }
}
