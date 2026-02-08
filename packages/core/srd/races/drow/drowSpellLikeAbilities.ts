/**
 * Drow Spell-Like Abilities
 *
 * D&D 3.5 SRD Drow racial SLAs:
 * - Dancing Lights: 1/day (CL = class levels)
 * - Darkness: 1/day (CL = class levels)
 * - Faerie Fire: 1/day (CL = class levels)
 *
 * Unlike gnome SLAs, drow SLAs have no Charisma requirement and their
 * caster level equals the drow's class levels (not fixed at 1st).
 *
 * CGE Pattern: Same as gnome (NONE/NONE), but caster level is dynamic.
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';
import type { CGEConfig } from '../../../core/domain/cge/types';
import type { CGEDefinitionChange } from '../../../core/domain/character/baseData/specialChanges';

// =============================================================================
// Drow SLA Entities (spellLikeAbility type)
// =============================================================================

export const drowDancingLights: StandardEntity = {
  id: 'drow-sla-dancing-lights',
  entityType: 'spellLikeAbility',
  name: 'Dancing Lights',
  description:
    'A drow can use dancing lights once per day as a spell-like ability. Caster level equals the drow\'s class levels.',
  tags: ['racial', 'drow', 'sla'],
  spellReference: ['dancing-lights'],
  casterLevel: '@classLevels',
  saveDCAbility: 'charisma',
  usesPerDay: 1,
  spellLevel: 0,
  activation: 'standard',
  source: 'racial',
} as StandardEntity;

export const drowDarkness: StandardEntity = {
  id: 'drow-sla-darkness',
  entityType: 'spellLikeAbility',
  name: 'Darkness',
  description:
    'A drow can use darkness once per day as a spell-like ability. Caster level equals the drow\'s class levels.',
  tags: ['racial', 'drow', 'sla'],
  spellReference: ['darkness'],
  casterLevel: '@classLevels',
  saveDCAbility: 'charisma',
  usesPerDay: 1,
  spellLevel: 2,
  activation: 'standard',
  source: 'racial',
} as StandardEntity;

export const drowFaerieFire: StandardEntity = {
  id: 'drow-sla-faerie-fire',
  entityType: 'spellLikeAbility',
  name: 'Faerie Fire',
  description:
    'A drow can use faerie fire once per day as a spell-like ability. Caster level equals the drow\'s class levels.',
  tags: ['racial', 'drow', 'sla'],
  spellReference: ['faerie-fire'],
  casterLevel: '@classLevels',
  saveDCAbility: 'charisma',
  usesPerDay: 1,
  spellLevel: 1,
  activation: 'standard',
  source: 'racial',
} as StandardEntity;

/**
 * All drow SLA entities for the compendium.
 */
export const drowSpellLikeAbilities: StandardEntity[] = [
  drowDancingLights,
  drowDarkness,
  drowFaerieFire,
];

// =============================================================================
// CGE Configuration for Drow SLAs
// =============================================================================

export const drowSLACGEConfig: CGEConfig = {
  id: 'drow-sla',
  classId: 'drow',
  entityType: 'spellLikeAbility',
  levelPath: '@entity.spellLevel',

  tracks: [
    {
      id: 'base',
      label: 'spell_like_abilities',
      resource: { type: 'NONE' },
      preparation: { type: 'NONE' },
    },
  ],

  variables: {
    classPrefix: 'drow.sla',
    genericPrefix: 'sla',
    casterLevelVar: 'casterLevel.drow.sla',
  },

  labels: {
    known: 'spell_like_abilities',
    action: 'use',
  },
};

// =============================================================================
// Racial Trait Entity (classFeature type with CGE definition)
// =============================================================================

const drowSLACGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: drowSLACGEConfig,
};

/**
 * The racial trait entity that defines drow SLAs.
 */
export const drowSpellLikeAbilitiesTrait: StandardEntity = {
  id: 'drow-spell-like-abilities',
  entityType: 'classFeature',
  name: 'Spell-Like Abilities',
  description:
    'A drow can use the following spell-like abilities once per day: dancing lights, darkness, faerie fire. Caster level equals the drow\'s class levels.',
  tags: ['racial', 'drow', 'spellLikeAbility'],
  legacy_specialChanges: [drowSLACGEDefinition],
} as StandardEntity;
