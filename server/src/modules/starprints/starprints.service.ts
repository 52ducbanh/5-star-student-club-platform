import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Starprint } from './entities/starprint.entity';
import { TypeEngine } from './domain/type-engine';
import { PaletteEngine } from './domain/palette-engine';
import { STAR_TYPES } from './domain/star-types.config';
import { GenerateStarprintDto, PublishStarprintDto } from './dto/generate-starprint.dto';
import { StarprintResponseDto } from './dto/starprint-response.dto';
import { SessionsService } from '../sessions/sessions.service';
import { ScoringService } from '../games/scoring/scoring.service';
import { GameResult } from '../games/entities/game-result.entity';
import { PlayerSession, SessionStatus } from '../sessions/entities/player-session.entity';
import { DomainException } from '../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../common/exceptions/domain-error.enum';
import { SkyGateway } from '../sky/sky.gateway';
import type { SkyStar } from '@5ss/contracts';

@Injectable()
export class StarprintsService {
  constructor(
    @InjectRepository(Starprint)
    private readonly starprintRepository: Repository<Starprint>,
    @InjectRepository(GameResult)
    private readonly gameResultRepository: Repository<GameResult>,
    private readonly sessionsService: SessionsService,
    private readonly scoringService: ScoringService,
    private readonly typeEngine: TypeEngine,
    private readonly paletteEngine: PaletteEngine,
    private readonly skyGateway: SkyGateway,
    private readonly dataSource: DataSource,
  ) {}

  async generate(dto: GenerateStarprintDto): Promise<StarprintResponseDto> {
    const session = await this.sessionsService.findOne(dto.sessionId);
    if (session.status !== SessionStatus.READY_TO_GENERATE) {
      throw new DomainException(DomainErrorCode.NOT_ALL_GAMES_COMPLETED, 'Not all games completed');
    }

    const existing = await this.starprintRepository.findOne({ where: { sessionId: dto.sessionId } });
    if (existing) {
      throw new DomainException(DomainErrorCode.STARPRINT_ALREADY_GENERATED, 'Starprint already generated');
    }

    const results = await this.gameResultRepository.find({ where: { sessionId: dto.sessionId } });
    const profile = this.scoringService.aggregateProfiles(results);
    const typeInfo = this.typeEngine.determineType(profile);
    const palette = this.paletteEngine.generatePalette(dto.baseColor);

    const starprint = this.starprintRepository.create({
      sessionId: dto.sessionId,
      baseColor: dto.baseColor,
      palette,
      type: typeInfo.id,
      effect: typeInfo.effect,
      profile,
    });

    // Execute state transition atomically within a database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(Starprint, starprint);
      await queryRunner.manager.update(PlayerSession, dto.sessionId, { status: SessionStatus.GENERATED });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return this.mapToResponse(starprint, session.nickname, session.photoUrl);
  }

  async findOne(id: string): Promise<StarprintResponseDto> {
    const starprint = await this.starprintRepository.findOne({ where: { id }, relations: ['session'] });
    if (!starprint) {
      throw new DomainException(DomainErrorCode.STARPRINT_NOT_FOUND, 'Starprint not found', 404);
    }
    return this.mapToResponse(starprint, starprint.session?.nickname, starprint.session?.photoUrl);
  }

  async publish(id: string, dto: PublishStarprintDto): Promise<void> {
    const starprint = await this.starprintRepository.findOne({ where: { id }, relations: ['session'] });
    if (!starprint) {
      throw new DomainException(DomainErrorCode.STARPRINT_NOT_FOUND, 'Starprint not found', 404);
    }

    starprint.isPublic = true;
    starprint.consentName = dto.consentName;
    starprint.consentPhoto = dto.consentPhoto;

    // Execute publication state transition atomically within a database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(Starprint, starprint);
      await queryRunner.manager.update(PlayerSession, starprint.sessionId, { status: SessionStatus.PUBLISHED });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    // Socket.IO event ONLY emitted AFTER transaction commit succeeds
    const payload: SkyStar = {
      id: starprint.id,
      baseColor: starprint.baseColor,
      palette: starprint.palette,
      type: starprint.type,
      effect: starprint.effect,
      nickname: starprint.consentName ? (starprint.session?.nickname ?? null) : null,
      photoUrl: starprint.consentPhoto ? (starprint.session?.photoUrl ?? null) : null,
      createdAt: starprint.createdAt ? starprint.createdAt.toISOString() : new Date().toISOString(),
    };
    
    this.skyGateway.emitStarCreated(payload);
  }

  private mapToResponse(starprint: Starprint, nickname?: string, photoUrl?: string | null): StarprintResponseDto {
    const typeDef = Object.values(STAR_TYPES).find(t => t.id === starprint.type || t.name === starprint.type) || STAR_TYPES.NAVIGATOR;
    return {
      id: starprint.id,
      sessionId: starprint.sessionId,
      nickname: nickname || '',
      photoUrl: photoUrl || null,
      type: {
        id: typeDef.id,
        name: typeDef.name,
        description: typeDef.description,
      },
      effect: starprint.effect || typeDef.effect,
      palette: starprint.palette,
      baseColor: starprint.baseColor,
      isPublic: starprint.isPublic,
    };
  }
}
