import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { CharacterUpdater } from '@zukus/core'
import type {
  CharacterSheet,
  CharacterBaseData,
  UpdateResult,
  Buff,
  Item,
  Equipment,
  SpecialFeature,
  ComputedEntity,
  Alignment,
} from '@zukus/core'

/**
 * AVISO: NO CAMBIAR - Ver .cursor/rules/code/supabase-sync.mdc
 * 
 * Handler de sincronización global.
 * DEBE ser una variable fuera del store (NO en el state de Zustand).
 * 
 * Razón: React StrictMode hace mount/unmount/mount en desarrollo.
 * Si el handler está en el state del store, hay un momento entre el cleanup
 * y el nuevo effect donde el handler es null, causando pérdida de datos.
 */
let syncHandler: ((data: CharacterBaseData) => void) | null = null

export function setSyncHandler(handler: ((data: CharacterBaseData) => void) | null) {
  syncHandler = handler
}

type CharacterState = {
  characterSheet: CharacterSheet | null
  baseData: CharacterBaseData | null
  /**
   * Instancia del CharacterUpdater del core.
   * Gestiona todas las operaciones de actualización del personaje.
   */
  updater: CharacterUpdater | null
}

type CharacterActions = {
  // Inicialización
  setCharacter: (characterSheet: CharacterSheet, baseData: CharacterBaseData) => void
  clearCharacter: () => void

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

  // Character Description
  updateDescription: (description: string) => UpdateResult
  updateAlignment: (alignment: Alignment | null) => UpdateResult
  updateAge: (age: string) => UpdateResult
  updateGender: (gender: string) => UpdateResult
  updateHeight: (height: string) => UpdateResult
  updateWeight: (weight: string) => UpdateResult
  updateEyes: (eyes: string) => UpdateResult
  updateHair: (hair: string) => UpdateResult
  updateSkin: (skin: string) => UpdateResult
  updateDeity: (deity: string) => UpdateResult
  updateBackground: (background: string) => UpdateResult

  // Resource Management
  consumeResource: (resourceId: string, amount?: number) => UpdateResult
  rechargeResource: (resourceId: string, amount?: number) => UpdateResult
  rechargeAllResources: () => UpdateResult

  // Rest
  rest: () => UpdateResult

  // CGE (Spellcasting) Management
  useSlotForCGE: (cgeId: string, level: number) => UpdateResult
  refreshSlotsForCGE: (cgeId: string) => UpdateResult
  prepareEntityForCGE: (cgeId: string, slotLevel: number, slotIndex: number, entityId: string, trackId?: string) => UpdateResult
  unprepareSlotForCGE: (cgeId: string, slotLevel: number, slotIndex: number, trackId?: string) => UpdateResult
}

type CharacterStore = CharacterState & CharacterActions

const notSetResult: UpdateResult = { success: false, error: 'Character not set' }
const EMPTY_BUFFS: readonly Buff[] = []

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  // State
  characterSheet: null,
  baseData: null,
  updater: null,

  // =============================================================================
  // Inicialización
  // =============================================================================

  setCharacter: (characterSheet, baseData) => {
    const updater = new CharacterUpdater(baseData, [], (sheet, data) => {
      set({ characterSheet: sheet, baseData: data })
      // Llamar al handler de sincronización si está establecido
      if (syncHandler) {
        syncHandler(data)
      }
    })
    set({ characterSheet, baseData, updater })
  },

  clearCharacter: () => {
    set({ characterSheet: null, baseData: null, updater: null })
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
  // Character Description
  // =============================================================================

  updateDescription: (description: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateDescription(description)
  },

  updateAlignment: (alignment: Alignment | null) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateAlignment(alignment)
  },

  updateAge: (age: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateAge(age)
  },

  updateGender: (gender: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateGender(gender)
  },

  updateHeight: (height: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateHeight(height)
  },

  updateWeight: (weight: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateWeight(weight)
  },

  updateEyes: (eyes: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateEyes(eyes)
  },

  updateHair: (hair: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateHair(hair)
  },

  updateSkin: (skin: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateSkin(skin)
  },

  updateDeity: (deity: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateDeity(deity)
  },

  updateBackground: (background: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.updateBackground(background)
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

  // =============================================================================
  // CGE (Spellcasting) Management
  // =============================================================================

  useSlotForCGE: (cgeId: string, level: number) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.useSlotForCGE(cgeId, level)
  },

  refreshSlotsForCGE: (cgeId: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.refreshSlotsForCGE(cgeId)
  },

  prepareEntityForCGE: (cgeId: string, slotLevel: number, slotIndex: number, entityId: string, trackId?: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.prepareEntityForCGE(cgeId, slotLevel, slotIndex, entityId, trackId)
  },

  unprepareSlotForCGE: (cgeId: string, slotLevel: number, slotIndex: number, trackId?: string) => {
    const { updater } = get()
    if (!updater) return notSetResult
    return updater.unprepareSlotForCGE(cgeId, slotLevel, slotIndex, trackId)
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

export function useCharacterImageUrl() {
  return useCharacterStore((state) => (state.baseData as (CharacterBaseData & { imageUrl?: string }) | null)?.imageUrl ?? null)
}

const EMPTY_COMPUTED_ENTITIES: readonly ComputedEntity[] = []
const EMPTY_CGE: Record<string, import('@zukus/core').CalculatedCGE> = {}

export function useComputedEntities() {
  return useCharacterStore((state) => state.characterSheet?.computedEntities ?? EMPTY_COMPUTED_ENTITIES)
}

export function useCGE() {
  return useCharacterStore((state) => state.characterSheet?.cge ?? EMPTY_CGE)
}

/**
 * Returns the first CGE if any exists, or null.
 * Used for the CGE summary tab (ignoring multi-CGE for now).
 */
export function usePrimaryCGE() {
  return useCharacterStore((state) => {
    const cge = state.characterSheet?.cge
    if (!cge) return null
    const keys = Object.keys(cge)
    if (keys.length === 0) return null
    return cge[keys[0]]
  })
}

export function useCharacterBuild() {
  return useCharacterStore((state) => {
    const baseData = state.baseData
    if (!baseData) return null

    const levelsData = baseData.level?.levelsData
    if (!levelsData || levelsData.length === 0) return null

    const classLevels = new Map<string, number>()
    for (const levelData of levelsData) {
      const current = classLevels.get(levelData.classUniqueId) || 0
      classLevels.set(levelData.classUniqueId, current + 1)
    }

    const parts = Array.from(classLevels.entries()).map(([classId, levels]) => {
      const className = baseData.classes?.find((c) => c.uniqueId === classId)?.name || classId
      return `${className} ${levels}`
    })

    return parts.join(' / ')
  })
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
    // Character description actions
    updateDescription: state.updateDescription,
    updateAlignment: state.updateAlignment,
    updateAge: state.updateAge,
    updateGender: state.updateGender,
    updateHeight: state.updateHeight,
    updateWeight: state.updateWeight,
    updateEyes: state.updateEyes,
    updateHair: state.updateHair,
    updateSkin: state.updateSkin,
    updateDeity: state.updateDeity,
    updateBackground: state.updateBackground,
    // Resource actions
    consumeResource: state.consumeResource,
    rechargeResource: state.rechargeResource,
    rechargeAllResources: state.rechargeAllResources,
    // Rest
    rest: state.rest,
    // CGE
    useSlotForCGE: state.useSlotForCGE,
    refreshSlotsForCGE: state.refreshSlotsForCGE,
    prepareEntityForCGE: state.prepareEntityForCGE,
    unprepareSlotForCGE: state.unprepareSlotForCGE,
  }))
}

// =============================================================================
// Character Description Selectors
// =============================================================================

export function useCharacterDescription() {
  return useCharacterStore((state) => state.baseData?.description ?? '')
}

export function useCharacterAlignment() {
  return useCharacterStore((state) => state.baseData?.alignment ?? null)
}

export function useCharacterPhysicalTraits() {
  return useCharacterStore(
    useShallow((state) => ({
      age: state.baseData?.age ?? '',
      gender: state.baseData?.gender ?? '',
      height: state.baseData?.height ?? '',
      weight: state.baseData?.weight ?? '',
      eyes: state.baseData?.eyes ?? '',
      hair: state.baseData?.hair ?? '',
      skin: state.baseData?.skin ?? '',
    }))
  )
}

export function useCharacterBackgroundInfo() {
  return useCharacterStore(
    useShallow((state) => ({
      deity: state.baseData?.deity ?? '',
      background: state.baseData?.background ?? '',
    }))
  )
}
