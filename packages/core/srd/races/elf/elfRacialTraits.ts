/**
 * Elf Racial Traits
 *
 * D&D 3.5 SRD Elf racial features:
 * - Low-light vision
 * - Immunity to sleep effects
 * - +2 vs enchantment saves
 * - +2 Listen, Search, Spot (Keen Senses)
 * - Weapon Proficiency: longsword, rapier, longbow, shortbow (including composites)
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';

export const elfLowLightVision: StandardEntity = {
  id: 'elf-low-light-vision',
  entityType: 'racialTrait',
  name: 'Low-Light Vision',
  description:
    'An elf can see twice as far as a human in starlight, moonlight, torchlight, and similar conditions of poor illumination. She retains the ability to distinguish color and detail under these conditions.',
  tags: ['elf', 'racial', 'vision'],
};

export const elfImmunityToSleep: StandardEntity = {
  id: 'elf-immunity-to-sleep',
  entityType: 'racialTrait',
  name: 'Immunity to Sleep',
  description: 'Immunity to magic sleep effects.',
  tags: ['elf', 'racial', 'immunity'],
};

export const elfEnchantmentResistance: StandardEntity = {
  id: 'elf-enchantment-resistance',
  entityType: 'racialTrait',
  name: 'Enchantment Resistance',
  description: '+2 racial saving throw bonus against enchantment spells or effects.',
  tags: ['elf', 'racial'],
};

export const elfKeenSenses: StandardEntity = {
  id: 'elf-keen-senses',
  entityType: 'racialTrait',
  name: 'Keen Senses',
  description:
    '+2 racial bonus on Listen, Search, and Spot checks. An elf who merely passes within 5 feet of a secret or concealed door is entitled to a Search check to notice it as if she were actively looking for it.',
  tags: ['elf', 'racial'],
  effects: [
    { target: 'skills.listen.total', formula: '2', bonusType: 'RACIAL' },
    { target: 'skills.search.total', formula: '2', bonusType: 'RACIAL' },
    { target: 'skills.spot.total', formula: '2', bonusType: 'RACIAL' },
  ],
};

export const elfWeaponProficiency: StandardEntity = {
  id: 'elf-weapon-proficiency',
  entityType: 'racialTrait',
  name: 'Elven Weapon Proficiency',
  description:
    'Elves receive the Martial Weapon Proficiency feats for the longsword, rapier, longbow (including composite longbow), and shortbow (including composite shortbow) as bonus feats.',
  tags: ['elf', 'racial', 'weaponProficiency'],
  legacy_specialChanges: [
    {
      type: 'WEAPON_PROFICIENCY',
      weaponIds: ['longsword', 'rapier', 'longbow', 'composite-longbow', 'shortbow', 'composite-shortbow'],
    },
  ],
};

export const elfRacialTraits: StandardEntity[] = [
  elfLowLightVision,
  elfImmunityToSleep,
  elfEnchantmentResistance,
  elfKeenSenses,
  elfWeaponProficiency,
];
