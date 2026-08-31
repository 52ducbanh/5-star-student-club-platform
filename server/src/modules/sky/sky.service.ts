import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Starprint } from '../starprints/entities/starprint.entity';
import type { SkyStar } from '@5ss/contracts';

@Injectable()
export class SkyService {
  constructor(
    @InjectRepository(Starprint)
    private readonly starprintRepository: Repository<Starprint>,
  ) {}

  async getPublicStars(): Promise<SkyStar[]> {
    const starprints = await this.starprintRepository.find({
      where: { isPublic: true },
      relations: ['session'],
      order: { createdAt: 'DESC' },
    });

    return starprints.map(sp => ({
      id: sp.id,
      baseColor: sp.baseColor,
      palette: sp.palette,
      type: sp.type,
      effect: sp.effect,
      nickname: sp.consentName ? (sp.session?.nickname ?? null) : null,
      photoUrl: sp.consentPhoto ? (sp.session?.photoUrl ?? null) : null,
      createdAt: sp.createdAt ? sp.createdAt.toISOString() : new Date().toISOString(),
    }));
  }
}
