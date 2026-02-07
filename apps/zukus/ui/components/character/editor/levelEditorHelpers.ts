/**
 * Level Editor Helpers
 *
 * Funciones helper para manejar las actualizaciones de niveles del personaje.
 * Estas funciones utilizan las operaciones del updater para modificar los datos del personaje.
 */

import { ops, dnd35ExampleCompendium, embedTranslations, dnd35FeatsSpanishPack } from '@zukus/core'
import type {
  CharacterBaseData,
  CharacterUpdater,
  ClassEntity,
  LevelSlot,
  EntityProvider,
  StandardEntity,
  SystemLevelsEntity,
} from '@zukus/core'

/**
 * Embeds all available translation packs into an entity.
 */
const packs = [dnd35FeatsSpanishPack]

function embedAllTranslations(entity: StandardEntity): StandardEntity {
  let result = entity
  for (const pack of packs) {
    result = embedTranslations(result, pack)
  }
  return result
}

/**
 * Creates a CompendiumContext from the dnd35ExampleCompendium.
 * Entities are returned with translations embedded so character entities
 * carry their translation data.
 */
function createCompendiumContext() {
  return {
    getClass: (classId: string): ClassEntity | undefined => {
      const classes = dnd35ExampleCompendium.entities['class'] || []
      return classes.find((c) => c.id === classId) as ClassEntity | undefined
    },
    getSystemLevels: (systemLevelsId: string): SystemLevelsEntity | undefined => {
      const systemLevels = dnd35ExampleCompendium.entities['system_levels'] || []
      return systemLevels.find((s) => s.id === systemLevelsId) as SystemLevelsEntity | undefined
    },
    getEntity: (entityType: string, entityId: string): StandardEntity | undefined => {
      const entities = dnd35ExampleCompendium.entities[entityType] || []
      const entity = entities.find((e) => e.id === entityId)
      return entity ? embedAllTranslations(entity) : undefined
    },
    getAllEntities: (entityType: string): StandardEntity[] => {
      const entities = dnd35ExampleCompendium.entities[entityType] || []
      return entities.map(embedAllTranslations)
    },
  }
}

const compendiumContext = createCompendiumContext()

export type ClassOption = {
  id: string
  name: string
  hitDie: number
}

/**
 * Obtiene las clases disponibles del compendium
 */
export function getAvailableClasses(): ClassOption[] {
  const classes = dnd35ExampleCompendium.entities['class'] || []
  return classes.map((classEntity) => ({
    id: classEntity.id,
    name: classEntity.name,
    hitDie: (classEntity as unknown as { hitDie: number }).hitDie,
  }))
}

/**
 * Obtiene el hit die de una clase desde classEntities o compendium
 */
export function getClassHitDie(
  baseData: CharacterBaseData,
  classId: string
): number | null {
  // Primero buscar en las clases del personaje
  if (baseData.classEntities) {
    const characterClass = baseData.classEntities[classId]
    if (characterClass?.hitDie) {
      return characterClass.hitDie as number
    }
  }

  // Si no está en el personaje, buscar en el compendium
  const compendiumClass = compendiumContext.getClass(classId)
  if (compendiumClass?.hitDie) {
    return compendiumClass.hitDie
  }

  return null
}

/**
 * Actualiza la clase de un nivel slot
 * Automatically rolls HP when a class is assigned
 */
export function updateLevelClass(
  baseData: CharacterBaseData,
  characterUpdater: CharacterUpdater,
  slotIndex: number,
  classId: string | null
): void {
  let updatedData = baseData

  // Si se está asignando una clase (no null)
  if (classId) {
    // Verificar si la clase ya existe en classEntities
    const hasClass = updatedData.classEntities && updatedData.classEntities[classId]
    if (!hasClass) {
      // Agregar la clase primero usando el compendiumContext correcto
      const addClassResult = ops.addClass(
        updatedData,
        classId,
        compendiumContext
      )
      updatedData = addClassResult.character
    }

    // Ahora actualizar el slot con la clase
    const setSlotResult = ops.setLevelSlotClass(updatedData, slotIndex, classId)
    updatedData = setSlotResult.character

    // Auto-roll HP for the level
    const hitDie = getClassHitDieFromCompendium(classId)
    if (hitDie) {
      const rolledHp = rollHitDie(hitDie, slotIndex)
      const setHpResult = ops.setLevelSlotHp(updatedData, slotIndex, rolledHp)
      updatedData = setHpResult.character
    }
  } else {
    // Si se está quitando la clase, también quitar el HP
    const setSlotResult = ops.setLevelSlotClass(updatedData, slotIndex, classId)
    updatedData = setSlotResult.character
    
    // Clear HP by setting to 0 (null not supported by type)
    // We'll manually update the slot
    if (updatedData.levelSlots && updatedData.levelSlots[slotIndex]) {
      const levelSlots = [...updatedData.levelSlots]
      levelSlots[slotIndex] = { ...levelSlots[slotIndex], hpRoll: null }
      updatedData = { ...updatedData, levelSlots }
    }
  }

  // Actualizar el personaje
  characterUpdater.updateCharacterBaseData(updatedData)
}

/**
 * Gets the hit die for a class directly from the compendium
 */
function getClassHitDieFromCompendium(classId: string): number | null {
  const compendiumClass = compendiumContext.getClass(classId)
  if (compendiumClass?.hitDie) {
    return compendiumClass.hitDie
  }
  return null
}

/**
 * Actualiza el HP de un nivel slot
 */
export function updateLevelHp(
  baseData: CharacterBaseData,
  characterUpdater: CharacterUpdater,
  slotIndex: number,
  hp: number | null
): void {
  let updatedData = baseData

  if (hp !== null) {
    const setHpResult = ops.setLevelSlotHp(baseData, slotIndex, hp)
    updatedData = setHpResult.character
  } else {
    // Clear HP by manually updating the slot (null not supported by type)
    if (updatedData.levelSlots && updatedData.levelSlots[slotIndex]) {
      const levelSlots = [...updatedData.levelSlots]
      levelSlots[slotIndex] = { ...levelSlots[slotIndex], hpRoll: null }
      updatedData = { ...updatedData, levelSlots }
    }
  }

  // Actualizar el personaje
  characterUpdater.updateCharacterBaseData(updatedData)
}

/**
 * Rolls a hit die for a level slot
 * Level 1 (slotIndex 0) always gets max HP
 * Other levels get a random roll between 1 and hitDie
 */
export function rollHitDie(hitDie: number, slotIndex: number): number {
  // Level 1 always gets max HP
  if (slotIndex === 0) {
    return hitDie
  }
  // Other levels get a random roll
  return Math.floor(Math.random() * hitDie) + 1
}

/**
 * Rolls and sets HP for a level slot
 */
export function rollAndSetLevelHp(
  baseData: CharacterBaseData,
  characterUpdater: CharacterUpdater,
  slotIndex: number,
  hitDie: number
): number {
  const rolledHp = rollHitDie(hitDie, slotIndex)
  updateLevelHp(baseData, characterUpdater, slotIndex, rolledHp)
  return rolledHp
}

/**
 * Obtiene el nivel actual del personaje (desde baseData.level.level)
 */
export function getCurrentLevel(baseData: CharacterBaseData): number {
  return baseData.level?.level || 0
}

/**
 * Asegura que existan suficientes level slots para el nivel dado
 */
export function ensureLevelSlots(
  baseData: CharacterBaseData,
  characterUpdater: CharacterUpdater,
  targetLevel: number
): void {
  let updatedData = baseData
  const currentSlots = updatedData.levelSlots?.length || 0

  // Agregar slots faltantes hasta el nivel 20
  while ((updatedData.levelSlots?.length || 0) < 20) {
    const addSlotResult = ops.addLevelSlot(updatedData)
    updatedData = addSlotResult.character
  }

  const newSlots = updatedData.levelSlots?.length || 0
  if (currentSlots !== newSlots) {
    characterUpdater.updateCharacterBaseData(updatedData)
  }
}

/**
 * Updates the current character level
 * Uses the character updater's setCurrentCharacterLevel which doesn't touch level slots
 */
export function updateCurrentLevel(
  baseData: CharacterBaseData,
  characterUpdater: CharacterUpdater,
  targetLevel: number
): void {
  characterUpdater.setCurrentCharacterLevel(targetLevel)
}

/**
 * Applies a quick build with multiple class entries.
 * Each entry specifies a classId and how many levels of that class.
 * Slots are filled sequentially: e.g. [{Fighter, 3}, {Druid, 4}] → slots 0-2 Fighter, 3-6 Druid.
 * Auto-rolls HP (slot 0 = max, rest random) and saves once.
 */
export function applyQuickBuild(
  baseData: CharacterBaseData,
  characterUpdater: CharacterUpdater,
  entries: { classId: string; levels: number }[]
): void {
  let updatedData = baseData
  let slotIndex = 0

  for (const entry of entries) {
    // Ensure the class exists in classEntities
    const hasClass = updatedData.classEntities && updatedData.classEntities[entry.classId]
    if (!hasClass) {
      const addClassResult = ops.addClass(updatedData, entry.classId, compendiumContext)
      updatedData = addClassResult.character
    }

    const hitDie = getClassHitDieFromCompendium(entry.classId)

    for (let i = 0; i < entry.levels; i++) {
      if (slotIndex >= 20) break

      const setSlotResult = ops.setLevelSlotClass(updatedData, slotIndex, entry.classId)
      updatedData = setSlotResult.character

      if (hitDie) {
        const rolledHp = rollHitDie(hitDie, slotIndex)
        const setHpResult = ops.setLevelSlotHp(updatedData, slotIndex, rolledHp)
        updatedData = setHpResult.character
      }

      slotIndex++
    }
  }

  characterUpdater.updateCharacterBaseData(updatedData)
}

// =============================================================================
// Level Validation Helpers
// =============================================================================

/**
 * Calculates the class level for a specific slot.
 * Counts how many slots with the same classId exist from index 0 to slotIndex (inclusive).
 * 
 * @param levelSlots - Array of level slots
 * @param slotIndex - The slot index to calculate class level for
 * @returns The class level (1-based), or 0 if no class assigned
 */
export function getClassLevelAtSlot(
  levelSlots: LevelSlot[],
  slotIndex: number
): number {
  const targetClassId = levelSlots[slotIndex]?.classId
  if (!targetClassId) return 0
  
  let count = 0
  for (let i = 0; i <= slotIndex; i++) {
    if (levelSlots[i]?.classId === targetClassId) {
      count++
    }
  }
  return count
}

/**
 * Checks if a provider has pending selections (less than minimum required).
 * 
 * @param provider - The provider to check
 * @returns true if there are pending selections, false otherwise
 */
function hasProviderPendingSelections(provider: EntityProvider): boolean {
  if (!provider.selector) {
    return false
  }
  
  const selectedCount = provider.selectedInstanceIds?.length ?? 0
  const minRequired = provider.selector.min
  
  return selectedCount < minRequired
}

/**
 * Result of checking pending selections for a level.
 */
export type LevelPendingSelectionsResult = {
  /** Whether there are any pending selections */
  hasPendingSelections: boolean
  /** Number of pending selections in system providers */
  systemPendingCount: number
  /** Number of pending selections in class providers */
  classPendingCount: number
  /** Total number of pending selections */
  totalPendingCount: number
}

/**
 * Checks if a level slot has any pending selections that need to be completed.
 * 
 * This function checks:
 * - System-level providers for the character level (feats, ability increases)
 * - Class-level providers for the class level (class features, bonus feats)
 * 
 * A selection is considered pending if the provider has a selector with
 * fewer selections than the minimum required.
 * 
 * @param baseData - The character's base data
 * @param slotIndex - The level slot index (0-based)
 * @returns Information about pending selections for this level
 */
export function getLevelPendingSelections(
  baseData: CharacterBaseData,
  slotIndex: number
): LevelPendingSelectionsResult {
  const levelSlots = baseData.levelSlots ?? []
  const currentSlot = levelSlots[slotIndex]
  const characterLevel = slotIndex + 1
  
  let systemPendingCount = 0
  let classPendingCount = 0
  
  // Check system-level providers
  const systemLevels = baseData.systemLevelsEntity
  if (systemLevels) {
    const systemLevelRow = systemLevels.levels?.[String(characterLevel)]
    const systemProviders = systemLevelRow?.providers ?? []
    
    systemProviders.forEach((provider) => {
      if (hasProviderPendingSelections(provider)) {
        systemPendingCount++
      }
    })
  }
  
  // Check class-level providers (only if a class is assigned)
  if (currentSlot?.classId) {
    const classEntity = baseData.classEntities?.[currentSlot.classId]
    if (classEntity) {
      const classLevel = getClassLevelAtSlot(levelSlots, slotIndex)
      const classLevelRow = classEntity.levels?.[String(classLevel)]
      const classProviders = classLevelRow?.providers ?? []
      
      classProviders.forEach((provider) => {
        if (hasProviderPendingSelections(provider)) {
          classPendingCount++
        }
      })
    }
  }
  
  const totalPendingCount = systemPendingCount + classPendingCount
  
  return {
    hasPendingSelections: totalPendingCount > 0,
    systemPendingCount,
    classPendingCount,
    totalPendingCount,
  }
}

/**
 * Simple check if a level has any pending selections.
 * Use this for quick boolean checks (e.g., showing warning icons).
 * 
 * @param baseData - The character's base data
 * @param slotIndex - The level slot index (0-based)
 * @returns true if there are pending selections, false otherwise
 */
export function levelHasPendingSelections(
  baseData: CharacterBaseData,
  slotIndex: number
): boolean {
  return getLevelPendingSelections(baseData, slotIndex).hasPendingSelections
}
