/**
 * D&D 3.5 System Levels Entity
 * 
 * Defines the system-wide level progressions for D&D 3.5:
 * - Feat selection at levels 1, 3, 6, 9, 12, 15, 18 (every 3 levels starting at 1)
 * - Ability score increase at levels 4, 8, 12, 16, 20 (every 4 levels)
 * 
 * This entity is resolved BEFORE class providers during level resolution.
 */

import type { SystemLevelsEntity } from '../../core/domain/levels/storage/types';
import type { EntityProvider } from '../../core/domain/levels/providers/types';

// =============================================================================
// Helper functions for creating providers
// =============================================================================

/**
 * Creates a feat selector provider.
 */
function createFeatSelector(): EntityProvider {
  return {
    selector: {
      id: 'character-feat',
      name: 'Character Feat',
      entityType: 'feat',
      filter: {
        type: 'AND',
        filterPolicy: 'strict',
        conditions: [
          { field: 'entityType', operator: '==', value: 'feat' },
        ],
      },
      min: 1,
      max: 1,
    },
  };
}

/**
 * Creates an ability score increase selector provider.
 */
function createAbilityIncreaseSelector(): EntityProvider {
  return {
    selector: {
      id: 'ability-score-increase',
      name: 'Ability Score Increase',
      entityType: 'character_ability_increase',
      filter: {
        type: 'AND',
        filterPolicy: 'strict',
        conditions: [
          { field: 'entityType', operator: '==', value: 'character_ability_increase' },
        ],
      },
      min: 1,
      max: 1,
    },
  };
}

// =============================================================================
// D&D 3.5 System Levels Entity
// =============================================================================

/**
 * The D&D 3.5 system levels entity.
 * 
 * Levels with feat selection: 1, 3, 6, 9, 12, 15, 18
 * Levels with ability increase: 4, 8, 12, 16, 20
 * 
 * Note: Level 12 has both a feat and an ability increase.
 */
export const dnd35SystemLevels: SystemLevelsEntity = {
  id: 'dnd35-system-levels',
  entityType: 'system_levels',
  name: 'D&D 3.5 System Levels',
  description: 'System-wide level progressions for D&D 3.5 (feats and ability increases)',
  
  levels: {
    // Level 1: Feat
    '1': {
      providers: [createFeatSelector()],
    },
    
    // Level 3: Feat
    '3': {
      providers: [createFeatSelector()],
    },
    
    // Level 4: Ability Increase
    '4': {
      providers: [createAbilityIncreaseSelector()],
    },
    
    // Level 6: Feat
    '6': {
      providers: [createFeatSelector()],
    },
    
    // Level 8: Ability Increase
    '8': {
      providers: [createAbilityIncreaseSelector()],
    },
    
    // Level 9: Feat
    '9': {
      providers: [createFeatSelector()],
    },
    
    // Level 12: Feat AND Ability Increase
    '12': {
      providers: [
        createFeatSelector(),
        createAbilityIncreaseSelector(),
      ],
    },
    
    // Level 15: Feat
    '15': {
      providers: [createFeatSelector()],
    },
    
    // Level 16: Ability Increase
    '16': {
      providers: [createAbilityIncreaseSelector()],
    },
    
    // Level 18: Feat
    '18': {
      providers: [createFeatSelector()],
    },
    
    // Level 20: Ability Increase
    '20': {
      providers: [createAbilityIncreaseSelector()],
    },
  },
};

