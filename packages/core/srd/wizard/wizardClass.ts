/**
 * Wizard Class Entity for D&D 3.5
 *
 * Arcane spellcaster who prepares spells from a spellbook.
 * Uses Intelligence for spellcasting and has unlimited spells known (spellbook).
 */

import type { StandardEntity } from '../../core/domain/entities/types/base';
import type { EntityProvider } from '../../core/domain/levels/providers/types';

// =============================================================================
// Helpers
// =============================================================================

function grantFeature(featureId: string): EntityProvider {
  return {
    granted: {
      specificIds: [featureId],
    },
  };
}

// =============================================================================
// Wizard Class
// =============================================================================

/**
 * Wizard class entity
 *
 * Key features:
 * - Arcane spellcasting with spellbook (unlimited known)
 * - Vancian preparation (prepare specific spell in each slot)
 * - Intelligence-based spellcasting
 * - Familiar, Scribe Scroll
 * - Poor BAB, good Will save
 */
export const wizardClass: StandardEntity = {
  id: 'wizard',
  entityType: 'class',
  name: 'Wizard',
  description:
    'A wizard is one who has the ability to use magic, but must learn spells from other sources. They are scholarly magic users who have a vast repertoire of spells in their spellbooks, but can only prepare a limited number each day.',

  hitDie: 4,
  babProgression: 'poor',
  saves: {
    fortitude: 'poor',
    reflex: 'poor',
    will: 'good',
  },
  skillPointsPerLevel: '2 + @ability.intelligence.modifier',
  classSkillIds: [
    'concentration',
    'craft',
    'decipher-script',
    'knowledge-arcana',
    'knowledge-architecture',
    'knowledge-dungeoneering',
    'knowledge-geography',
    'knowledge-history',
    'knowledge-local',
    'knowledge-nature',
    'knowledge-nobility',
    'knowledge-planes',
    'knowledge-religion',
    'profession',
    'spellcraft',
  ],
  classType: 'base',

  levels: {
    '1': {
      providers: [
        grantFeature('wizard-spellcasting'),
        grantFeature('wizard-scribe-scroll'),
        grantFeature('wizard-familiar'),
      ],
    },
    '2': { providers: [] },
    '3': { providers: [] },
    '4': { providers: [] },
    '5': { providers: [] }, // Bonus feat
    '6': { providers: [] },
    '7': { providers: [] },
    '8': { providers: [] },
    '9': { providers: [] },
    '10': { providers: [] }, // Bonus feat
    '11': { providers: [] },
    '12': { providers: [] },
    '13': { providers: [] },
    '14': { providers: [] },
    '15': { providers: [] }, // Bonus feat
    '16': { providers: [] },
    '17': { providers: [] },
    '18': { providers: [] },
    '19': { providers: [] },
    '20': { providers: [] }, // Bonus feat
  },
} as StandardEntity;
