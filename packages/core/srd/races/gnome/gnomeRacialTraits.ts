/**
 * Gnome Racial Traits
 *
 * D&D 3.5 SRD Gnome racial features:
 * - Low-light vision
 * - +2 vs illusion saves
 * - +1 DC to illusion spells cast by gnomes
 * - +1 attack vs kobolds/goblinoids
 * - +4 dodge AC vs giants
 * - +2 Listen, +2 Craft (alchemy)
 * - Weapon Familiarity: gnome hooked hammer as martial
 * - Spell-Like Abilities (separate file: gnomeSpellLikeAbilities.ts)
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';

export const gnomeLowLightVision: StandardEntity = {
  id: 'gnome-low-light-vision',
  entityType: 'racialTrait',
  name: 'Low-Light Vision',
  description:
    'A gnome can see twice as far as a human in starlight, moonlight, torchlight, and similar conditions of poor illumination. He retains the ability to distinguish color and detail under these conditions.',
  tags: ['gnome', 'racial', 'vision'],
};

export const gnomeIllusionResistance: StandardEntity = {
  id: 'gnome-illusion-resistance',
  entityType: 'racialTrait',
  name: 'Illusion Resistance',
  description: '+2 racial bonus on saving throws against illusions.',
  tags: ['gnome', 'racial'],
};

export const gnomeIllusionDCBonus: StandardEntity = {
  id: 'gnome-illusion-dc-bonus',
  entityType: 'racialTrait',
  name: 'Illusion DC Bonus',
  description:
    'Add +1 to the Difficulty Class for all saving throws against illusion spells cast by gnomes. This adjustment stacks with those from similar effects.',
  tags: ['gnome', 'racial'],
};

export const gnomeCombatBonusVsKobolds: StandardEntity = {
  id: 'gnome-combat-vs-kobolds',
  entityType: 'racialTrait',
  name: 'Hatred (Kobolds & Goblinoids)',
  description: '+1 racial bonus on attack rolls against kobolds and goblinoids.',
  tags: ['gnome', 'racial'],
};

export const gnomeDodgeVsGiants: StandardEntity = {
  id: 'gnome-dodge-vs-giants',
  entityType: 'racialTrait',
  name: 'Giant Dodging',
  description: '+4 dodge bonus to Armor Class against monsters of the giant type.',
  tags: ['gnome', 'racial'],
};

export const gnomeSkillBonuses: StandardEntity = {
  id: 'gnome-skill-bonuses',
  entityType: 'racialTrait',
  name: 'Gnome Skill Bonuses',
  description: '+2 racial bonus on Listen checks. +2 racial bonus on Craft (alchemy) checks.',
  tags: ['gnome', 'racial'],
  effects: [
    { target: 'skills.listen.total', formula: '2', bonusType: 'RACIAL' },
    { target: 'skills.craft-alchemy.total', formula: '2', bonusType: 'RACIAL' },
  ],
};

export const gnomeWeaponFamiliarity: StandardEntity = {
  id: 'gnome-weapon-familiarity',
  entityType: 'racialTrait',
  name: 'Weapon Familiarity',
  description:
    'Gnomes may treat gnome hooked hammers as martial weapons rather than exotic weapons.',
  tags: ['gnome', 'racial', 'weaponProficiency'],
};

export const gnomeRacialTraits: StandardEntity[] = [
  gnomeLowLightVision,
  gnomeIllusionResistance,
  gnomeIllusionDCBonus,
  gnomeCombatBonusVsKobolds,
  gnomeDodgeVsGiants,
  gnomeSkillBonuses,
  gnomeWeaponFamiliarity,
];
