// Tipos compartidos de navegación para web y mobile
// Estos tipos definen los parámetros de las pantallas

export type SpellDetailParams = {
  id: string
  name: string
}

export type SpellComponentParams = {
  spellId: string
  componentType: 'verbal' | 'somatic' | 'material'
  componentName: string
}

export type CharacterDetailParams = {
  characterId: string
  section?: 'abilities' | 'skills' | 'inventory' | 'spells'
}

export type AbilityDetailParams = {
  characterId: string
  abilityId: string
  abilityName: string
}

export type SkillDetailParams = {
  characterId: string
  skillId: string
  skillName: string
}

// Rutas disponibles (para referencia)
export const ROUTES = {
  // Tabs
  CHARACTER: '(character)',
  SPELLS: '(spells)',
  SETTINGS: '(settings)',

  // Character stack
  CHARACTER_INDEX: '(character)/index',
  CHARACTER_DETAIL: '(character)/[id]',
  ABILITY_DETAIL: '(character)/ability/[id]',

  // Spells stack
  SPELLS_INDEX: '(spells)/index',
  SPELL_DETAIL: '(spells)/[id]',
  SPELL_COMPONENT: '(spells)/component/[id]',

  // Settings stack
  SETTINGS_INDEX: '(settings)/index',
} as const
