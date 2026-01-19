import FontAwesome from '@expo/vector-icons/FontAwesome'

// Configuración de las páginas del character pager
export type CharacterPage = {
  key: string
  label: string
  icon: React.ComponentProps<typeof FontAwesome>['name']
}

export const CHARACTER_PAGES: CharacterPage[] = [
  { key: 'combat', label: 'Combate', icon: 'shield' },
  { key: 'abilities', label: 'Atributos', icon: 'star' },
  { key: 'buffs', label: 'Buffs', icon: 'bolt' },
  { key: 'equipment', label: 'Equipo', icon: 'suitcase' },
  { key: 'description', label: 'Descripcion', icon: 'user' },
  { key: 'notes', label: 'Notas', icon: 'pencil' },
  { key: 'entities', label: 'Entidades', icon: 'list' },
]

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

export type ACType = 'total' | 'touch' | 'flatFooted'

export const AC_TYPE_INFO: Record<ACType, { name: string; fullName: string; description: string }> = {
  total: {
    name: 'Total',
    fullName: 'Total AC',
    description: 'Your full Armor Class including armor, shield, Dexterity modifier, size modifier, natural armor, deflection bonuses, and other bonuses.',
  },
  touch: {
    name: 'Touch',
    fullName: 'Touch AC',
    description: 'Your AC against touch attacks. Touch attacks ignore armor, shields, and natural armor bonuses. They include most spells that require an attack roll.',
  },
  flatFooted: {
    name: 'Flat-Footed',
    fullName: 'Flat-Footed AC',
    description: 'Your AC when caught flat-footed (before acting in combat or when unable to react). You lose your Dexterity bonus to AC and some other bonuses.',
  },
}

export type Ability = { score: number; modifier: number }
export type Skill = { name: string; modifier: number; proficient: boolean }
export type Equipment = { name: string; type: string }
export type Spell = { name: string; level: number }
