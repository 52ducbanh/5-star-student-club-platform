import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Starprint } from '../starprints/entities/starprint.entity';
import type { SkyStar } from '@5ss/contracts';

export function mapStarprintToSkyStar(
  sp: Starprint,
  session?: { nickname?: string | null; photoUrl?: string | null } | null,
): SkyStar {
  const sess = session !== undefined ? session : sp.session;
  return {
    id: sp.publicStarId || sp.id,
    baseColor: sp.baseColor,
    palette: sp.wingPalette || sp.palette,
    wingPalette: sp.wingPalette ?? null,
    type: sp.type,
    effect: sp.effect,
    nickname: sp.consentName ? (sess?.nickname ?? null) : null,
    photoUrl: sp.consentPhoto ? (sess?.photoUrl ?? null) : null,
    createdAt: sp.createdAt ? sp.createdAt.toISOString() : new Date().toISOString(),
  };
}

@Injectable()
export class SkyService {
  private cachedStars: SkyStar[] | null = null;
  private cacheExpiresAt = 0;
  private readonly CACHE_TTL_MS = 5000; // 5 seconds in-memory cache

  constructor(
    @InjectRepository(Starprint)
    private readonly starprintRepository: Repository<Starprint>,
  ) {}

  invalidateCache(): void {
    this.cachedStars = null;
    this.cacheExpiresAt = 0;
  }

  async getPublicStars(): Promise<SkyStar[]> {
    const now = Date.now();
    if (this.cachedStars && now < this.cacheExpiresAt) {
      return this.cachedStars;
    }

    const starprints = await this.starprintRepository.find({
      where: { isPublic: true },
      relations: ['session'],
      order: { createdAt: 'DESC' },
      take: 200,
    });

    const stars = starprints.map((sp) => mapStarprintToSkyStar(sp));
    this.cachedStars = stars;
    this.cacheExpiresAt = now + this.CACHE_TTL_MS;
    return stars;
  }
}
