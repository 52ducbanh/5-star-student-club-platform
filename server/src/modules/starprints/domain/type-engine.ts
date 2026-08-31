import { Injectable } from '@nestjs/common';
import { STAR_TYPES, StarTypeDefinition } from './star-types.config';

@Injectable()
export class TypeEngine {
  determineType(profile: { focus: number; explore: number; energy: number; social: number; adapt: number }): StarTypeDefinition {
    const dims = [
      { key: 'focus', val: profile.focus },
      { key: 'explore', val: profile.explore },
      { key: 'energy', val: profile.energy },
      { key: 'social', val: profile.social },
      { key: 'adapt', val: profile.adapt },
    ];

    // Sort descending with deterministic tie-breaking order: focus > explore > energy > social > adapt
    dims.sort((a, b) => b.val - a.val);
    const dominantKey = dims[0].key;

    switch (dominantKey) {
      case 'focus': return STAR_TYPES.NAVIGATOR;
      case 'explore': return STAR_TYPES.EXPLORER;
      case 'energy': return STAR_TYPES.CATALYST;
      case 'social': return STAR_TYPES.CONNECTOR;
      case 'adapt': return STAR_TYPES.VISIONARY;
      default: return STAR_TYPES.NAVIGATOR;
    }
  }
}

