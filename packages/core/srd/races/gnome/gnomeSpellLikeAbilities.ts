/**
 * Gnome Spell-Like Abilities
 *
 * D&D 3.5 SRD Gnome racial SLAs:
 * - speak with animals (burrowing mammals only, 1/day) - CL 1
 * - dancing lights (1/day) - CL 1
 * - ghost sound (1/day) - CL 1
 * - prestidigitation (1/day) - CL 1
 *
 * These are granted as spellLikeAbility entities managed by a CGE
 * defined in the gnome's racial trait (gnome-spell-like-abilities).
 *
 * CGE Pattern for Racial SLAs:
 * ============================
 * Racial SLAs use a simplified CGE pattern:
 * - known: not specified (entities are fixed, granted by the racial trait's providers)
 * - resource: NONE (each SLA tracks its own uses/day via the usesPerDay field)
 * - preparation: NONE (always available)
 *
 * The usesPerDay tracking is handled at the entity level, not via CGE slots/pool.
 * This is the simplest CGE pattern (same as Warlock invocations), where the CGE
 * exists primarily to provide a UI section for managing racial SLAs and to group
 * them under a single "Racial Spell-Like Abilities" panel.
 *
 * For SLAs with uses/day > 0, the app tracks current uses via per-entity resources
 * (similar to how class features like Rage track uses). The CGE groups them in the UI.
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';
import type { CGEConfig } from '../../../core/domain/cge/types';
import type { CGEDefinitionChange } from '../../../core/domain/character/baseData/specialChanges';

// =============================================================================
// Gnome SLA Entities (spellLikeAbility type)
// =============================================================================

export const gnomeDancingLights: StandardEntity = {
  id: 'gnome-sla-dancing-lights',
  entityType: 'spellLikeAbility',
  name: 'Dancing Lights',
  description:
    'A gnome with a Charisma score of at least 10 can use dancing lights once per day as a spell-like ability. Caster level equals 1st. The save DC is Charisma-based.',
  tags: ['racial', 'gnome', 'sla'],
  spellReference: ['dancing-lights'],
  casterLevel: '1',
  saveDCAbility: 'charisma',
  usesPerDay: 1,
  spellLevel: 0,
  activation: 'standard',
  source: 'racial',
} as StandardEntity;

export const gnomeGhostSound: StandardEntity = {
  id: 'gnome-sla-ghost-sound',
  entityType: 'spellLikeAbility',
  name: 'Ghost Sound',
  description:
    'A gnome with a Charisma score of at least 10 can use ghost sound once per day as a spell-like ability. Caster level equals 1st. The save DC is Charisma-based.',
  tags: ['racial', 'gnome', 'sla'],
  spellReference: ['ghost-sound'],
  casterLevel: '1',
  saveDCAbility: 'charisma',
  usesPerDay: 1,
  spellLevel: 0,
  activation: 'standard',
  source: 'racial',
} as StandardEntity;

export const gnomePrestidigitation: StandardEntity = {
  id: 'gnome-sla-prestidigitation',
  entityType: 'spellLikeAbility',
  name: 'Prestidigitation',
  description:
    'A gnome with a Charisma score of at least 10 can use prestidigitation once per day as a spell-like ability. Caster level equals 1st.',
  tags: ['racial', 'gnome', 'sla'],
  spellReference: ['prestidigitation'],
  casterLevel: '1',
  usesPerDay: 1,
  spellLevel: 0,
  activation: 'standard',
  source: 'racial',
} as StandardEntity;

export const gnomeSpeakWithAnimals: StandardEntity = {
  id: 'gnome-sla-speak-with-animals',
  entityType: 'spellLikeAbility',
  name: 'Speak with Animals (Burrowing Mammals)',
  description:
    'A gnome can use speak with animals once per day as a spell-like ability to communicate with burrowing mammals (badgers, foxes, moles, etc.). Caster level equals 1st.',
  tags: ['racial', 'gnome', 'sla'],
  spellReference: ['speak-with-animals'],
  casterLevel: '1',
  usesPerDay: 1,
  spellLevel: 1,
  activation: 'standard',
  source: 'racial',
} as StandardEntity;

/**
 * All gnome SLA entities for the compendium.
 */
export const gnomeSpellLikeAbilities: StandardEntity[] = [
  gnomeDancingLights,
  gnomeGhostSound,
  gnomePrestidigitation,
  gnomeSpeakWithAnimals,
];

// =============================================================================
// CGE Configuration for Gnome SLAs
// =============================================================================

/**
 * CGE config for gnome racial spell-like abilities.
 *
 * This is the simplest possible CGE:
 * - No known limits (entities are granted directly by the racial trait)
 * - No resource tracking at CGE level (each SLA tracks its own uses/day)
 * - No preparation (always available)
 *
 * The CGE serves to group these abilities under a single UI panel
 * labeled "Spell-Like Abilities" in the character sheet.
 */
export const gnomeSLACGEConfig: CGEConfig = {
  id: 'gnome-sla',
  classId: 'gnome', // raceId acts as classId for racial CGEs
  entityType: 'spellLikeAbility',
  levelPath: '@entity.spellLevel',

  // No known config: entities are fixed (granted by providers, not user-selected)
  // known: undefined

  tracks: [
    {
      id: 'base',
      label: 'spell_like_abilities',
      resource: { type: 'NONE' },
      preparation: { type: 'NONE' },
    },
  ],

  variables: {
    classPrefix: 'gnome.sla',
    genericPrefix: 'sla',
    casterLevelVar: 'casterLevel.gnome.sla',
  },

  labels: {
    known: 'spell_like_abilities',
    action: 'use',
  },
};

// =============================================================================
// Racial Trait Entity (classFeature type with CGE definition)
// =============================================================================

const gnomeSLACGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: gnomeSLACGEConfig,
};

/**
 * The racial trait entity that defines gnome SLAs.
 *
 * This is a classFeature-type entity that:
 * 1. Defines a CGE via legacy_specialChanges (groups SLAs in the UI)
 * 2. Gets granted to the character by the gnome race entity's providers
 *
 * The actual SLA entities (dancing-lights, ghost-sound, etc.) are granted
 * separately via the race entity's providers using specificIds.
 */
export const gnomeSpellLikeAbilitiesTrait: StandardEntity = {
  id: 'gnome-spell-like-abilities',
  entityType: 'classFeature',
  name: 'Spell-Like Abilities',
  description:
    'A gnome with a Charisma score of at least 10 also has the following spell-like abilities: 1/day - dancing lights, ghost sound, prestidigitation. Caster level 1st; save DC 10 + spell level + Cha modifier. A gnome can also use speak with animals (burrowing mammals only, duration 1 minute) once per day. His caster level equals 1.',
  tags: ['racial', 'gnome', 'spellLikeAbility'],
  legacy_specialChanges: [gnomeSLACGEDefinition],
} as StandardEntity;
