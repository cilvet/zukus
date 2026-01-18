import { useEffect, useRef, useCallback } from 'react'
import { ScrollView } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { useCharacterStore, useCharacterBaseData } from '../../../stores'
import { useNavigateToDetail } from '../../../../navigation'
import { ops } from '@zukus/core'
import type { LevelSlot } from '@zukus/core'
import { LevelSlotRow } from './LevelSlotRow'

const TOTAL_LEVELS = 20

export function LevelEditor() {
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
        // Add missing slots up to 20
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

  // Ensure we always show 20 slots
  const displaySlots: LevelSlot[] = Array.from({ length: TOTAL_LEVELS }, (_, index) => {
    return levelSlots[index] ?? { classId: null, hpRoll: null }
  })

  const navigateToDetail = useNavigateToDetail()

  const handleRowPress = useCallback((levelIndex: number) => {
    navigateToDetail('levelDetail', String(levelIndex))
  }, [navigateToDetail])

  const handleLevelChange = useCallback(
    (newLevel: number) => {
      if (updater) {
        updater.setCurrentCharacterLevel(newLevel)
      }
    },
    [updater]
  )

  if (!baseData) {
    return (
      <YStack padding="$4" alignItems="center">
        <Text color="$placeholderColor">Cargando datos...</Text>
      </YStack>
    )
  }

  return (
    <YStack gap="$2" flex={1}>
      <YStack paddingHorizontal="$4" paddingTop="$4">
        <Text fontSize={16} fontWeight="600" color="$color">
          Niveles
        </Text>
        <Text fontSize={13} color="$placeholderColor" marginTop="$1">
          Toca un nivel para configurarlo
        </Text>
      </YStack>

      <ScrollView style={{ flex: 1 }}>
        <YStack paddingBottom="$4">
          {/* Header */}
          <XStack
            gap="$2"
            paddingHorizontal="$4"
            paddingBottom="$2"
            marginBottom="$2"
            borderBottomWidth={1}
            borderColor="$borderColor"
          >
            <Text width={24} />
            <Text width={80} fontWeight="bold" color="$color">
              Nivel
            </Text>
            <Text flex={1} fontWeight="bold" color="$color">
              Clase
            </Text>
          </XStack>

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
                onLevelActivate={handleLevelChange}
              />
            )
          })}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
