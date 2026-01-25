/**
 * System configuration constants
 */

export const DND35ZUKUS = {
  /**
   * Ability score identifiers
   */
  abilities: {
    strength: 'strength',
    dexterity: 'dexterity',
    constitution: 'constitution',
    intelligence: 'intelligence',
    wisdom: 'wisdom',
    charisma: 'charisma',
  },

  /**
   * Ability abbreviations
   */
  abilityAbbreviations: {
    strength: 'STR',
    dexterity: 'DEX',
    constitution: 'CON',
    intelligence: 'INT',
    wisdom: 'WIS',
    charisma: 'CHA',
  },

  /**
   * Size categories
   */
  sizes: {
    FINE: 'Fine',
    DIMINUTIVE: 'Diminutive',
    TINY: 'Tiny',
    SMALL: 'Small',
    MEDIUM: 'Medium',
    LARGE: 'Large',
    HUGE: 'Huge',
    GARGANTUAN: 'Gargantuan',
    COLOSSAL: 'Colossal',
  },

  /**
   * Saving throw types
   */
  saves: {
    fortitude: 'Fortitude',
    reflex: 'Reflex',
    will: 'Will',
  },

  /**
   * Bonus types (for stacking rules)
   */
  bonusTypes: {
    BASE: 'Base',
    UNTYPED: 'Untyped',
    ENHANCEMENT: 'Enhancement',
    MORALE: 'Morale',
    LUCK: 'Luck',
    INSIGHT: 'Insight',
    COMPETENCE: 'Competence',
    SACRED: 'Sacred',
    PROFANE: 'Profane',
    DODGE: 'Dodge',
    DEFLECTION: 'Deflection',
    NATURAL: 'Natural',
    ARMOR: 'Armor',
    SHIELD: 'Shield',
    SIZE: 'Size',
    RACIAL: 'Racial',
    CIRCUMSTANCE: 'Circumstance',
    RESISTANCE: 'Resistance',
  },
};

// Make config available globally for Foundry
declare global {
  interface CONFIG {
    DND35ZUKUS: typeof DND35ZUKUS;
  }
}
