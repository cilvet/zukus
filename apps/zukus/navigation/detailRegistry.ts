import { ABILITY_INFO } from '../components/character/data'

/**
 * Helper para obtener el nombre de una skill desde el store.
 * Como no podemos usar hooks aquí, necesitaremos que el customName se pase desde donde se llama.
 */
function getSkillName(skillId: string): string {
  // Fallback: capitalizar el skillId
  return skillId.charAt(0).toUpperCase() + skillId.slice(1).replace(/([A-Z])/g, ' $1').trim()
}

const SAVING_THROW_NAMES: Record<string, string> = {
  fortitude: 'Fortitude',
  reflex: 'Reflex',
  will: 'Will',
}

/**
 * Tipos de detalle soportados en la navegación.
 */
export type DetailType =
  | 'ability'
  | 'savingThrow'
  | 'armorClass'
  | 'initiative'
  | 'bab'
  | 'skill'
  | 'chat'
  | 'spell'
  | 'buff'
  | 'buffEdit'
  | 'changeEdit'
  | 'equipment'
  | 'item'
  | 'hitPoints'
  | 'attack'
  | 'levelDetail'
  | 'classSelectorDetail'
  | 'entitySelectorDetail'
  | 'customEntityDetail'
  | 'computedEntity'

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
  initiative: {
    getTitle: () => 'Initiative',
  },
  bab: {
    getTitle: () => 'Base Attack Bonus',
  },
  hitPoints: {
    getTitle: () => 'Hit Points',
  },
  skill: {
    getTitle: (id) => getSkillName(id),
  },
  chat: {
    getTitle: () => 'Chat',
  },
  spell: {
    getTitle: (id) => id.charAt(0).toUpperCase() + id.slice(1),
  },
  buff: {
    getTitle: (id) => id.charAt(0).toUpperCase() + id.slice(1),
  },
  buffEdit: {
    getTitle: () => 'Edit Buff',
  },
  changeEdit: {
    getTitle: (id) => id.includes(':new') ? 'New Change' : 'Edit Change',
  },
  equipment: {
    getTitle: (id) => id.charAt(0).toUpperCase() + id.slice(1),
  },
  item: {
    getTitle: (id) => id.charAt(0).toUpperCase() + id.slice(1),
  },
  attack: {
    getTitle: (id) => id.charAt(0).toUpperCase() + id.slice(1),
  },
  levelDetail: {
    getTitle: (id) => `Nivel ${parseInt(id) + 1}`,
  },
  classSelectorDetail: {
    getTitle: () => 'Seleccionar Clase',
  },
  entitySelectorDetail: {
    getTitle: () => 'Seleccionar Entidad',
  },
  customEntityDetail: {
    getTitle: (id) => id.charAt(0).toUpperCase() + id.slice(1),
  },
  computedEntity: {
    getTitle: (id) => id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, ' $1').trim(),
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
