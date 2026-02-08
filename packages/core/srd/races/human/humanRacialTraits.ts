/**
 * Human Racial Traits
 *
 * D&D 3.5 SRD:
 * - Bonus Feat: 1 extra feat at 1st level
 * - Bonus Skill Points: 4 extra skill points at 1st level, +1 per additional level
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';

export const humanBonusFeat: StandardEntity = {
  id: 'human-bonus-feat-trait',
  entityType: 'racialTrait',
  name: 'Bonus Feat',
  description:
    'A human gets 1 extra feat at 1st level, in addition to the feat that any 1st-level character gets and the bonus feat granted to a 1st-level human fighter.',
  tags: ['human', 'racial'],
};

export const humanBonusSkillPoints: StandardEntity = {
  id: 'human-bonus-skill-points',
  entityType: 'racialTrait',
  name: 'Bonus Skill Points',
  description:
    '4 extra skill points at 1st level and 1 extra skill point at each additional level.',
  tags: ['human', 'racial'],
  effects: [
    { target: 'customVariable.bonusSkillPointsFirstLevel', formula: '4', bonusType: 'RACIAL' },
    { target: 'customVariable.bonusSkillPointsPerLevel', formula: '1', bonusType: 'RACIAL' },
  ],
};

export const humanRacialTraits: StandardEntity[] = [
  humanBonusFeat,
  humanBonusSkillPoints,
];
