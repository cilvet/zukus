/**
 * Rogue Class Entity for D&D 3.5
 * 
 * This file defines the Rogue class as an entity for the levels system.
 * The Rogue is a skill-focused class with sneak attack capability.
 * 
 * Key class features:
 * - Sneak Attack: Extra damage dice when flanking or against flat-footed
 * - Trapfinding: Can use Search to locate traps with DC > 20
 * - Evasion/Improved Evasion: Reflex save negates damage
 * - Trap Sense: Bonus vs traps
 * - Uncanny Dodge: Retains Dex bonus to AC
 * - Special Abilities: Selection at 10th, 13th, 16th, 19th level
 * 
 * ## Variables System
 * 
 * This class uses variables for scaling abilities, allowing expansion by
 * prestige classes or other sources:
 * 
 * - `sneakAttackDiceAmount`: Number of sneak attack dice (scales with level)
 * - `sneakAttackDiceType`: Type of dice for sneak attack (default: 6)
 * - `trapSenseBonus`: Bonus from trap sense (scales with level)
 * 
 * Sneak Attack damage formula: `(@sneakAttackDiceAmount)d(@sneakAttackDiceType)`
 */

import type { StandardEntity } from '../../core/domain/entities/types/base';
import type { EntityProvider } from '../../core/domain/levels/providers/types';

// =============================================================================
// Helper Functions for Creating Providers
// =============================================================================

/**
 * Creates a provider that grants a specific class feature by ID
 */
function grantFeature(featureId: string): EntityProvider {
  return {
    granted: {
      specificIds: [featureId],
    },
  };
}

/**
 * Creates a provider that grants multiple class features by ID
 */
function grantFeatures(...featureIds: string[]): EntityProvider {
  return {
    granted: {
      specificIds: featureIds,
    },
  };
}

/**
 * Creates a provider for special ability selection at high levels
 * Rogues can choose from a pool of special abilities at levels 10, 13, 16, 19
 */
function createSpecialAbilitySelector(level: number): EntityProvider {
  return {
    selector: {
      id: `rogue-special-ability-${level}`,
      name: `Special Ability (Level ${level})`,
      entityType: 'classFeature',
      filter: {
        type: 'AND',
        filterPolicy: 'strict',
        conditions: [
          { field: 'tags', operator: 'contains', value: 'rogueSpecialAbility' },
        ],
      },
      min: 1,
      max: 1,
    },
  };
}

// =============================================================================
// Rogue Class Entity
// =============================================================================

/**
 * Rogue class entity with proper levels structure
 * 
 * Progression:
 * - Sneak Attack: +1d6 at 1st level, +1d6 every odd level (1, 3, 5, 7, 9, 11, 13, 15, 17, 19)
 * - Trap Sense: +1 at 3rd level, +1 every 3 levels (3, 6, 9, 12, 15, 18)
 * - Special Abilities: Selection at 10, 13, 16, 19
 */
export const rogueClass: StandardEntity = {
  id: 'rogue',
  entityType: 'class',
  name: 'Rogue',
  description: 'The rogue\'s focus is on skills and stealth. When she catches an opponent unable to defend himself effectively, she can strike a vital spot for extra damage. Rogues are versatile, able to fill many roles in an adventuring party.',
  
  // Base class statistics
  hitDie: 6,
  babProgression: 'medium',
  saves: {
    fortitude: 'poor',
    reflex: 'good',
    will: 'poor',
  },
  skillPointsPerLevel: '8 + @ability.intelligence.modifier',
  classSkillIds: [
    'appraise',
    'balance',
    'bluff',
    'climb',
    'craft',
    'decipher-script',
    'diplomacy',
    'disable-device',
    'disguise',
    'escape-artist',
    'forgery',
    'gather-information',
    'hide',
    'intimidate',
    'jump',
    'knowledge-local',
    'listen',
    'move-silently',
    'open-lock',
    'perform',
    'profession',
    'search',
    'sense-motive',
    'sleight-of-hand',
    'spot',
    'swim',
    'tumble',
    'use-magic-device',
    'use-rope',
  ],
  classType: 'base',
  
  // Level progression with providers
  // 
  // Note: Sneak Attack and Trap Sense use the variables system.
  // They are granted once (level 1 and 3 respectively) and their
  // values are calculated dynamically based on class level.
  //
  // - sneakAttackDiceAmount = ceil(@class.rogue.level / 2)
  // - sneakAttackDiceType = 6 (base d6)
  // - trapSenseBonus = floor((@class.rogue.level - 1) / 3) for levels >= 3
  //
  levels: {
    '1': { 
      providers: [
        grantFeatures('rogue-sneak-attack', 'rogue-trapfinding'),
      ],
    },
    '2': { 
      providers: [
        grantFeature('rogue-evasion'),
      ],
    },
    '3': { 
      providers: [
        grantFeature('rogue-trap-sense'),
      ],
    },
    '4': { 
      providers: [
        grantFeature('rogue-uncanny-dodge'),
      ],
    },
    '5': { 
      providers: [],
    },
    '6': { 
      providers: [],
    },
    '7': { 
      providers: [],
    },
    '8': { 
      providers: [
        grantFeature('rogue-improved-uncanny-dodge'),
      ],
    },
    '9': { 
      providers: [],
    },
    '10': { 
      providers: [
        createSpecialAbilitySelector(10),
      ],
    },
    '11': { 
      providers: [],
    },
    '12': { 
      providers: [],
    },
    '13': { 
      providers: [
        createSpecialAbilitySelector(13),
      ],
    },
    '14': { 
      providers: [],
    },
    '15': { 
      providers: [],
    },
    '16': { 
      providers: [
        createSpecialAbilitySelector(16),
      ],
    },
    '17': { 
      providers: [],
    },
    '18': { 
      providers: [],
    },
    '19': { 
      providers: [
        createSpecialAbilitySelector(19),
      ],
    },
    '20': { 
      providers: [],
    },
  },
} as StandardEntity;

