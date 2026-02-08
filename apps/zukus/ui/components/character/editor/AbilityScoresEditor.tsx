'use no memo'

import { useState, useEffect } from 'react'
import { Pressable } from 'react-native'
import { YStack, XStack, Text, Input as TamaguiInput } from 'tamagui'
import { useCharacterStore, useCharacterBaseData } from '../../../stores'
import { Button } from '../../../atoms'
import type {
  BaseAbilitiesData,
  BaseAbilityData,
  AbilityScoreMethod,
  Roll4d6Result,
} from '@zukus/core'
import {
  STANDARD_ARRAY,
  generateAbilityScoreSet,
  POINT_BUY_PRESETS,
  DEFAULT_POINT_BUY_BUDGET,
  POINT_BUY_MIN,
  calculatePointBuyTotal,
  canIncrementPointBuy,
  canDecrementPointBuy,
} from '@zukus/core'

// ---------- Constants ----------

type AbilityKey = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'

const ABILITY_LABELS: Record<AbilityKey, string> = {
  strength: 'Fuerza',
  dexterity: 'Destreza',
  constitution: 'Constitucion',
  intelligence: 'Inteligencia',
  wisdom: 'Sabiduria',
  charisma: 'Carisma',
}

const ABILITY_ORDER: AbilityKey[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
]

const METHOD_LABELS: Record<AbilityScoreMethod, string> = {
  manual: 'Manual',
  roll4d6: '4d6',
  pointBuy: 'Compra',
  standardArray: 'Array',
}

// ---------- Helpers ----------

function calculateAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : modifier.toString()
}

// ---------- Sub-components ----------

function MethodChip({
  label,
  isActive,
  onPress,
}: {
  label: string
  isActive: boolean
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <XStack
          paddingHorizontal={14}
          paddingVertical={7}
          borderRadius={20}
          borderWidth={1.5}
          backgroundColor={isActive ? '$accent' : 'transparent'}
          borderColor={isActive ? '$accent' : '$borderColor'}
          opacity={pressed ? 0.7 : 1}
        >
          <Text
            fontSize={13}
            fontWeight="600"
            color={isActive ? '$accentContrastText' : '$color'}
          >
            {label}
          </Text>
        </XStack>
      )}
    </Pressable>
  )
}

function ModifierDisplay({ score }: { score: number }) {
  const modifier = calculateAbilityModifier(score)
  return (
    <Text
      fontSize="$5"
      fontWeight="bold"
      color={modifier >= 0 ? '$green10' : '$red10'}
      width={40}
      textAlign="center"
    >
      {formatModifier(modifier)}
    </Text>
  )
}

function AbilityLabel({ abilityKey }: { abilityKey: AbilityKey }) {
  return (
    <Text flex={1} fontSize="$4" fontWeight="500" color="$color">
      {ABILITY_LABELS[abilityKey]}
    </Text>
  )
}

function RolledValueChip({
  value,
  isSelected,
  isAssigned,
  onPress,
}: {
  value: number
  isSelected: boolean
  isAssigned: boolean
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} disabled={isAssigned && !isSelected}>
      {({ pressed }) => (
        <XStack
          width={44}
          height={44}
          borderRadius={22}
          borderWidth={2}
          borderColor={isSelected ? '$accent' : '$borderColor'}
          backgroundColor={isSelected ? '$accent' : 'transparent'}
          alignItems="center"
          justifyContent="center"
          opacity={isAssigned && !isSelected ? 0.4 : pressed ? 0.7 : 1}
        >
          <Text
            fontSize="$5"
            fontWeight="bold"
            color={isSelected ? '$accentContrastText' : '$color'}
          >
            {value}
          </Text>
        </XStack>
      )}
    </Pressable>
  )
}

function AssignableAbilityRow({
  abilityKey,
  assignedValue,
  onPress,
}: {
  abilityKey: AbilityKey
  assignedValue: number | null
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <XStack
          gap="$3"
          alignItems="center"
          paddingVertical="$2"
          paddingHorizontal="$3"
          borderRadius="$2"
          backgroundColor={pressed ? '$backgroundHover' : 'transparent'}
          hoverStyle={{ backgroundColor: '$backgroundHover' }}
        >
          <AbilityLabel abilityKey={abilityKey} />
          <XStack alignItems="center" gap="$2">
            <XStack
              width={60}
              height={40}
              borderRadius="$2"
              borderWidth={1}
              borderColor={assignedValue != null ? '$accent' : '$borderColor'}
              borderStyle={assignedValue != null ? 'solid' : 'dashed'}
              alignItems="center"
              justifyContent="center"
              backgroundColor="$background"
            >
              <Text
                fontSize="$4"
                fontWeight="bold"
                color={assignedValue != null ? '$color' : '$placeholderColor'}
              >
                {assignedValue != null ? assignedValue : '—'}
              </Text>
            </XStack>
            {assignedValue != null ? (
              <ModifierDisplay score={assignedValue} />
            ) : (
              <Text width={40} textAlign="center" color="$placeholderColor">
                —
              </Text>
            )}
          </XStack>
        </XStack>
      )}
    </Pressable>
  )
}

// ---------- Manual Mode ----------

function ManualAbilityScoreRow({
  abilityKey,
  abilityData,
  onScoreChange,
}: {
  abilityKey: AbilityKey
  abilityData: BaseAbilityData
  onScoreChange: (abilityKey: AbilityKey, score: number) => void
}) {
  const [inputValue, setInputValue] = useState(
    abilityData.baseScore === 0 ? '' : abilityData.baseScore.toString()
  )

  useEffect(() => {
    setInputValue(abilityData.baseScore === 0 ? '' : abilityData.baseScore.toString())
  }, [abilityData.baseScore])

  const handleBlur = () => {
    const value = inputValue.trim()
    if (value === '') {
      onScoreChange(abilityKey, 0)
      return
    }
    const score = parseInt(value, 10)
    if (!isNaN(score) && score >= 0 && score <= 99) {
      onScoreChange(abilityKey, score)
    } else {
      setInputValue(abilityData.baseScore === 0 ? '' : abilityData.baseScore.toString())
    }
  }

  return (
    <XStack
      gap="$3"
      alignItems="center"
      paddingVertical="$2"
      paddingHorizontal="$3"
      borderRadius="$2"
      hoverStyle={{ backgroundColor: '$backgroundHover' }}
    >
      <AbilityLabel abilityKey={abilityKey} />
      <XStack alignItems="center" gap="$2">
        <TamaguiInput
          value={inputValue}
          onChangeText={setInputValue}
          onBlur={handleBlur}
          selectTextOnFocus
          keyboardType="numeric"
          textAlign="center"
          width={60}
          height={40}
          fontSize="$4"
          placeholder="0"
          borderColor="$borderColor"
          backgroundColor="$background"
          color="$color"
        />
        <ModifierDisplay score={abilityData.baseScore} />
      </XStack>
    </XStack>
  )
}

function ManualMode({
  abilities,
  onScoreChange,
}: {
  abilities: BaseAbilitiesData
  onScoreChange: (key: AbilityKey, score: number) => void
}) {
  return (
    <YStack>
      {ABILITY_ORDER.map((key) => (
        <ManualAbilityScoreRow
          key={key}
          abilityKey={key}
          abilityData={abilities[key]}
          onScoreChange={onScoreChange}
        />
      ))}
    </YStack>
  )
}

// ---------- Assignment Mode (shared between Roll4d6 and Standard Array) ----------

type Assignments = Record<AbilityKey, number | null>

function emptyAssignments(): Assignments {
  return {
    strength: null,
    dexterity: null,
    constitution: null,
    intelligence: null,
    wisdom: null,
    charisma: null,
  }
}

function AssignmentMode({
  values,
  onApply,
  headerContent,
}: {
  values: number[]
  onApply: (assignments: Record<AbilityKey, number>) => void
  headerContent?: React.ReactNode
}) {
  const [assignments, setAssignments] = useState<Assignments>(emptyAssignments)
  const [selectedChipIndex, setSelectedChipIndex] = useState<number | null>(null)

  // Track which values (by index) have been assigned
  const assignedIndices = new Set<number>()
  for (const key of ABILITY_ORDER) {
    const val = assignments[key]
    if (val != null) {
      // Find the first index with this value that hasn't been assigned yet
      for (let i = 0; i < values.length; i++) {
        if (values[i] === val && !assignedIndices.has(i)) {
          assignedIndices.add(i)
          break
        }
      }
    }
  }

  const allAssigned = ABILITY_ORDER.every((key) => assignments[key] != null)

  const handleChipPress = (index: number) => {
    if (assignedIndices.has(index) && index !== selectedChipIndex) return
    setSelectedChipIndex(selectedChipIndex === index ? null : index)
  }

  const handleRowPress = (abilityKey: AbilityKey) => {
    if (assignments[abilityKey] != null) {
      // Unassign
      setAssignments({ ...assignments, [abilityKey]: null })
      return
    }
    if (selectedChipIndex == null) return
    setAssignments({ ...assignments, [abilityKey]: values[selectedChipIndex] })
    setSelectedChipIndex(null)
  }

  const handleApply = () => {
    if (!allAssigned) return
    onApply(assignments as Record<AbilityKey, number>)
  }

  return (
    <YStack gap="$3">
      {headerContent}
      <XStack gap="$2" flexWrap="wrap" justifyContent="center">
        {values.map((value, index) => (
          <RolledValueChip
            key={index}
            value={value}
            isSelected={selectedChipIndex === index}
            isAssigned={assignedIndices.has(index)}
            onPress={() => handleChipPress(index)}
          />
        ))}
      </XStack>

      <YStack>
        {ABILITY_ORDER.map((key) => (
          <AssignableAbilityRow
            key={key}
            abilityKey={key}
            assignedValue={assignments[key]}
            onPress={() => handleRowPress(key)}
          />
        ))}
      </YStack>

      <XStack justifyContent="center" gap="$2" paddingTop="$1">
        <Button
          variant="primary"
          size="medium"
          disabled={!allAssigned}
          onPress={handleApply}
        >
          Aplicar puntuaciones
        </Button>
      </XStack>
    </YStack>
  )
}

// ---------- Roll 4d6 Mode ----------

function Roll4d6Mode({
  onApply,
}: {
  onApply: (assignments: Record<AbilityKey, number>) => void
}) {
  const [results, setResults] = useState<Roll4d6Result[] | null>(null)

  const handleRoll = () => {
    setResults(generateAbilityScoreSet())
  }

  if (!results) {
    return (
      <YStack alignItems="center" paddingVertical="$4" gap="$3">
        <Text fontSize="$3" color="$placeholderColor" textAlign="center">
          Tira 4d6 y descarta el menor para cada puntuacion
        </Text>
        <Button variant="primary" size="medium" onPress={handleRoll}>
          Tirar dados
        </Button>
      </YStack>
    )
  }

  const values = results.map((r) => r.total)

  return (
    <AssignmentMode
      values={values}
      onApply={onApply}
      headerContent={
        <XStack justifyContent="center">
          <Button variant="secondary" size="small" onPress={handleRoll}>
            Volver a tirar
          </Button>
        </XStack>
      }
    />
  )
}

// ---------- Standard Array Mode ----------

function StandardArrayMode({
  onApply,
}: {
  onApply: (assignments: Record<AbilityKey, number>) => void
}) {
  return (
    <AssignmentMode
      values={[...STANDARD_ARRAY]}
      onApply={onApply}
      headerContent={
        <Text fontSize="$3" color="$placeholderColor" textAlign="center">
          Asigna los valores de la serie estandar a cada habilidad
        </Text>
      }
    />
  )
}

// ---------- Point Buy Mode ----------

function PointBuyAbilityRow({
  abilityKey,
  score,
  canIncrement,
  canDecrement,
  onIncrement,
  onDecrement,
}: {
  abilityKey: AbilityKey
  score: number
  canIncrement: boolean
  canDecrement: boolean
  onIncrement: () => void
  onDecrement: () => void
}) {
  return (
    <XStack
      gap="$2"
      alignItems="center"
      paddingVertical="$1.5"
      paddingHorizontal="$3"
      borderRadius="$2"
      hoverStyle={{ backgroundColor: '$backgroundHover' }}
    >
      <AbilityLabel abilityKey={abilityKey} />
      <XStack alignItems="center" gap="$2">
        <Pressable onPress={onDecrement} disabled={!canDecrement}>
          {({ pressed }) => (
            <XStack
              width={28}
              height={28}
              borderRadius={14}
              borderWidth={1.5}
              borderColor={canDecrement ? '$color' : '$borderColor'}
              alignItems="center"
              justifyContent="center"
              opacity={!canDecrement ? 0.3 : pressed ? 0.6 : 1}
            >
              <Text
                fontSize={16}
                fontWeight="bold"
                color={canDecrement ? '$color' : '$placeholderColor'}
                marginTop={-1}
              >
                -
              </Text>
            </XStack>
          )}
        </Pressable>

        <Text
          fontSize="$5"
          fontWeight="bold"
          color="$color"
          width={32}
          textAlign="center"
        >
          {score}
        </Text>

        <Pressable onPress={onIncrement} disabled={!canIncrement}>
          {({ pressed }) => (
            <XStack
              width={28}
              height={28}
              borderRadius={14}
              borderWidth={1.5}
              borderColor={canIncrement ? '$color' : '$borderColor'}
              alignItems="center"
              justifyContent="center"
              opacity={!canIncrement ? 0.3 : pressed ? 0.6 : 1}
            >
              <Text
                fontSize={16}
                fontWeight="bold"
                color={canIncrement ? '$color' : '$placeholderColor'}
                marginTop={-1}
              >
                +
              </Text>
            </XStack>
          )}
        </Pressable>

        <ModifierDisplay score={score} />
      </XStack>
    </XStack>
  )
}

function PointBuyMode({
  abilities,
  onScoreChange,
}: {
  abilities: BaseAbilitiesData
  onScoreChange: (key: AbilityKey, score: number) => void
}) {
  const [budget, setBudget] = useState(DEFAULT_POINT_BUY_BUDGET)

  const scores = ABILITY_ORDER.map((key) => abilities[key].baseScore || POINT_BUY_MIN)
  const totalSpent = calculatePointBuyTotal(scores)
  const remaining = budget - totalSpent
  const overBudget = remaining < 0

  const handleIncrement = (key: AbilityKey) => {
    const current = abilities[key].baseScore || POINT_BUY_MIN
    if (canIncrementPointBuy(current, totalSpent, budget)) {
      onScoreChange(key, current + 1)
    }
  }

  const handleDecrement = (key: AbilityKey) => {
    const current = abilities[key].baseScore || POINT_BUY_MIN
    if (canDecrementPointBuy(current)) {
      onScoreChange(key, current - 1)
    }
  }

  const handleReset = () => {
    for (const key of ABILITY_ORDER) {
      onScoreChange(key, POINT_BUY_MIN)
    }
  }

  return (
    <YStack gap="$3">
      {/* Budget selector */}
      <YStack gap="$2">
        <Text fontSize="$3" color="$placeholderColor" textAlign="center">
          Presupuesto
        </Text>
        <XStack gap="$2" flexWrap="wrap" justifyContent="center">
          {POINT_BUY_PRESETS.map((preset) => (
            <MethodChip
              key={preset}
              label={String(preset)}
              isActive={budget === preset}
              onPress={() => setBudget(preset)}
            />
          ))}
        </XStack>
      </YStack>

      {/* Points display */}
      <XStack justifyContent="center" gap="$2" alignItems="baseline">
        <Text
          fontSize="$6"
          fontWeight="bold"
          color={overBudget ? '$red10' : '$green10'}
        >
          {totalSpent}
        </Text>
        <Text fontSize="$4" color="$placeholderColor">
          / {budget} puntos
        </Text>
      </XStack>

      {/* Ability rows */}
      <YStack>
        {ABILITY_ORDER.map((key, index) => (
          <PointBuyAbilityRow
            key={key}
            abilityKey={key}
            score={scores[index]}
            canIncrement={canIncrementPointBuy(scores[index], totalSpent, budget)}
            canDecrement={canDecrementPointBuy(scores[index])}
            onIncrement={() => handleIncrement(key)}
            onDecrement={() => handleDecrement(key)}
          />
        ))}
      </YStack>

      {/* Reset button */}
      <XStack justifyContent="center">
        <Button variant="secondary" size="small" onPress={handleReset}>
          Reiniciar
        </Button>
      </XStack>
    </YStack>
  )
}

// ---------- Main Component ----------

export function AbilityScoresEditor() {
  const baseData = useCharacterBaseData()
  const updater = useCharacterStore((state) => state.updater)
  const [method, setMethod] = useState<AbilityScoreMethod>('manual')

  const handleScoreChange = (abilityKey: AbilityKey, score: number) => {
    if (!baseData || !updater) return
    const updatedAbilityData: BaseAbilitiesData = {
      ...baseData.baseAbilityData,
      [abilityKey]: {
        ...baseData.baseAbilityData[abilityKey],
        baseScore: score,
      },
    }
    updater.updateCharacterBaseData({
      ...baseData,
      baseAbilityData: updatedAbilityData,
    })
  }

  const handleApplyAssignments = (assignments: Record<AbilityKey, number>) => {
    if (!baseData || !updater) return
    const updatedAbilityData = { ...baseData.baseAbilityData }
    for (const key of ABILITY_ORDER) {
      updatedAbilityData[key] = {
        ...updatedAbilityData[key],
        baseScore: assignments[key],
      }
    }
    updater.updateCharacterBaseData({
      ...baseData,
      baseAbilityData: updatedAbilityData,
    })
    setMethod('manual')
  }

  if (!baseData) {
    return (
      <YStack padding="$4">
        <Text color="$placeholderColor">No hay personaje cargado</Text>
      </YStack>
    )
  }

  return (
    <YStack gap="$4" width="100%">
      <YStack gap="$2" paddingTop="$2">
        <Text fontSize="$6" fontWeight="bold" color="$color">
          Puntuaciones de Habilidad
        </Text>
        <Text fontSize="$3" color="$placeholderColor">
          Configura las puntuaciones base de tu personaje
        </Text>
      </YStack>

      {/* Method selector */}
      <XStack gap="$2" flexWrap="wrap">
        {(['manual', 'roll4d6', 'pointBuy', 'standardArray'] as const).map((m) => (
          <MethodChip
            key={m}
            label={METHOD_LABELS[m]}
            isActive={method === m}
            onPress={() => setMethod(m)}
          />
        ))}
      </XStack>

      {/* Mode content */}
      {method === 'manual' && (
        <ManualMode abilities={baseData.baseAbilityData} onScoreChange={handleScoreChange} />
      )}
      {method === 'roll4d6' && (
        <Roll4d6Mode onApply={handleApplyAssignments} />
      )}
      {method === 'pointBuy' && (
        <PointBuyMode
          abilities={baseData.baseAbilityData}
          onScoreChange={handleScoreChange}
        />
      )}
      {method === 'standardArray' && (
        <StandardArrayMode onApply={handleApplyAssignments} />
      )}
    </YStack>
  )
}
