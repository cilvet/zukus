/**
 * Human Race Entity
 *
 * D&D 3.5 SRD Human:
 * - No ability score adjustments
 * - Medium size, 30 ft. speed
 * - 1 bonus feat at 1st level
 * - 4 bonus skill points at 1st level, +1 per additional level
 * - Favored class: Any
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';

export const humanRace: StandardEntity = {
  id: 'human',
  entityType: 'race',
  name: 'Human',
  description:
    'Humans are the most adaptable, flexible, and ambitious people among the common races. They are diverse in their tastes, morals, customs, and habits.',

  // Race fields
  size: 'MEDIUM',
  baseLandSpeed: 30,
  languages: ['common'],
  bonusLanguages: ['any'],
  levelAdjustment: 0,
  racialType: 'humanoid',
  racialSubtypes: ['human'],
  favoredClass: 'any',

  // No ability score adjustments

  levels: {
    '1': {
      providers: [
        {
          granted: {
            specificIds: ['human-bonus-feat-trait', 'human-bonus-skill-points'],
          },
        },
        {
          selector: {
            id: 'human-bonus-feat',
            name: 'Human Bonus Feat',
            entityType: 'feat',
            min: 1,
            max: 1,
          },
        },
      ],
    },
  },
} as StandardEntity;
