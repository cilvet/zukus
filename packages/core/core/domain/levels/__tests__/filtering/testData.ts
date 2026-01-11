/**
 * Shared test data for filtering tests
 */

export type TestEntity = {
  id: string;
  name: string;
  type: string;
  school?: string;
  level?: number;
  requiredBab?: number;
  tags?: string[];
};

export const testSpells: TestEntity[] = [
  { id: 'fireball', name: 'Fireball', type: 'spell', school: 'evocation', level: 3 },
  { id: 'magic-missile', name: 'Magic Missile', type: 'spell', school: 'evocation', level: 1 },
  { id: 'charm-person', name: 'Charm Person', type: 'spell', school: 'enchantment', level: 1 },
  { id: 'shield', name: 'Shield', type: 'spell', school: 'abjuration', level: 1 },
];

export const testFeats: TestEntity[] = [
  { id: 'power-attack', name: 'Power Attack', type: 'feat', requiredBab: 1 },
  { id: 'cleave', name: 'Cleave', type: 'feat', requiredBab: 1 },
  { id: 'great-cleave', name: 'Great Cleave', type: 'feat', requiredBab: 4 },
  { id: 'whirlwind-attack', name: 'Whirlwind Attack', type: 'feat', requiredBab: 4 },
  { id: 'improved-critical', name: 'Improved Critical', type: 'feat', requiredBab: 8 },
];

export type SpellWithLevels = {
  id: string;
  name: string;
  type: string;
  school: string;
  levels: Array<{ class: string; level: number }>;
  components: string[];
  meta?: {
    source: string;
    page: number;
  };
};

export const spellsWithLevels: SpellWithLevels[] = [
  {
    id: 'magic-missile',
    name: 'Magic Missile',
    type: 'spell',
    school: 'evocation',
    levels: [
      { class: 'wizard', level: 1 },
      { class: 'sorcerer', level: 1 }
    ],
    components: ['V', 'S'],
    meta: { source: 'PHB', page: 230 }
  },
  {
    id: 'fireball',
    name: 'Fireball',
    type: 'spell',
    school: 'evocation',
    levels: [
      { class: 'wizard', level: 3 },
      { class: 'sorcerer', level: 3 }
    ],
    components: ['V', 'S', 'M'],
    meta: { source: 'PHB', page: 215 }
  },
  {
    id: 'cure-light',
    name: 'Cure Light Wounds',
    type: 'spell',
    school: 'conjuration',
    levels: [
      { class: 'cleric', level: 1 },
      { class: 'druid', level: 1 },
      { class: 'paladin', level: 1 },
      { class: 'ranger', level: 2 }
    ],
    components: ['V', 'S'],
    meta: { source: 'PHB', page: 215 }
  },
  {
    id: 'heal',
    name: 'Heal',
    type: 'spell',
    school: 'conjuration',
    levels: [
      { class: 'cleric', level: 6 },
      { class: 'druid', level: 7 }
    ],
    components: ['V', 'S'],
    meta: { source: 'PHB', page: 239 }
  }
];

