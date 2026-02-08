/**
 * Half-Elf Racial Traits
 *
 * D&D 3.5 SRD Half-Elf racial features:
 * - Low-light vision
 * - Immunity to sleep effects
 * - +2 vs enchantment saves
 * - +1 Listen, Search, Spot (partial Keen Senses)
 * - +2 Diplomacy, +2 Gather Information
 * - Elven Blood (counts as elf for effects related to race)
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';

export const halfElfLowLightVision: StandardEntity = {
  id: 'half-elf-low-light-vision',
  entityType: 'racialTrait',
  name: 'Low-Light Vision',
  description:
    'A half-elf can see twice as far as a human in starlight, moonlight, torchlight, and similar conditions of poor illumination. She retains the ability to distinguish color and detail under these conditions.',
  tags: ['halfElf', 'racial', 'vision'],
};

export const halfElfImmunityToSleep: StandardEntity = {
  id: 'half-elf-immunity-to-sleep',
  entityType: 'racialTrait',
  name: 'Immunity to Sleep',
  description: 'Immunity to sleep spells and similar magical effects.',
  tags: ['halfElf', 'racial', 'immunity'],
};

export const halfElfEnchantmentResistance: StandardEntity = {
  id: 'half-elf-enchantment-resistance',
  entityType: 'racialTrait',
  name: 'Enchantment Resistance',
  description: '+2 racial bonus on saving throws against enchantment spells or effects.',
  tags: ['halfElf', 'racial'],
};

export const halfElfKeenSenses: StandardEntity = {
  id: 'half-elf-keen-senses',
  entityType: 'racialTrait',
  name: 'Keen Senses',
  description: '+1 racial bonus on Listen, Search, and Spot checks.',
  tags: ['halfElf', 'racial'],
  effects: [
    { target: 'skills.listen.total', formula: '1', bonusType: 'RACIAL' },
    { target: 'skills.search.total', formula: '1', bonusType: 'RACIAL' },
    { target: 'skills.spot.total', formula: '1', bonusType: 'RACIAL' },
  ],
};

export const halfElfDiplomacy: StandardEntity = {
  id: 'half-elf-diplomacy',
  entityType: 'racialTrait',
  name: 'Social Grace',
  description: '+2 racial bonus on Diplomacy and Gather Information checks.',
  tags: ['halfElf', 'racial'],
  effects: [
    { target: 'skills.diplomacy.total', formula: '2', bonusType: 'RACIAL' },
    { target: 'skills.gather-information.total', formula: '2', bonusType: 'RACIAL' },
  ],
};

export const halfElfElvenBlood: StandardEntity = {
  id: 'half-elf-elven-blood',
  entityType: 'racialTrait',
  name: 'Elven Blood',
  description: 'For all effects related to race, a half-elf is considered an elf.',
  tags: ['halfElf', 'racial'],
};

export const halfElfRacialTraits: StandardEntity[] = [
  halfElfLowLightVision,
  halfElfImmunityToSleep,
  halfElfEnchantmentResistance,
  halfElfKeenSenses,
  halfElfDiplomacy,
  halfElfElvenBlood,
];
