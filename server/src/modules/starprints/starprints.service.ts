import { Injectable, HttpStatus } from '@nestjs/common';
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
import { mapStarprintToSkyStar } from '../sky/sky.service';
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
        wingPalette,
        globalHiddenProfile: globalProfile,
        palette: legacyPalette,
        type: classification.type,
        effect: classification.effect,
        profile: globalProfile,
        isPublic: true,
        publishedToSky: true,
        publishedAt: new Date(),
        consentName: true,
        consentPhoto: true,
        physicalCardRequested: true,
        mediaPermission: true,
        eventId: '5ss-khai-hoi-2026',
        eventEdition: '2026.1',
      });
    } else {
      // --- Legacy v1 path ---
      const profile = this.scoringService.aggregateProfiles(results);
      const typeInfo = this.typeEngine.determineType(profile);
      const palette = this.paletteEngine.generatePalette(dto.baseColor);
      const publicStarId = generatePublicStarId();

      starprint = this.starprintRepository.create({
        sessionId: dto.sessionId,
        baseColor: dto.baseColor,
        publicStarId,
        palette,
        type: typeInfo.id,
        effect: typeInfo.effect,
        profile,
        wingPalette: null,
        globalHiddenProfile: null,
        isPublic: true,
        publishedToSky: true,
        publishedAt: new Date(),
        consentName: true,
        consentPhoto: true,
        physicalCardRequested: true,
        mediaPermission: true,
        eventId: 'default-2026',
        eventEdition: '2026.1',
      });
    }

    // Execute state transition atomically within a database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(Starprint, starprint);
      await queryRunner.manager.update(PlayerSession, dto.sessionId, { status: SessionStatus.PUBLISHED });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    // Auto-publish to 5SS Sky realtime event after successful DB commit
    const skyPayload: SkyStar = mapStarprintToSkyStar(starprint, session);
    this.skyGateway.emitStarCreated(skyPayload);

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
    // Only return sessionId if looked up by internal UUID (owner); redact for publicStarId lookups
    return this.mapToResponse(starprint, starprint.session?.nickname, starprint.session?.photoUrl, isUuid);
  }

  async publish(id: string, dto: PublishStarprintDto): Promise<void> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      throw new DomainException(
        DomainErrorCode.UNAUTHORIZED_MUTATION,
        'Public star ID cannot be used for mutation. Starprint UUID and owner session required.',
        HttpStatus.FORBIDDEN,
      );
    }

    const starprint = await this.starprintRepository.findOne({
      where: { id },
      relations: ['session'],
    });
    if (!starprint) {
      throw new DomainException(DomainErrorCode.STARPRINT_NOT_FOUND, 'Starprint not found', 404);
    }

    if (!dto.sessionId || starprint.sessionId !== dto.sessionId) {
      throw new DomainException(
        DomainErrorCode.UNAUTHORIZED_SESSION,
        'Unauthorized: session does not own this starprint',
        HttpStatus.FORBIDDEN,
      );
    }

    // Product rule: consentName and consentPhoto are always true.
    // The user-facing checkboxes for these have been removed; nickname and
    // portrait are always included in the 5SS Sky public display.
    starprint.consentName = true;
    starprint.consentPhoto = true;

    // Physical card rule: If physical_card_requested = true then media_permission = true
    if (dto.physicalCardRequested) {
      starprint.physicalCardRequested = true;
      starprint.mediaPermission = true;
    } else if (dto.physicalCardRequested !== undefined) {
      starprint.physicalCardRequested = false;
      if (dto.mediaPermission !== undefined) {
        starprint.mediaPermission = dto.mediaPermission;
      }
    } else if (dto.mediaPermission !== undefined) {
      starprint.mediaPermission = dto.mediaPermission;
    }

    starprint.isPublic = true;
    starprint.publishedToSky = true;
    if (!starprint.publishedAt) {
      starprint.publishedAt = new Date();
    }

    await this.starprintRepository.save(starprint);
  }

  private mapToResponse(
    starprint: Starprint,
    nickname?: string,
    photoUrl?: string | null,
    includeSessionId = true,
  ): StarprintResponseDto {
    const v2Def = STAR_TYPE_DEFINITIONS[starprint.type as any];
    const legacyDef = Object.values(STAR_TYPES).find((t) => t.id === starprint.type || t.name === starprint.type);
    const typeDef = v2Def
      ? { id: v2Def.id, name: v2Def.name, description: v2Def.description, tagline: v2Def.tagline }
      : legacyDef || STAR_TYPES.NAVIGATOR;

    return {
      id: starprint.id,
      sessionId: includeSessionId ? starprint.sessionId : '',
      nickname: nickname || '',
      photoUrl: photoUrl || null,
      type: {
        id: typeDef.id,
        name: typeDef.name,
        tagline: (typeDef as any).tagline,
        description: typeDef.description,
      },
      effect: starprint.effect || (typeDef as any).effect,
      palette: starprint.wingPalette || starprint.palette,
      wingPalette: starprint.wingPalette,
      baseColor: starprint.baseColor,
      signatureColor: starprint.signatureColor || starprint.baseColor,
      publicStarId: starprint.publicStarId,
      globalProfile7D: starprint.globalHiddenProfile || null,
      isPublic: starprint.isPublic,
      publishedToSky: starprint.publishedToSky ?? true,
      physicalCardRequested: starprint.physicalCardRequested ?? true,
      mediaPermission: starprint.mediaPermission ?? true,
      eventId: starprint.eventId ?? 'default-2026',
      eventEdition: starprint.eventEdition ?? '2026.1',
    };
  }
}
