import { ABILITY_INFO } from '../components/character'

const SAVING_THROW_NAMES: Record<string, string> = {
  fortitude: 'Fortitude',
  reflex: 'Reflex',
  will: 'Will',
}

/**
 * Tipos de detalle soportados en la navegación.
 */
export type DetailType = 'ability' | 'savingThrow' | 'armorClass' | 'skill' | 'spell' | 'buff' | 'equipment' | 'item'

/**
 * Configuración de un tipo de detalle.
 */
export type DetailConfig = {
  getTitle: (id: string) => string
}

/**
 * Registry centralizado de tipos de detalle.
 * 
 * Para añadir un nuevo tipo de detalle:
 * 1. Añadir el tipo a DetailType
 * 2. Añadir la entrada aquí con getTitle
 * 3. Crear el componente de detalle
 * 4. Añadirlo a renderDetailContent en los lugares que lo usen
 */
export const DETAIL_REGISTRY: Record<DetailType, DetailConfig> = {
  ability: {
    getTitle: (id) => ABILITY_INFO[id]?.name ?? 'Ability',
  },
  savingThrow: {
    getTitle: (id) => SAVING_THROW_NAMES[id] ?? 'Saving Throw',
  },
  armorClass: {
    getTitle: () => 'Armor Class',
  },
  skill: {
    getTitle: (id) => id.charAt(0).toUpperCase() + id.slice(1),
  },
  spell: {
    getTitle: (id) => id.charAt(0).toUpperCase() + id.slice(1),
  },
  buff: {
    getTitle: (id) => id.charAt(0).toUpperCase() + id.slice(1),
  },
  equipment: {
    getTitle: (id) => id.charAt(0).toUpperCase() + id.slice(1),
  },
  item: {
    getTitle: (id) => id.charAt(0).toUpperCase() + id.slice(1),
  },
}

/**
 * Verifica si un string es un DetailType válido.
 */
export function isValidDetailType(type: string): type is DetailType {
  return type in DETAIL_REGISTRY
}

/**
 * Obtiene el título para un tipo y id de detalle.
 */
export function getDetailTitle(type: DetailType, id: string, customName?: string): string {
  if (customName) {
    return customName
  }
  return DETAIL_REGISTRY[type].getTitle(id)
}
