/**
 * D&D 3.5 Example Buffs
 *
 * Classic buff spells that can be applied to characters.
 * These are compendium entities that get instantiated as Buff objects
 * when applied to a character.
 */

import type { StandardEntity } from '../../../entities/types/base';
import { SavingThrowId } from '../../../class/saves';

// Type for buff entities in the compendium
type BuffEntity = StandardEntity & {
  category?: string;
  spellLevel?: number;
  duration?: string;
};

// =============================================================================
// Ability Enhancement Spells (+4 Enhancement Bonus)
// =============================================================================

const abilityEnhancementBuffs: BuffEntity[] = [
  {
    id: 'buff-bulls-strength',
    entityType: 'buff',
    name: "Bull's Strength",
    description: 'The subject becomes stronger. The spell grants a +4 enhancement bonus to Strength.',
    category: 'Transmutation',
    spellLevel: 2,
    duration: '1 min/level',
    tags: ['ability', 'enhancement', 'strength'],
    legacy_changes: [
      {
        type: 'ABILITY_SCORE',
        abilityUniqueId: 'strength',
        formula: { expression: '4' },
        bonusTypeId: 'ENHANCEMENT',
      },
    ],
  },
  {
    id: 'buff-cats-grace',
    entityType: 'buff',
    name: "Cat's Grace",
    description: 'The subject becomes more graceful. The spell grants a +4 enhancement bonus to Dexterity.',
    category: 'Transmutation',
    spellLevel: 2,
    duration: '1 min/level',
    tags: ['ability', 'enhancement', 'dexterity'],
    legacy_changes: [
      {
        type: 'ABILITY_SCORE',
        abilityUniqueId: 'dexterity',
        formula: { expression: '4' },
        bonusTypeId: 'ENHANCEMENT',
      },
    ],
  },
  {
    id: 'buff-bears-endurance',
    entityType: 'buff',
    name: "Bear's Endurance",
    description: 'The subject becomes hardier. The spell grants a +4 enhancement bonus to Constitution.',
    category: 'Transmutation',
    spellLevel: 2,
    duration: '1 min/level',
    tags: ['ability', 'enhancement', 'constitution'],
    legacy_changes: [
      {
        type: 'ABILITY_SCORE',
        abilityUniqueId: 'constitution',
        formula: { expression: '4' },
        bonusTypeId: 'ENHANCEMENT',
      },
    ],
  },
  {
    id: 'buff-foxs-cunning',
    entityType: 'buff',
    name: "Fox's Cunning",
    description: 'The subject becomes smarter. The spell grants a +4 enhancement bonus to Intelligence.',
    category: 'Transmutation',
    spellLevel: 2,
    duration: '1 min/level',
    tags: ['ability', 'enhancement', 'intelligence'],
    legacy_changes: [
      {
        type: 'ABILITY_SCORE',
        abilityUniqueId: 'intelligence',
        formula: { expression: '4' },
        bonusTypeId: 'ENHANCEMENT',
      },
    ],
  },
  {
    id: 'buff-owls-wisdom',
    entityType: 'buff',
    name: "Owl's Wisdom",
    description: 'The subject becomes wiser. The spell grants a +4 enhancement bonus to Wisdom.',
    category: 'Transmutation',
    spellLevel: 2,
    duration: '1 min/level',
    tags: ['ability', 'enhancement', 'wisdom'],
    legacy_changes: [
      {
        type: 'ABILITY_SCORE',
        abilityUniqueId: 'wisdom',
        formula: { expression: '4' },
        bonusTypeId: 'ENHANCEMENT',
      },
    ],
  },
  {
    id: 'buff-eagles-splendor',
    entityType: 'buff',
    name: "Eagle's Splendor",
    description: 'The subject becomes more charismatic. The spell grants a +4 enhancement bonus to Charisma.',
    category: 'Transmutation',
    spellLevel: 2,
    duration: '1 min/level',
    tags: ['ability', 'enhancement', 'charisma'],
    legacy_changes: [
      {
        type: 'ABILITY_SCORE',
        abilityUniqueId: 'charisma',
        formula: { expression: '4' },
        bonusTypeId: 'ENHANCEMENT',
      },
    ],
  },
];

// =============================================================================
// Defensive Spells
// =============================================================================

const defensiveBuffs: BuffEntity[] = [
  {
    id: 'buff-shield-of-faith',
    entityType: 'buff',
    name: 'Shield of Faith',
    description: 'This spell creates a shimmering, magical field around the subject that grants a +2 deflection bonus to AC.',
    category: 'Abjuration',
    spellLevel: 1,
    duration: '1 min/level',
    tags: ['defensive', 'ac', 'deflection'],
    legacy_changes: [
      {
        type: 'AC',
        formula: { expression: '2' },
        bonusTypeId: 'DEFLECTION',
      },
    ],
  },
  {
    id: 'buff-barkskin',
    entityType: 'buff',
    name: 'Barkskin',
    description: "The subject's skin becomes tough and bark-like, granting a +2 enhancement bonus to natural armor.",
    category: 'Transmutation',
    spellLevel: 2,
    duration: '10 min/level',
    tags: ['defensive', 'ac', 'natural-armor'],
    legacy_changes: [
      {
        type: 'NATURAL_AC',
        formula: { expression: '2' },
        bonusTypeId: 'ENHANCEMENT',
      },
    ],
  },
  {
    id: 'buff-mage-armor',
    entityType: 'buff',
    name: 'Mage Armor',
    description: 'An invisible but tangible field of force surrounds the subject, providing a +4 armor bonus to AC.',
    category: 'Conjuration',
    spellLevel: 1,
    duration: '1 hour/level',
    tags: ['defensive', 'ac', 'armor'],
    legacy_changes: [
      {
        type: 'AC',
        formula: { expression: '4' },
        bonusTypeId: 'ARMOR',
      },
    ],
  },
  {
    id: 'buff-shield',
    entityType: 'buff',
    name: 'Shield',
    description: 'An invisible disc of force hovers in front of you, providing a +4 shield bonus to AC.',
    category: 'Abjuration',
    spellLevel: 1,
    duration: '1 min/level',
    tags: ['defensive', 'ac', 'shield'],
    legacy_changes: [
      {
        type: 'AC',
        formula: { expression: '4' },
        bonusTypeId: 'SHIELD',
      },
    ],
  },
];

// =============================================================================
// Combat Enhancement Spells
// =============================================================================

const combatBuffs: BuffEntity[] = [
  {
    id: 'buff-bless',
    entityType: 'buff',
    name: 'Bless',
    description: 'Allies gain a +1 morale bonus on attack rolls and saves against fear effects.',
    category: 'Enchantment',
    spellLevel: 1,
    duration: '1 min/level',
    tags: ['combat', 'morale', 'attack'],
    legacy_changes: [
      {
        type: 'ATTACK_ROLLS',
        attackType: 'all',
        formula: { expression: '1' },
        bonusTypeId: 'MORALE',
      },
      {
        type: 'SAVING_THROW',
        savingThrowUniqueId: SavingThrowId.ALL,
        formula: { expression: '1' },
        bonusTypeId: 'MORALE',
      },
    ],
  },
  {
    id: 'buff-heroism',
    entityType: 'buff',
    name: 'Heroism',
    description: 'The subject gains a +2 morale bonus on attack rolls, saves, and skill checks.',
    category: 'Enchantment',
    spellLevel: 3,
    duration: '10 min/level',
    tags: ['combat', 'morale', 'attack', 'saves'],
    legacy_changes: [
      {
        type: 'ATTACK_ROLLS',
        attackType: 'all',
        formula: { expression: '2' },
        bonusTypeId: 'MORALE',
      },
      {
        type: 'SAVING_THROW',
        savingThrowUniqueId: SavingThrowId.ALL,
        formula: { expression: '2' },
        bonusTypeId: 'MORALE',
      },
    ],
  },
  {
    id: 'buff-greater-heroism',
    entityType: 'buff',
    name: 'Greater Heroism',
    description: 'The subject gains a +4 morale bonus on attack rolls, saves, and skill checks, plus temporary HP.',
    category: 'Enchantment',
    spellLevel: 6,
    duration: '1 min/level',
    tags: ['combat', 'morale', 'attack', 'saves'],
    legacy_changes: [
      {
        type: 'ATTACK_ROLLS',
        attackType: 'all',
        formula: { expression: '4' },
        bonusTypeId: 'MORALE',
      },
      {
        type: 'SAVING_THROW',
        savingThrowUniqueId: SavingThrowId.ALL,
        formula: { expression: '4' },
        bonusTypeId: 'MORALE',
      },
      {
        type: 'TEMPORARY_HP',
        formula: { expression: '20' },
        bonusTypeId: 'UNTYPED',
      },
    ],
  },
  {
    id: 'buff-divine-favor',
    entityType: 'buff',
    name: 'Divine Favor',
    description: 'You gain a +1 luck bonus on attack and weapon damage rolls for every three caster levels.',
    category: 'Evocation',
    spellLevel: 1,
    duration: '1 minute',
    tags: ['combat', 'luck', 'attack', 'damage'],
    legacy_changes: [
      {
        type: 'ATTACK_ROLLS',
        attackType: 'all',
        formula: { expression: '1' },
        bonusTypeId: 'LUCK',
      },
      {
        type: 'DAMAGE',
        formula: { expression: '1' },
        bonusTypeId: 'LUCK',
      },
    ],
  },
];

// =============================================================================
// Speed and Movement Spells
// =============================================================================

const speedBuffs: BuffEntity[] = [
  {
    id: 'buff-haste',
    entityType: 'buff',
    name: 'Haste',
    description: 'The transmuted creatures move and act more quickly. +1 attack, +1 AC, +1 Reflex, +30 ft speed.',
    category: 'Transmutation',
    spellLevel: 3,
    duration: '1 round/level',
    tags: ['speed', 'combat', 'ac'],
    legacy_changes: [
      {
        type: 'ATTACK_ROLLS',
        attackType: 'all',
        formula: { expression: '1' },
        bonusTypeId: 'UNTYPED',
      },
      {
        type: 'AC',
        formula: { expression: '1' },
        bonusTypeId: 'DODGE',
      },
      {
        type: 'SAVING_THROW',
        savingThrowUniqueId: SavingThrowId.REFLEX,
        formula: { expression: '1' },
        bonusTypeId: 'UNTYPED',
      },
      {
        type: 'SPEED',
        speedUniqueId: 'land',
        formula: { expression: '30' },
        bonusTypeId: 'ENHANCEMENT',
      },
    ],
  },
  {
    id: 'buff-expeditious-retreat',
    entityType: 'buff',
    name: 'Expeditious Retreat',
    description: 'Your base land speed increases by 30 feet.',
    category: 'Transmutation',
    spellLevel: 1,
    duration: '1 min/level',
    tags: ['speed', 'movement'],
    legacy_changes: [
      {
        type: 'SPEED',
        speedUniqueId: 'land',
        formula: { expression: '30' },
        bonusTypeId: 'ENHANCEMENT',
      },
    ],
  },
];

// =============================================================================
// Resistance Spells
// =============================================================================

const resistanceBuffs: BuffEntity[] = [
  {
    id: 'buff-resistance',
    entityType: 'buff',
    name: 'Resistance',
    description: 'The subject gains a +1 resistance bonus on saves.',
    category: 'Abjuration',
    spellLevel: 0,
    duration: '1 minute',
    tags: ['resistance', 'saves'],
    legacy_changes: [
      {
        type: 'SAVING_THROW',
        savingThrowUniqueId: SavingThrowId.ALL,
        formula: { expression: '1' },
        bonusTypeId: 'RESISTANCE',
      },
    ],
  },
  {
    id: 'buff-protection-from-evil',
    entityType: 'buff',
    name: 'Protection from Evil',
    description: 'The subject gains a +2 deflection bonus to AC and +2 resistance bonus on saves against evil creatures.',
    category: 'Abjuration',
    spellLevel: 1,
    duration: '1 min/level',
    tags: ['protection', 'ac', 'saves'],
    legacy_changes: [
      {
        type: 'AC',
        formula: { expression: '2' },
        bonusTypeId: 'DEFLECTION',
      },
      {
        type: 'SAVING_THROW',
        savingThrowUniqueId: SavingThrowId.ALL,
        formula: { expression: '2' },
        bonusTypeId: 'RESISTANCE',
      },
    ],
  },
];

// =============================================================================
// Exports
// =============================================================================

export const abilityBuffs = abilityEnhancementBuffs;
export const defenseBuffs = defensiveBuffs;
export const combatEnhancementBuffs = combatBuffs;
export const movementBuffs = speedBuffs;
export const saveBuffs = resistanceBuffs;

export const allBuffs: StandardEntity[] = [
  ...abilityEnhancementBuffs,
  ...defensiveBuffs,
  ...combatBuffs,
  ...speedBuffs,
  ...resistanceBuffs,
];
