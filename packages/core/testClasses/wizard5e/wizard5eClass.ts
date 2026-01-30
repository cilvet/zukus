/**
 * Wizard 5e Class Entity (D&D 5th Edition)
 *
 * TEST CLASS - Not D&D 3.5 SRD
 *
 * Arcane spellcaster with flexible preparation (prepare any spells, cast with any slot).
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
// Wizard 5e Class
// =============================================================================

/**
 * Wizard 5e class entity
 *
 * Key features:
 * - Arcane spellcasting with spellbook (unlimited known)
 * - Global list preparation (prepare any spells, not bound to levels)
 * - Can cast any prepared spell with any appropriate slot
 * - Intelligence-based spellcasting
 * - Arcane Recovery
 * - Poor BAB equivalent, Wisdom and Intelligence save proficiency
 */
export const wizard5eClass: StandardEntity = {
  id: 'wizard-5e',
  entityType: 'class',
  name: 'Wizard (5e)',
  description:
    'Wizards are supreme magic-users, defined and united as a class by the spells they cast. Drawing on the subtle weave of magic that permeates the cosmos, wizards cast spells of explosive fire, arcing lightning, subtle deception, and brute-force mind control.',

  hitDie: 6,
  babProgression: 'poor', // Proficiency bonus in 5e, approximated
  saves: {
    fortitude: 'poor', // Constitution save
    reflex: 'poor', // Dexterity save
    will: 'good', // Wisdom save (proficient)
  },
  skillPointsPerLevel: '2 + @ability.intelligence.modifier', // Approximation
  classSkillIds: [
    'arcana',
    'history',
    'insight',
    'investigation',
    'medicine',
    'religion',
  ],
  classType: 'base',

  levels: {
    '1': {
      providers: [
        grantFeature('wizard-5e-spellcasting'),
        grantFeature('wizard-5e-arcane-recovery'),
      ],
    },
    '2': { providers: [] }, // Arcane Tradition
    '3': { providers: [] },
    '4': { providers: [] }, // ASI
    '5': { providers: [] },
    '6': { providers: [] }, // Tradition feature
    '7': { providers: [] },
    '8': { providers: [] }, // ASI
    '9': { providers: [] },
    '10': { providers: [] }, // Tradition feature
    '11': { providers: [] },
    '12': { providers: [] }, // ASI
    '13': { providers: [] },
    '14': { providers: [] }, // Tradition feature
    '15': { providers: [] },
    '16': { providers: [] }, // ASI
    '17': { providers: [] },
    '18': { providers: [] }, // Spell Mastery
    '19': { providers: [] }, // ASI
    '20': { providers: [] }, // Signature Spells
  },
} as StandardEntity;
