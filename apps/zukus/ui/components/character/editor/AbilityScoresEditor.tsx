import { useCallback } from 'react'
import { YStack, XStack, Text, Input as TamaguiInput } from 'tamagui'
import { useCharacterStore, useCharacterBaseData } from '../../../stores'

type BaseAbilityData = {
  baseScore: number
  drain?: number
  damage?: number
  penalty?: number
}

type BaseAbilitiesData = {
  dexterity: BaseAbilityData
  strength: BaseAbilityData
  constitution: BaseAbilityData
  intelligence: BaseAbilityData
  wisdom: BaseAbilityData
  charisma: BaseAbilityData
  [key: string]: BaseAbilityData
}

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

function calculateAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

function formatModifier(modifier: number): string {
  if (modifier >= 0) {
    return `+${modifier}`
  }
  return modifier.toString()
}

type AbilityScoreRowProps = {
  abilityKey: AbilityKey
  abilityData: BaseAbilityData
  onScoreChange: (abilityKey: AbilityKey, score: number) => void
}

function AbilityScoreRow({ abilityKey, abilityData, onScoreChange }: AbilityScoreRowProps) {
  const modifier = calculateAbilityModifier(abilityData.baseScore)
  const label = ABILITY_LABELS[abilityKey] || abilityKey

  const handleChangeText = (text: string) => {
    const value = text.trim()
    if (value === '') {
      onScoreChange(abilityKey, 0)
      return
    }
    const score = parseInt(value, 10)
    if (!isNaN(score) && score >= 0 && score <= 99) {
      onScoreChange(abilityKey, score)
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
      <Text flex={1} fontSize="$4" fontWeight="500" color="$color">
        {label}
      </Text>

      <XStack alignItems="center" gap="$2">
        <TamaguiInput
          value={abilityData.baseScore === 0 ? '' : abilityData.baseScore.toString()}
          onChangeText={handleChangeText}
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

        <Text
          fontSize="$5"
          fontWeight="bold"
          color={modifier >= 0 ? '$green10' : '$red10'}
          width={40}
          textAlign="center"
        >
          {formatModifier(modifier)}
        </Text>
      </XStack>
    </XStack>
  )
}

export function AbilityScoresEditor() {
  const baseData = useCharacterBaseData()
  const updater = useCharacterStore((state) => state.updater)

  const handleScoreChange = useCallback(
    (abilityKey: AbilityKey, score: number) => {
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
    },
    [baseData, updater]
  )

  if (!baseData) {
    return (
      <YStack padding="$4">
        <Text color="$placeholderColor">No hay personaje cargado</Text>
      </YStack>
    )
  }

  return (
    <YStack gap="$4" width="100%" maxWidth={400} paddingHorizontal="$4">
      <YStack gap="$2">
        <Text fontSize="$6" fontWeight="bold" color="$color">
          Puntuaciones de Habilidad
        </Text>
        <Text fontSize="$3" color="$placeholderColor">
          Configura las puntuaciones base de tu personaje
        </Text>
      </YStack>

      <YStack
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius="$2"
        backgroundColor="$background"
        overflow="hidden"
      >
        <XStack
          gap="$3"
          paddingVertical="$2"
          paddingHorizontal="$3"
          borderBottomWidth={1}
          borderColor="$borderColor"
        >
          <Text flex={1} fontWeight="bold" fontSize="$3" color="$placeholderColor">
            Habilidad
          </Text>
          <XStack alignItems="center" gap="$2">
            <Text fontWeight="bold" fontSize="$3" width={60} textAlign="center" color="$placeholderColor">
              Base
            </Text>
            <Text fontWeight="bold" fontSize="$3" width={40} textAlign="center" color="$placeholderColor">
              Mod
            </Text>
          </XStack>
        </XStack>

        {ABILITY_ORDER.map((abilityKey) => (
          <AbilityScoreRow
            key={abilityKey}
            abilityKey={abilityKey}
            abilityData={baseData.baseAbilityData[abilityKey]}
            onScoreChange={handleScoreChange}
          />
        ))}
      </YStack>
    </YStack>
  )
}
