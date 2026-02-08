/**
 * Half-Orc Racial Traits
 *
 * D&D 3.5 SRD Half-Orc racial features:
 * - Darkvision 60 ft.
 * - Orc Blood (counts as orc for effects related to race)
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';

export const halfOrcDarkvision: StandardEntity = {
  id: 'half-orc-darkvision',
  entityType: 'racialTrait',
  name: 'Darkvision',
  description:
    'Half-orcs can see in the dark up to 60 feet. Darkvision is black and white only, but it is otherwise like normal sight, and half-orcs can function just fine with no light at all.',
  tags: ['halfOrc', 'racial', 'vision'],
};

export const halfOrcOrcBlood: StandardEntity = {
  id: 'half-orc-orc-blood',
  entityType: 'racialTrait',
  name: 'Orc Blood',
  description: 'For all effects related to race, a half-orc is considered an orc.',
  tags: ['halfOrc', 'racial'],
};

export const halfOrcRacialTraits: StandardEntity[] = [
  halfOrcDarkvision,
  halfOrcOrcBlood,
];
