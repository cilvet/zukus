import { useEffect, useRef, useCallback } from 'react'
import { YStack, XStack, Text } from 'tamagui'
import { useCharacterStore, useCharacterBaseData } from '../../../stores'
import { useNavigateToDetail } from '../../../../navigation'
import { ops } from '@zukus/core'
import type { LevelSlot } from '@zukus/core'
import { LevelSlotRow } from './LevelSlotRow'
import { CurrentLevelSelector } from './CurrentLevelSelector'

const TOTAL_LEVELS = 20

type LevelEditorProps = {
  onRequestLevelChange: (level: number) => void
}

export function LevelEditor({
  onRequestLevelChange,
}: LevelEditorProps) {
  "use no memo"

  const baseData = useCharacterBaseData()
  const { updater } = useCharacterStore()
  const hasInitialized = useRef(false)

  // Ensure 20 level slots exist on mount
  useEffect(() => {
    if (!hasInitialized.current && baseData && updater) {
      hasInitialized.current = true
      const currentSlots = baseData.levelSlots?.length ?? 0

      if (currentSlots < TOTAL_LEVELS) {
        let updatedData = { ...baseData }

        while ((updatedData.levelSlots?.length ?? 0) < TOTAL_LEVELS) {
          const result = ops.addLevelSlot(updatedData as any)
          updatedData = result.character
        }

        const newSlots = updatedData.levelSlots?.length ?? 0
        if (currentSlots !== newSlots) {
          updater.updateCharacterBaseData(updatedData)
        }
      }
    }
  }, [baseData, updater])

  const currentLevel = baseData?.level?.level ?? 0
  const levelSlots = baseData?.levelSlots ?? []
  const classEntities = baseData?.classEntities

  const displaySlots: LevelSlot[] = Array.from({ length: TOTAL_LEVELS }, (_, index) => {
    return levelSlots[index] ?? { classId: null, hpRoll: null }
  })

  const navigateToDetail = useNavigateToDetail()

  const handleRowPress = useCallback((levelIndex: number) => {
    navigateToDetail('levelDetail', String(levelIndex))
  }, [navigateToDetail])

  if (!baseData) {
    return (
      <YStack padding="$4" alignItems="center">
        <Text color="$placeholderColor">Cargando datos...</Text>
      </YStack>
    )
  }

  return (
    <YStack gap={16} flex={1}>
      {/* Level Selector */}
      <YStack paddingHorizontal={16}>
        <CurrentLevelSelector
          currentLevel={currentLevel}
          onLevelChange={(level) => {
            if (updater) {
              updater.setCurrentCharacterLevel(level)
            }
          }}
        />
      </YStack>

      {/* Header */}
      <YStack paddingHorizontal={16}>
        <Text fontSize={16} fontWeight="600" color="$color">
          Niveles
        </Text>
        <Text fontSize={13} color="$placeholderColor" marginTop={4}>
          Toca un nivel para configurarlo
        </Text>
      </YStack>

      {/* Level List Header */}
      <XStack
        gap={8}
        paddingHorizontal={16}
        paddingBottom={8}
        borderBottomWidth={1}
        borderColor="$borderColor"
      >
        <Text width={24} />
        <Text width={70} fontWeight="bold" fontSize={13} color="$placeholderColor">
          Nivel
        </Text>
        <Text flex={1} fontWeight="bold" fontSize={13} color="$placeholderColor">
          Clase
        </Text>
      </XStack>

      {/* Level Rows */}
      <YStack paddingBottom={16}>
        {displaySlots.map((slot, index) => {
          const isActive = index < currentLevel
          const isNextActive = index + 1 < currentLevel
          const isFirstLevel = index === 0
          const isLastLevel = index === displaySlots.length - 1

          return (
            <LevelSlotRow
              key={index}
              levelIndex={index}
              slot={slot}
              isActive={isActive}
              isNextActive={isNextActive}
              isFirstLevel={isFirstLevel}
              isLastLevel={isLastLevel}
              classEntities={classEntities}
              onRowPress={handleRowPress}
              onLevelActivate={onRequestLevelChange}
            />
          )
        })}
      </YStack>
    </YStack>
  )
}
