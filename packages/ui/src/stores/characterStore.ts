import { create } from 'zustand'
import { calculateCharacterSheet } from '@zukus/core'
import type { CharacterSheet, CharacterBaseData } from '@zukus/core'

type CharacterState = {
  characterSheet: CharacterSheet | null
  baseData: CharacterBaseData | null
  /**
   * Tracking de qué ability fue modificada para trigger de animaciones.
   * Se limpia automáticamente después de 1 segundo.
   */
  glowingAbility: string | null
}

type CharacterActions = {
  setCharacter: (characterSheet: CharacterSheet, baseData: CharacterBaseData) => void
  clearCharacter: () => void
  /**
   * TEMPORAL: Toggle de buff directamente en el store.
   * En producción esto debería usar el CharacterUpdater del core.
   * Implementado directamente aquí para pruebas de la UI.
   */
  toggleBuff: (buffUniqueId: string, abilityKey?: string) => void
  clearGlowingAbility: () => void
}

type CharacterStore = CharacterState & CharacterActions

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  // State
  characterSheet: null,
  baseData: null,
  glowingAbility: null,

  // Actions
  setCharacter: (characterSheet, baseData) => {
    set({ characterSheet, baseData })
  },

  clearCharacter: () => {
    set({ characterSheet: null, baseData: null })
  },

  /**
   * TEMPORAL: Toggle de buff directamente en el store.
   *
   * NOTA: Esta implementación es para pruebas de UI únicamente.
   * En producción, se debería usar el CharacterUpdater del core
   * que maneja correctamente la inmutabilidad y validaciones.
   *
   * @param buffUniqueId - El uniqueId del buff a togglear
   * @param abilityKey - Opcional, el ability afectada (para animación de glow)
   */
  toggleBuff: (buffUniqueId: string, abilityKey?: string) => {
    const { baseData } = get()
    if (!baseData) return

    // Crear copia del baseData con el buff toggleado
    const updatedBuffs = baseData.buffs.map((buff) => {
      if (buff.uniqueId === buffUniqueId) {
        return { ...buff, active: !buff.active }
      }
      return buff
    })

    const updatedBaseData: CharacterBaseData = {
      ...baseData,
      buffs: updatedBuffs,
    }

    // Recalcular el character sheet
    const updatedSheet = calculateCharacterSheet(updatedBaseData)

    // Determinar si el buff se activó (para glow)
    const buffWasActivated = updatedBuffs.find((b) => b.uniqueId === buffUniqueId)?.active

    set({
      baseData: updatedBaseData,
      characterSheet: updatedSheet,
      glowingAbility: buffWasActivated && abilityKey ? abilityKey : null,
    })

    // Auto-limpiar glowingAbility después de 1 segundo
    if (buffWasActivated && abilityKey) {
      setTimeout(() => {
        const current = get()
        if (current.glowingAbility === abilityKey) {
          set({ glowingAbility: null })
        }
      }, 1000)
    }
  },

  clearGlowingAbility: () => {
    set({ glowingAbility: null })
  },
}))

// Selectores para acceso granular (evitan re-renders innecesarios)

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
  return useCharacterStore((state) => state.baseData?.buffs ?? [])
}

export function useGlowingAbility() {
  return useCharacterStore((state) => state.glowingAbility)
}
