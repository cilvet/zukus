import { create } from 'zustand'
import { CharacterUpdater } from '@zukus/core'
import type {
  CharacterSheet,
  CharacterBaseData,
  UpdateResult,
  Buff,
  Item,
  Equipment,
  SpecialFeature,
} from '@zukus/core'

type CharacterState = {
  characterSheet: CharacterSheet | null
  baseData: CharacterBaseData | null
  /**
   * Instancia del CharacterUpdater del core.
   * Gestiona todas las operaciones de actualización del personaje.
   */
  updater: CharacterUpdater | null
  syncHandler: ((data: CharacterBaseData) => void) | null
}

type CharacterActions = {
  // Inicialización
  setCharacter: (characterSheet: CharacterSheet, baseData: CharacterBaseData) => void
  clearCharacter: () => void
  setSyncHandler: (handler: ((data: CharacterBaseData) => void) | null) => void

  // Buff Management
  toggleBuff: (buffUniqueId: string) => UpdateResult
  addBuff: (buff: Buff) => UpdateResult
  editBuff: (buff: Buff) => UpdateResult
  deleteBuff: (buffId: string) => UpdateResult
  toggleSharedBuff: (buffId: string) => UpdateResult

  // Equipment Management
  updateEquippedItems: (equipment: Equipment) => UpdateResult
  addItemToInventory: (item: Item) => UpdateResult
  removeItemFromInventory: (itemUniqueId: string) => UpdateResult
  updateItem: (item: Item) => UpdateResult
  toggleItemEquipped: (itemUniqueId: string) => UpdateResult

  // Special Features Management
  addSpecialFeature: (feature: SpecialFeature) => UpdateResult
  updateSpecialFeature: (featureUniqueId: string, feature: SpecialFeature) => UpdateResult
  removeSpecialFeature: (featureUniqueId: string) => UpdateResult
  updateSpecialFeatures: (specialFeatures: SpecialFeature[]) => UpdateResult

  // Character Properties
  updateName: (name: string) => UpdateResult
  updateTheme: (theme: string) => UpdateResult
  updateHp: (hpAdded: number) => UpdateResult
  setCurrentCharacterLevel: (level: number) => UpdateResult

  // Resource Management
  consumeResource: (resourceId: string, amount?: number) => UpdateResult
  rechargeResource: (resourceId: string, amount?: number) => UpdateResult
  rechargeAllResources: () => UpdateResult

  // Rest
  rest: () => UpdateResult
}

type CharacterStore = CharacterState & CharacterActions

const notSetResult: UpdateResult = { success: false, error: 'Character not set' }
const EMPTY_BUFFS: readonly Buff[] = []

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  // State
  characterSheet: null,
  baseData: null,
  updater: null,
  syncHandler: null,

  // =============================================================================
  // Inicialización
  // =============================================================================

  setCharacter: (characterSheet, baseData) => {
    const updater = new CharacterUpdater(baseData, [], (sheet, data) => {
      set({ characterSheet: sheet, baseData: data })
      const handler = get().syncHandler
      if (handler) {
        handler(data)
      }
    })
    set({ characterSheet, baseData, updater })
  },

  clearCharacter: () => {
    set({ characterSheet: null, baseData: null, updater: null, syncHandler: null })
  },

  setSyncHandler: (handler) => {
    set({ syncHandler: handler })
  },

  // =============================================================================
  // Buff Management
  // =============================================================================

  toggleBuff: (buffUniqueId: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.toggleBuff(buffUniqueId)
  },

  addBuff: (buff: Buff) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.addBuff(buff)
  },

  editBuff: (buff: Buff) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.editBuff(buff)
  },

  deleteBuff: (buffId: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.deleteBuff(buffId)
  },

  toggleSharedBuff: (buffId: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.toggleSharedBuff(buffId)
  },

  // =============================================================================
  // Equipment Management
  // =============================================================================

  updateEquippedItems: (equipment: Equipment) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateEquippedItems(equipment)
  },

  addItemToInventory: (item: Item) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.addItemToInventory(item)
  },

  removeItemFromInventory: (itemUniqueId: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.removeItemFromInventory(itemUniqueId)
  },

  updateItem: (item: Item) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateItem(item)
  },

  toggleItemEquipped: (itemUniqueId: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.toggleItemEquipped(itemUniqueId)
  },

  // =============================================================================
  // Special Features Management
  // =============================================================================

  addSpecialFeature: (feature: SpecialFeature) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.addSpecialFeature(feature)
  },

  updateSpecialFeature: (featureUniqueId: string, feature: SpecialFeature) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateSpecialFeature(featureUniqueId, feature)
  },

  removeSpecialFeature: (featureUniqueId: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.removeSpecialFeature(featureUniqueId)
  },

  updateSpecialFeatures: (specialFeatures: SpecialFeature[]) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateSpecialFeatures(specialFeatures)
  },

  // =============================================================================
  // Character Properties
  // =============================================================================

  updateName: (name: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateName(name)
  },

  updateTheme: (theme: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateTheme(theme)
  },

  updateHp: (hpAdded: number) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateHp(hpAdded)
  },

  setCurrentCharacterLevel: (level: number) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.setCurrentCharacterLevel(level)
  },

  // =============================================================================
  // Resource Management
  // =============================================================================

  consumeResource: (resourceId: string, amount?: number) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.consumeResource(resourceId, amount)
  },

  rechargeResource: (resourceId: string, amount?: number) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.rechargeResource(resourceId, amount)
  },

  rechargeAllResources: () => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.rechargeAllResources()
  },

  // =============================================================================
  // Rest
  // =============================================================================

  rest: () => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.rest()
  },
}))

// =============================================================================
// Selectores para acceso granular (evitan re-renders innecesarios)
// =============================================================================

export function useCharacterSheet() {
  return useCharacterStore((state) => state.characterSheet)
}

export function useCharacterBaseData() {
  return useCharacterStore((state) => state.baseData)
}

export function useCharacterName() {
  return useCharacterStore((state) => state.characterSheet?.name ?? '')
}

export function useCharacterLevel() {
  return useCharacterStore((state) => state.characterSheet?.level ?? null)
}

export function useCharacterAbilities() {
  return useCharacterStore((state) => state.characterSheet?.abilityScores ?? null)
}

export function useCharacterHitPoints() {
  return useCharacterStore((state) => state.characterSheet?.hitPoints ?? null)
}

export function useCharacterArmorClass() {
  return useCharacterStore((state) => state.characterSheet?.armorClass ?? null)
}

export function useCharacterInitiative() {
  return useCharacterStore((state) => state.characterSheet?.initiative ?? null)
}

export function useCharacterBAB() {
  return useCharacterStore((state) => state.characterSheet?.baseAttackBonus ?? null)
}

export function useCharacterSavingThrows() {
  return useCharacterStore((state) => state.characterSheet?.savingThrows ?? null)
}

export function useCharacterSkills() {
  return useCharacterStore((state) => state.characterSheet?.skills ?? null)
}

export function useCharacterAttacks() {
  return useCharacterStore((state) => state.characterSheet?.attackData ?? null)
}

export function useCharacterBuffs() {
  return useCharacterStore((state) => state.baseData?.buffs ?? EMPTY_BUFFS)
}

// =============================================================================
// Selectores de acciones (para componentes que solo necesitan acciones)
// =============================================================================

export function useCharacterActions() {
  return useCharacterStore((state) => ({
    // Buff actions
    toggleBuff: state.toggleBuff,
    addBuff: state.addBuff,
    editBuff: state.editBuff,
    deleteBuff: state.deleteBuff,
    toggleSharedBuff: state.toggleSharedBuff,
    // Equipment actions
    updateEquippedItems: state.updateEquippedItems,
    addItemToInventory: state.addItemToInventory,
    removeItemFromInventory: state.removeItemFromInventory,
    updateItem: state.updateItem,
    toggleItemEquipped: state.toggleItemEquipped,
    // Special Features actions
    addSpecialFeature: state.addSpecialFeature,
    updateSpecialFeature: state.updateSpecialFeature,
    removeSpecialFeature: state.removeSpecialFeature,
    updateSpecialFeatures: state.updateSpecialFeatures,
    // Character properties actions
    updateName: state.updateName,
    updateTheme: state.updateTheme,
    updateHp: state.updateHp,
    setCurrentCharacterLevel: state.setCurrentCharacterLevel,
    // Resource actions
    consumeResource: state.consumeResource,
    rechargeResource: state.rechargeResource,
    rechargeAllResources: state.rechargeAllResources,
    // Rest
    rest: state.rest,
  }))
}
