import { useState, useMemo, useCallback, useEffect } from 'react'
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
 * Obtiene el arma del personaje por su uniqueId.
 */
function getWeaponFromCharacter(
  items: { uniqueId: string; itemType: string }[],
  weaponUniqueId: string
): Weapon | null {
  const item = items.find(
    (i) => i.uniqueId === weaponUniqueId && i.itemType === 'WEAPON'
  )
  return item as Weapon | null
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
  const availableContextualChanges = useMemo((): AttackContextualChange[] => {
    if (!attackData?.attackContextChanges) return []

    return attackData.attackContextChanges.filter((change: AttackContextualChange) => {
      // Solo mostrar cambios opcionales y disponibles
      if (!change.optional || !change.available) return false

      // Filtrar por tipo de ataque
      if (change.appliesTo === 'all') return true
      return change.appliesTo === attack.type
    })
  }, [attackData?.attackContextChanges, attack.type])

  // Obtiene los contextual changes seleccionados con sus variables resueltas
  const getSelectedContextualChanges = useCallback((): ResolvedAttackContextualChange[] => {
    return availableContextualChanges
      .filter((change) => selectedChanges.has(change.name))
      .map((change): ResolvedAttackContextualChange => ({
        ...change,
        variables: change.variables.map((variable): ResolvedContextualVariable => ({
          ...variable,
          value: variables[change.name]?.[variable.identifier] ?? variable.min,
        })),
      }))
  }, [availableContextualChanges, selectedChanges, variables])

  // Calcula el substitution index (para uso en getDamageFormulaText)
  const substitutionIndex = useMemo((): Record<string, number> => {
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
  }, [characterSheet, getSelectedContextualChanges])

  // Recalcula el ataque cuando cambian los contextual changes o sus variables
  const calculatedAttack = useMemo((): CalculatedAttack => {
    // Si no hay character sheet o el ataque no es de arma, devolver el original
    if (!characterSheet || attack.attackOriginType !== 'weapon' || !attack.weaponUniqueId) {
      return attack
    }

    // Obtener el arma del personaje
    const weapon = getWeaponFromCharacter(
      characterSheet.equipment.items,
      attack.weaponUniqueId
    )

    if (!weapon) {
      return attack
    }

    // Construir el contexto resuelto
    const resolvedContextualChanges = getSelectedContextualChanges()

    const resolvedContext = {
      attackType: attack.type,
      weapon,
      wieldType: weapon.defaultWieldType,
      appliedContextualChanges: resolvedContextualChanges,
      appliedChanges: attackData?.attackChanges ?? [],
      character: characterSheet,
    }

    // Recalcular bonus de ataque y daño
    const newAttackBonus = calculateAttackBonus(resolvedContext, substitutionIndex)
    const newDamage = getAttackDamageFormula(resolvedContext, false)
    const newCriticalDamage = getAttackDamageFormula(resolvedContext, true)

    return {
      ...attack,
      attackBonus: newAttackBonus,
      damage: newDamage,
      criticalDamage: newCriticalDamage,
    }
  }, [attack, attackData?.attackChanges, characterSheet, getSelectedContextualChanges, substitutionIndex])

  const toggleChange = useCallback((changeName: string) => {
    setSelectedChanges((prev) => {
      const next = new Set(prev)
      if (next.has(changeName)) {
        next.delete(changeName)
      } else {
        next.add(changeName)
      }
      return next
    })
  }, [])

  const updateVariable = useCallback(
    (changeName: string, variableId: string, value: number) => {
      setVariables((prev) => ({
        ...prev,
        [changeName]: {
          ...prev[changeName],
          [variableId]: value,
        },
      }))
    },
    []
  )

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
