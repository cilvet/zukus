// Mock data del personaje
export const MOCK_CHARACTER = {
  name: 'Gandalf el Gris',
  level: 15,
  race: 'Humano',
  class: 'Mago',
  hp: { current: 85, max: 120 },
  ac: 15,
  speed: 30,
  proficiencyBonus: 5,
  abilities: {
    strength: { score: 10, modifier: 0 },
    dexterity: { score: 14, modifier: 2 },
    constitution: { score: 14, modifier: 2 },
    intelligence: { score: 20, modifier: 5 },
    wisdom: { score: 18, modifier: 4 },
    charisma: { score: 16, modifier: 3 },
  },
  skills: [
    { name: 'Arcana', modifier: 11, proficient: true },
    { name: 'History', modifier: 11, proficient: true },
    { name: 'Insight', modifier: 8, proficient: true },
    { name: 'Investigation', modifier: 9, proficient: false },
    { name: 'Perception', modifier: 8, proficient: true },
    { name: 'Persuasion', modifier: 7, proficient: false },
  ],
  equipment: [
    { name: 'Staff of Power', type: 'Weapon' },
    { name: 'Robes of the Archmagi', type: 'Armor' },
    { name: 'Ring of Protection', type: 'Wondrous Item' },
    { name: 'Potion of Healing (x3)', type: 'Consumable' },
    { name: 'Spellbook', type: 'Focus' },
  ],
  spells: [
    { name: 'Fireball', level: 3 },
    { name: 'Lightning Bolt', level: 3 },
    { name: 'Counterspell', level: 3 },
    { name: 'Dimension Door', level: 4 },
    { name: 'Teleport', level: 7 },
    { name: 'Wish', level: 9 },
  ],
}

export const ABILITY_INFO: Record<string, { name: string; abbr: string; description: string }> = {
  strength: {
    name: 'Fuerza',
    abbr: 'STR',
    description: 'Mide la potencia fisica, capacidad atletica y la fuerza bruta.',
  },
  dexterity: {
    name: 'Destreza',
    abbr: 'DEX',
    description: 'Mide agilidad, reflejos, equilibrio y coordinacion.',
  },
  constitution: {
    name: 'Constitucion',
    abbr: 'CON',
    description: 'Mide salud, resistencia y fuerza vital.',
  },
  intelligence: {
    name: 'Inteligencia',
    abbr: 'INT',
    description: 'Mide agudeza mental, memoria y capacidad de razonamiento.',
  },
  wisdom: {
    name: 'Sabiduria',
    abbr: 'WIS',
    description: 'Mide percepcion, intuicion e insight.',
  },
  charisma: {
    name: 'Carisma',
    abbr: 'CHA',
    description: 'Mide fuerza de personalidad y liderazgo.',
  },
}

export type Ability = { score: number; modifier: number }
export type Skill = { name: string; modifier: number; proficient: boolean }
export type Equipment = { name: string; type: string }
export type Spell = { name: string; level: number }
