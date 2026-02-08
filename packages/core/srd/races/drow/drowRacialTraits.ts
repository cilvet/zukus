/**
 * Drow (Dark Elf) Racial Traits
 *
 * D&D 3.5 SRD Drow racial features:
 * - Darkvision 120 ft.
 * - Immunity to sleep effects
 * - +2 vs enchantment saves
 * - Spell Resistance 11 + class levels
 * - +2 Will saves vs spells/SLAs
 * - +2 Listen, Search, Spot (Keen Senses)
 * - Light Blindness
 * - Weapon Proficiency: hand crossbow, rapier, short sword
 * - Spell-Like Abilities (separate file: drowSpellLikeAbilities.ts)
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';

export const drowDarkvision: StandardEntity = {
  id: 'drow-darkvision',
  entityType: 'racialTrait',
  name: 'Superior Darkvision',
  description:
    'Drow can see in the dark up to 120 feet. This replaces the standard elven low-light vision.',
  tags: ['drow', 'racial', 'vision'],
};

export const drowImmunityToSleep: StandardEntity = {
  id: 'drow-immunity-to-sleep',
  entityType: 'racialTrait',
  name: 'Immunity to Sleep',
  description: 'Immunity to magic sleep effects.',
  tags: ['drow', 'racial', 'immunity'],
};

export const drowEnchantmentResistance: StandardEntity = {
  id: 'drow-enchantment-resistance',
  entityType: 'racialTrait',
  name: 'Enchantment Resistance',
  description: '+2 racial saving throw bonus against enchantment spells or effects.',
  tags: ['drow', 'racial'],
};

export const drowSpellResistance: StandardEntity = {
  id: 'drow-spell-resistance',
  entityType: 'racialTrait',
  name: 'Spell Resistance',
  description: 'Spell resistance equal to 11 + class levels.',
  tags: ['drow', 'racial'],
  effects: [
    { target: 'customVariable.spellResistance', formula: '11 + @classLevels', bonusType: 'RACIAL' },
  ],
};

export const drowWillSaveVsSpells: StandardEntity = {
  id: 'drow-will-save-vs-spells',
  entityType: 'racialTrait',
  name: 'Strong Will',
  description: '+2 racial bonus on Will saves against spells and spell-like abilities.',
  tags: ['drow', 'racial'],
};

export const drowKeenSenses: StandardEntity = {
  id: 'drow-keen-senses',
  entityType: 'racialTrait',
  name: 'Keen Senses',
  description:
    '+2 racial bonus on Listen, Search, and Spot checks. A drow who merely passes within 5 feet of a secret or concealed door is entitled to a Search check to notice it as if she were actively looking for it.',
  tags: ['drow', 'racial'],
  effects: [
    { target: 'skills.listen.total', formula: '2', bonusType: 'RACIAL' },
    { target: 'skills.search.total', formula: '2', bonusType: 'RACIAL' },
    { target: 'skills.spot.total', formula: '2', bonusType: 'RACIAL' },
  ],
};

export const drowLightBlindness: StandardEntity = {
  id: 'drow-light-blindness',
  entityType: 'racialTrait',
  name: 'Light Blindness',
  description:
    'Abrupt exposure to bright light (such as sunlight or a daylight spell) blinds drow for 1 round. On subsequent rounds, they are dazzled as long as they remain in the affected area.',
  tags: ['drow', 'racial'],
};

export const drowWeaponProficiency: StandardEntity = {
  id: 'drow-weapon-proficiency',
  entityType: 'racialTrait',
  name: 'Drow Weapon Proficiency',
  description:
    'A drow is automatically proficient with the hand crossbow, the rapier, and the short sword. This replaces the standard elven weapon proficiencies.',
  tags: ['drow', 'racial', 'weaponProficiency'],
  legacy_specialChanges: [
    {
      type: 'WEAPON_PROFICIENCY',
      weaponIds: ['hand-crossbow', 'rapier', 'short-sword'],
    },
  ],
};

export const drowRacialTraits: StandardEntity[] = [
  drowDarkvision,
  drowImmunityToSleep,
  drowEnchantmentResistance,
  drowSpellResistance,
  drowWillSaveVsSpells,
  drowKeenSenses,
  drowLightBlindness,
  drowWeaponProficiency,
];
