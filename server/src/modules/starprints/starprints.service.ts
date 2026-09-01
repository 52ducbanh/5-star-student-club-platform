import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Starprint } from './entities/starprint.entity';
import { TypeEngine } from './domain/type-engine';
import { PaletteEngine } from './domain/palette-engine';
import { STAR_TYPES } from './domain/star-types.config';
import { classifyStarType, STAR_TYPE_DEFINITIONS } from './domain/type-engine-v2';
import { computeWingPalette } from './domain/palette-engine-v2';
import { GenerateStarprintDto, PublishStarprintDto } from './dto/generate-starprint.dto';
import { StarprintResponseDto } from './dto/starprint-response.dto';
import { SessionsService } from '../sessions/sessions.service';
import { ScoringService } from '../games/scoring/scoring.service';
import { GameResult } from '../games/entities/game-result.entity';
import { PlayerSession, SessionStatus } from '../sessions/entities/player-session.entity';
import { DomainException } from '../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../common/exceptions/domain-error.enum';
import { SkyGateway } from '../sky/sky.gateway';
import { aggregateGlobalHiddenProfile } from '../games/scoring/v2/hidden-profile.engine';
import type { SkyStar } from '@5ss/contracts';

function generatePublicStarId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = 'STAR-';
  for (let i = 0; i < 8; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}

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

    // Determine if all 5 results are v2 (have localTraitProfile)
    const allV2 = results.length === 5 && results.every((r) => r.localTraitProfile !== null);

    let starprint: Starprint;

    if (allV2) {
      // --- STARPRINT v2 path ---
      const localProfiles = results.map((r) => r.localTraitProfile!);
      const aggregation = aggregateGlobalHiddenProfile(localProfiles);

      const globalProfile =
        aggregation.status === 'complete'
          ? aggregation.profile
          : (Object.fromEntries(
              Object.entries(aggregation.partialProfile).map(([k, v]) => [k, v ?? 0]),
            ) as any);

      const classification = classifyStarType(globalProfile);
      const wingPalette = computeWingPalette(dto.baseColor, localProfiles);
      const legacyPalette = this.paletteEngine.generatePalette(dto.baseColor);
      const publicStarId = generatePublicStarId();

      starprint = this.starprintRepository.create({
        sessionId: dto.sessionId,
        baseColor: dto.baseColor,
        signatureColor: dto.baseColor,
        publicStarId,
        modelVersion: 'starprint-model-v2',
        paletteAlgorithmVersion: 'oklch-5wing-v2',
        // v2 primary
        wingPalette,
        globalHiddenProfile: globalProfile,
        // Keep palette/type/effect/profile populated for legacy SKY/response compat
        palette: legacyPalette,
        type: classification.type,
        effect: classification.effect,
        profile: globalProfile,
      });
    } else {
      // --- Legacy v1 path ---
      const profile = this.scoringService.aggregateProfiles(results);
      const typeInfo = this.typeEngine.determineType(profile);
      const palette = this.paletteEngine.generatePalette(dto.baseColor);

      starprint = this.starprintRepository.create({
        sessionId: dto.sessionId,
        baseColor: dto.baseColor,
        palette,
        type: typeInfo.id,
        effect: typeInfo.effect,
        profile,
        wingPalette: null,
        globalHiddenProfile: null,
      });
    }

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
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const starprint = await this.starprintRepository.findOne({
      where: isUuid ? { id } : { publicStarId: id },
      relations: ['session'],
    });
    if (!starprint) {
      throw new DomainException(DomainErrorCode.STARPRINT_NOT_FOUND, 'Starprint not found', 404);
    }
    return this.mapToResponse(starprint, starprint.session?.nickname, starprint.session?.photoUrl);
  }

  async publish(id: string, dto: PublishStarprintDto): Promise<void> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const starprint = await this.starprintRepository.findOne({
      where: isUuid ? { id } : { publicStarId: id },
      relations: ['session'],
    });
    if (!starprint) {
      throw new DomainException(DomainErrorCode.STARPRINT_NOT_FOUND, 'Starprint not found', 404);
    }

    const wasAlreadyPublic = starprint.isPublic;
    starprint.isPublic = true;
    starprint.consentName = dto.consentName;
    starprint.consentPhoto = dto.consentPhoto;
    if (!starprint.publishedAt) {
      starprint.publishedAt = new Date();
    }

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

    // Idempotency: Socket.IO event is ONLY emitted on initial publication to prevent duplicate sky events
    if (!wasAlreadyPublic) {
      const payload: SkyStar = {
        id: starprint.publicStarId || starprint.id,
        baseColor: starprint.baseColor,
        palette: starprint.wingPalette || starprint.palette,
        wingPalette: starprint.wingPalette,
        type: starprint.type,
        effect: starprint.effect,
        nickname: starprint.consentName ? (starprint.session?.nickname ?? null) : null,
        photoUrl: starprint.consentPhoto ? (starprint.session?.photoUrl ?? null) : null,
        createdAt: starprint.createdAt ? starprint.createdAt.toISOString() : new Date().toISOString(),
      };
      this.skyGateway.emitStarCreated(payload);
    }
  }

  private mapToResponse(starprint: Starprint, nickname?: string, photoUrl?: string | null): StarprintResponseDto {
    const v2Def = STAR_TYPE_DEFINITIONS[starprint.type as any];
    const legacyDef = Object.values(STAR_TYPES).find((t) => t.id === starprint.type || t.name === starprint.type);
    const typeDef = v2Def
      ? { id: v2Def.id, name: v2Def.name, description: v2Def.description, tagline: v2Def.tagline }
      : legacyDef || STAR_TYPES.NAVIGATOR;

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
      effect: starprint.effect || (typeDef as any).effect,
      palette: starprint.wingPalette || starprint.palette,
      wingPalette: starprint.wingPalette,
      baseColor: starprint.baseColor,
      signatureColor: starprint.signatureColor || starprint.baseColor,
      publicStarId: starprint.publicStarId,
      isPublic: starprint.isPublic,
    };
  }
}
