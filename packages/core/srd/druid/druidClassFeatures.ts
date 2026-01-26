/**
 * Druid Class Features for D&D 3.5
 *
 * Contains:
 * - Druid Spellcasting (with CGE configuration)
 * - Animal Companion
 * - Wild Shape
 * - Various nature-themed abilities
 */

import type { StandardEntity } from '../../core/domain/entities/types/base';
import type { CGEConfig, LevelTable } from '../../core/domain/cge/types';
import type { CGEDefinitionChange } from '../../core/domain/character/baseData/specialChanges';

// =============================================================================
// Slot Tables
// =============================================================================

/**
 * Druid spell slots (same progression as Cleric base slots)
 * Index 0 = cantrips (orisons), 1-9 = spell levels 1-9
 */
const DRUID_SLOTS_TABLE: LevelTable = {
  1: [3, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [4, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  4: [5, 3, 2, 0, 0, 0, 0, 0, 0, 0],
  5: [5, 3, 2, 1, 0, 0, 0, 0, 0, 0],
  6: [5, 3, 3, 2, 0, 0, 0, 0, 0, 0],
  7: [6, 4, 3, 2, 1, 0, 0, 0, 0, 0],
  8: [6, 4, 3, 3, 2, 0, 0, 0, 0, 0],
  9: [6, 4, 4, 3, 2, 1, 0, 0, 0, 0],
  10: [6, 4, 4, 3, 3, 2, 0, 0, 0, 0],
  11: [6, 5, 4, 4, 3, 2, 1, 0, 0, 0],
  12: [6, 5, 4, 4, 3, 3, 2, 0, 0, 0],
  13: [6, 5, 5, 4, 4, 3, 2, 1, 0, 0],
  14: [6, 5, 5, 4, 4, 3, 3, 2, 0, 0],
  15: [6, 5, 5, 5, 4, 4, 3, 2, 1, 0],
  16: [6, 5, 5, 5, 4, 4, 3, 3, 2, 0],
  17: [6, 5, 5, 5, 5, 4, 4, 3, 2, 1],
  18: [6, 5, 5, 5, 5, 4, 4, 3, 3, 2],
  19: [6, 5, 5, 5, 5, 5, 4, 4, 3, 3],
  20: [6, 5, 5, 5, 5, 5, 4, 4, 4, 4],
};

// =============================================================================
// CGE Configuration
// =============================================================================

const druidCGEConfig: CGEConfig = {
  id: 'druid-spells',
  classId: 'druid',
  entityType: 'spell',
  levelPath: '@entity.levels.druid',

  // No known config: Druid can prepare any spell from the druid list
  // (no spellbook, full list access)

  tracks: [
    {
      id: 'base',
      resource: {
        type: 'SLOTS',
        table: DRUID_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      preparation: { type: 'BOUND' },
    },
  ],

  variables: {
    classPrefix: 'druid.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.druid',
  },

  labels: {
    known: 'divine_spells',
    prepared: 'prepared_spells',
    slot: 'spell_slot',
    action: 'cast',
  },
};

const druidCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: druidCGEConfig,
};

// =============================================================================
// Class Features
// =============================================================================

/**
 * Druid Spellcasting
 * Grants the druid's divine spellcasting ability with CGE configuration.
 */
export const druidSpellcasting: StandardEntity = {
  id: 'druid-spellcasting',
  entityType: 'classFeature',
  name: 'Divine Spellcasting',
  description:
    'A druid casts divine spells, which are drawn from the druid spell list. A druid must choose and prepare her spells in advance. To prepare or cast a spell, a druid must have a Wisdom score equal to at least 10 + the spell level.',
  tags: ['druidAbility', 'spellcasting', 'divine'],
  legacy_specialChanges: [druidCGEDefinition],
} as StandardEntity;

/**
 * Animal Companion
 */
export const druidAnimalCompanion: StandardEntity = {
  id: 'druid-animal-companion',
  entityType: 'classFeature',
  name: 'Animal Companion',
  description:
    'A druid may begin play with an animal companion selected from the following list: badger, camel, dire rat, dog, riding dog, eagle, hawk, horse (light or heavy), owl, pony, snake (Small or Medium viper), or wolf. This animal is a loyal companion that accompanies the druid on her adventures as appropriate for its kind.',
  tags: ['druidAbility', 'companion'],
} as StandardEntity;

/**
 * Nature Sense
 */
export const druidNatureSense: StandardEntity = {
  id: 'druid-nature-sense',
  entityType: 'classFeature',
  name: 'Nature Sense',
  description:
    'A druid gains a +2 bonus on Knowledge (nature) and Survival checks.',
  tags: ['druidAbility', 'skill'],
} as StandardEntity;

/**
 * Wild Empathy
 */
export const druidWildEmpathy: StandardEntity = {
  id: 'druid-wild-empathy',
  entityType: 'classFeature',
  name: 'Wild Empathy',
  description:
    'A druid can improve the attitude of an animal. This ability functions just like a Diplomacy check made to improve the attitude of a person. The druid rolls 1d20 and adds her druid level and her Charisma modifier to determine the wild empathy check result.',
  tags: ['druidAbility', 'social', 'animal'],
} as StandardEntity;

/**
 * Woodland Stride
 */
export const druidWoodlandStride: StandardEntity = {
  id: 'druid-woodland-stride',
  entityType: 'classFeature',
  name: 'Woodland Stride',
  description:
    'Starting at 2nd level, a druid may move through any sort of undergrowth (such as natural thorns, briars, overgrown areas, and similar terrain) at her normal speed and without taking damage or suffering any other impairment. However, thorns, briars, and overgrown areas that have been magically manipulated to impede motion still affect her.',
  tags: ['druidAbility', 'movement'],
} as StandardEntity;

/**
 * Trackless Step
 */
export const druidTracklessStep: StandardEntity = {
  id: 'druid-trackless-step',
  entityType: 'classFeature',
  name: 'Trackless Step',
  description:
    'Starting at 3rd level, a druid leaves no trail in natural surroundings and cannot be tracked. She may choose to leave a trail if so desired.',
  tags: ['druidAbility', 'stealth'],
} as StandardEntity;

/**
 * Resist Nature's Lure
 */
export const druidResistNaturesLure: StandardEntity = {
  id: 'druid-resist-natures-lure',
  entityType: 'classFeature',
  name: "Resist Nature's Lure",
  description:
    'Starting at 4th level, a druid gains a +4 bonus on saving throws against the spell-like abilities of fey.',
  tags: ['druidAbility', 'defensive', 'saving-throw'],
} as StandardEntity;

/**
 * Wild Shape
 */
export const druidWildShape: StandardEntity = {
  id: 'druid-wild-shape',
  entityType: 'classFeature',
  name: 'Wild Shape',
  description:
    'At 5th level, a druid gains the ability to turn herself into any Small or Medium animal and back again once per day. Her options for new forms include all creatures with the animal type. This ability functions like the polymorph spell, except as noted here.',
  tags: ['druidAbility', 'supernatural', 'transformation'],
  // TODO: Add scaling variable for wild shape uses per day and size categories
} as StandardEntity;

/**
 * Venom Immunity
 */
export const druidVenomImmunity: StandardEntity = {
  id: 'druid-venom-immunity',
  entityType: 'classFeature',
  name: 'Venom Immunity',
  description:
    'At 9th level, a druid gains immunity to all poisons.',
  tags: ['druidAbility', 'defensive', 'immunity'],
} as StandardEntity;

/**
 * A Thousand Faces
 */
export const druidThousandFaces: StandardEntity = {
  id: 'druid-thousand-faces',
  entityType: 'classFeature',
  name: 'A Thousand Faces',
  description:
    'At 13th level, a druid gains the ability to change her appearance at will, as if using the alter self spell, but only while in her normal form.',
  tags: ['druidAbility', 'supernatural', 'transformation'],
} as StandardEntity;

/**
 * Timeless Body
 */
export const druidTimelessBody: StandardEntity = {
  id: 'druid-timeless-body',
  entityType: 'classFeature',
  name: 'Timeless Body',
  description:
    'After attaining 15th level, a druid no longer takes ability score penalties for aging and cannot be magically aged. Any penalties she may have already incurred, however, remain in place. Bonuses still accrue, and the druid still dies of old age when her time is up.',
  tags: ['druidAbility', 'extraordinary', 'aging'],
} as StandardEntity;

// =============================================================================
// Exports
// =============================================================================

export const druidClassFeatures: StandardEntity[] = [
  druidSpellcasting,
  druidAnimalCompanion,
  druidNatureSense,
  druidWildEmpathy,
  druidWoodlandStride,
  druidTracklessStep,
  druidResistNaturesLure,
  druidWildShape,
  druidVenomImmunity,
  druidThousandFaces,
  druidTimelessBody,
];
