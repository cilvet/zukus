import FontAwesome from '@expo/vector-icons/FontAwesome'
import type { CalculatedCGE } from '@zukus/core'
import { usePrimaryCGE } from '../../ui'

// Configuración de las páginas del character pager
export type CharacterPage = {
  key: string
  label: string
  icon: React.ComponentProps<typeof FontAwesome>['name']
}

/**
 * Base pages without CGE tab.
 */
const BASE_PAGES: CharacterPage[] = [
  { key: 'combat', label: 'Combate', icon: 'shield' },
  { key: 'abilities', label: 'Atributos', icon: 'star' },
  { key: 'inventory', label: 'Inventario', icon: 'suitcase' },
  { key: 'description', label: 'Descripcion', icon: 'user' },
  { key: 'notes', label: 'Notas', icon: 'pencil' },
  { key: 'entities', label: 'Entidades', icon: 'list' },
]

/**
 * @deprecated Use useCharacterPages() instead for dynamic CGE tab
 */
export const CHARACTER_PAGES: CharacterPage[] = BASE_PAGES

/**
 * Returns the localized label for a CGE based on its entityType.
 */
function getCGELabel(cge: CalculatedCGE): string {
  const entityType = cge.entityType

  // Map common entity types to Spanish labels
  const labels: Record<string, string> = {
    spell: 'Conjuros',
    power: 'Poderes',
    maneuver: 'Maniobras',
    invocation: 'Invocaciones',
    infusion: 'Infusiones',
    mystery: 'Misterios',
    utterance: 'Vocablos',
  }

  return labels[entityType] ?? 'Habilidades'
}

/**
 * Hook that returns character pages with CGE tab inserted at position 2 if character has CGE.
 */
export function useCharacterPages(): CharacterPage[] {
  const primaryCGE = usePrimaryCGE()

  if (!primaryCGE) {
    return BASE_PAGES
  }

  // Insert CGE tab at position 2 (after combat and abilities)
  const cgePage: CharacterPage = {
    key: 'cge',
    label: getCGELabel(primaryCGE),
    icon: 'magic',
  }

  return [
    BASE_PAGES[0], // combat
    BASE_PAGES[1], // abilities
    cgePage,       // CGE (new)
    ...BASE_PAGES.slice(2), // rest of pages
  ]
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
