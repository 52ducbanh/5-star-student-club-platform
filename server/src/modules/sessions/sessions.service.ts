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
import {
  SOLVE_CATEGORIES,
  SOLVE_QUESTIONS_BY_CATEGORY,
  SENSE_GROUPS,
  SENSE_SCENARIOS_BY_GROUP,
} from '@5ss/contracts';
import type { GameId, SessionStatus as ContractSessionStatus } from '@5ss/contracts';

function generateSolveAssignment(): string[] {
  return SOLVE_CATEGORIES.map((cat) => {
    const list = SOLVE_QUESTIONS_BY_CATEGORY[cat];
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex].id;
  });
}

function generateSenseAssignment(): string[] {
  const shuffledGroups = [...SENSE_GROUPS].sort(() => Math.random() - 0.5);
  const chosenGroups = shuffledGroups.slice(0, 3);
  return chosenGroups.map((grp) => {
    const list = SENSE_SCENARIOS_BY_GROUP[grp];
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex].id;
  });
}

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
    const assignedSolveQuestionIds = generateSolveAssignment();
    const assignedSenseScenarioIds = generateSenseAssignment();
    const assignedSprintTrackId = 'track-a';

    const session = this.sessionRepository.create({
      nickname: createSessionDto.nickname,
      status: SessionStatus.IN_PROGRESS,
      assignedSolveQuestionIds,
      assignedSenseScenarioIds,
      assignedSprintTrackId,
    });
    await this.sessionRepository.save(session);
    
    return this.mapToResponse(session, [], null);
  }

  async findOne(id: string): Promise<SessionResponseDto> {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session) {
      throw new DomainException(DomainErrorCode.SESSION_NOT_FOUND, 'Session not found', 404);
    }

    // Ensure assignments exist for backward compatibility / resumed sessions
    let dirty = false;
    if (!session.assignedSolveQuestionIds || session.assignedSolveQuestionIds.length !== 5) {
      session.assignedSolveQuestionIds = generateSolveAssignment();
      dirty = true;
    }
    if (!session.assignedSenseScenarioIds || session.assignedSenseScenarioIds.length !== 3) {
      session.assignedSenseScenarioIds = generateSenseAssignment();
      dirty = true;
    }
    if (!session.assignedSprintTrackId) {
      session.assignedSprintTrackId = 'track-a';
      dirty = true;
    }
    if (dirty) {
      await this.sessionRepository.save(session);
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

  async updatePhoto(id: string, photoUrl: string | null): Promise<void> {
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
      assignedSolveQuestionIds: session.assignedSolveQuestionIds ?? undefined,
      assignedSenseScenarioIds: session.assignedSenseScenarioIds ?? undefined,
      assignedSprintTrackId: session.assignedSprintTrackId ?? 'track-a',
    };
  }
}
