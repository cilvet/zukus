import { create } from 'zustand'
import type { CharacterSheet, CharacterBaseData } from '@zukus/core'

type CharacterState = {
  characterSheet: CharacterSheet | null
  baseData: CharacterBaseData | null
}

type CharacterActions = {
  setCharacter: (characterSheet: CharacterSheet, baseData: CharacterBaseData) => void
  clearCharacter: () => void
}

type CharacterStore = CharacterState & CharacterActions

export const useCharacterStore = create<CharacterStore>((set) => ({
  // State
  characterSheet: null,
  baseData: null,

  // Actions
  setCharacter: (characterSheet, baseData) => {
    set({ characterSheet, baseData })
  },

  clearCharacter: () => {
    set({ characterSheet: null, baseData: null })
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
