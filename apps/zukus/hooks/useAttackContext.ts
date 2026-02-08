import { useState } from 'react'
import type {
  CalculatedAttack,
  AttackContextualChange,
  CalculatedAttackData,
  ResolvedAttackContextualChange,
  ResolvedContextualVariable,
  Weapon,
} from '@zukus/core'
import {
  calculateAttackBonus,
  getAttackDamageFormula,
} from '@zukus/core'
import { useCharacterSheet } from '../ui'

export type AttackContextState = {
  selectedChanges: Set<string>
  variables: Record<string, Record<string, number>>
}

export type UseAttackContextResult = {
  /** Ataque recalculado con los contextual changes aplicados */
  calculatedAttack: CalculatedAttack
  /** Lista de contextual changes aplicables a este ataque */
  availableContextualChanges: AttackContextualChange[]
  /** Set de nombres de cambios seleccionados */
  selectedChanges: Set<string>
  /** Variables por cambio: { changeName: { variableId: value } } */
  variables: Record<string, Record<string, number>>
  /** Substitution index con variables del personaje y contextual changes */
  substitutionIndex: Record<string, number>
  /** Alternar selección de un cambio */
  toggleChange: (changeName: string) => void
  /** Actualizar valor de una variable */
  updateVariable: (changeName: string, variableId: string, value: number) => void
  /** Obtener los contextual changes seleccionados con sus variables resueltas */
  getSelectedContextualChanges: () => ResolvedAttackContextualChange[]
}

/**
 * Finds a weapon by uniqueId in the attack data weapons array.
 * This includes both legacy equipment weapons and inventory weapons.
 */
function findWeaponById(
  weapons: Weapon[] | undefined,
  weaponUniqueId: string
): Weapon | null {
  return weapons?.find((w) => w.uniqueId === weaponUniqueId) ?? null
}

/**
 * Hook para manejar el contexto de ataque (contextual changes seleccionados).
 * Filtra los cambios disponibles según el tipo de ataque, maneja el estado de selección,
 * y recalcula el ataque cuando cambian los contextual changes seleccionados.
 */
export function useAttackContext(
  attack: CalculatedAttack,
  attackData: CalculatedAttackData | null
): UseAttackContextResult {
  const characterSheet = useCharacterSheet()
  const [selectedChanges, setSelectedChanges] = useState<Set<string>>(new Set())
  const [variables, setVariables] = useState<Record<string, Record<string, number>>>({})

  // Filtra los contextual changes que aplican a este tipo de ataque
  const availableContextualChanges: AttackContextualChange[] = attackData?.attackContextChanges
    ? attackData.attackContextChanges.filter((change: AttackContextualChange) => {
        if (!change.optional || !change.available) return false
        if (change.appliesTo === 'all') return true
        return change.appliesTo === attack.type
      })
    : []

  // Obtiene los contextual changes seleccionados con sus variables resueltas
  const getSelectedContextualChanges = (): ResolvedAttackContextualChange[] => {
    return availableContextualChanges
      .filter((change) => selectedChanges.has(change.name))
      .map((change): ResolvedAttackContextualChange => ({
        ...change,
        variables: change.variables.map((variable): ResolvedContextualVariable => ({
          ...variable,
          value: variables[change.name]?.[variable.identifier] ?? variable.min,
        })),
      }))
  }

  // Calcula el substitution index (para uso en getDamageFormulaText)
  const substitutionIndex: Record<string, number> = (() => {
    if (!characterSheet) return {}

    const resolvedContextualChanges = getSelectedContextualChanges()
    const variablesSubstitutionIndex: Record<string, number> = {}

    for (const change of resolvedContextualChanges) {
      for (const variable of change.variables) {
        variablesSubstitutionIndex[variable.identifier] = variable.value
      }
    }

    return {
      ...characterSheet.substitutionValues,
      ...variablesSubstitutionIndex,
    }
  })()

  // Recalcula el ataque cuando cambian los contextual changes o sus variables
  const calculatedAttack: CalculatedAttack = (() => {
    if (!characterSheet || attack.attackOriginType !== 'weapon' || !attack.weaponUniqueId) {
      return attack
    }

    const weapon = findWeaponById(attackData?.weapons, attack.weaponUniqueId)

    if (!weapon) {
      return attack
    }

    const resolvedContextualChanges = getSelectedContextualChanges()

    const resolvedContext = {
      attackType: attack.type,
      weapon,
      wieldType: weapon.defaultWieldType,
      appliedContextualChanges: resolvedContextualChanges,
      appliedChanges: attackData?.attackChanges ?? [],
      character: characterSheet,
    }

    const newAttackBonus = calculateAttackBonus(resolvedContext, substitutionIndex)
    const newDamage = getAttackDamageFormula(resolvedContext, false)
    const newCriticalDamage = getAttackDamageFormula(resolvedContext, true)

    return {
      ...attack,
      attackBonus: newAttackBonus,
      damage: newDamage,
      criticalDamage: newCriticalDamage,
    }
  })()

  const toggleChange = (changeName: string) => {
    setSelectedChanges((prev) => {
      const next = new Set(prev)
      if (next.has(changeName)) {
        next.delete(changeName)
      } else {
        next.add(changeName)
      }
      return next
    })
  }

  const updateVariable = (changeName: string, variableId: string, value: number) => {
    setVariables((prev) => ({
      ...prev,
      [changeName]: {
        ...prev[changeName],
        [variableId]: value,
      },
    }))
  }

  return {
    calculatedAttack,
    availableContextualChanges,
    selectedChanges,
    variables,
    substitutionIndex,
    toggleChange,
    updateVariable,
    getSelectedContextualChanges,
  }
}
