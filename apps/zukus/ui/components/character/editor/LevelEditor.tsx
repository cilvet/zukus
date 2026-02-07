import { useState, useEffect, useRef, useCallback } from 'react'
import { Modal, SafeAreaView, Pressable, StyleSheet } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useCharacterStore, useCharacterBaseData } from '../../../stores'
import { useTheme } from '../../../contexts/ThemeContext'
import { useNavigateToDetail } from '../../../../navigation'
import { ops } from '@zukus/core'
import type { LevelSlot } from '@zukus/core'
import { LevelSlotRow } from './LevelSlotRow'
import { CurrentLevelSelector } from './CurrentLevelSelector'
import { QuickBuildSection, deriveBuildEntries } from './QuickBuildSection'
import type { BuildEntry } from './QuickBuildSection'
import { QuickBuildClassSelector } from './QuickBuildClassSelector'
import {
  getClassLevelAtSlot,
  getAvailableClasses,
  applyQuickBuild,
} from './levelEditorHelpers'

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
  const { themeColors } = useTheme()
  const hasInitialized = useRef(false)

  const currentLevel = baseData?.level?.level ?? 0
  const levelSlots = baseData?.levelSlots ?? []
  const classEntities = baseData?.classEntities

  // Quick build state
  const [buildEntries, setBuildEntries] = useState<BuildEntry[]>(() =>
    deriveBuildEntries(levelSlots, currentLevel)
  )
  const [classPickerRowIndex, setClassPickerRowIndex] = useState<number | null>(null)

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

  const displaySlots: LevelSlot[] = Array.from({ length: TOTAL_LEVELS }, (_, index) => {
    return levelSlots[index] ?? { classId: null, hpRoll: null }
  })

  const navigateToDetail = useNavigateToDetail()

  const handleRowPress = useCallback((levelIndex: number) => {
    navigateToDetail('levelDetail', String(levelIndex))
  }, [navigateToDetail])

  const availableClasses = getAvailableClasses()

  const handleQuickBuild = (entries: { classId: string; levels: number }[]) => {
    if (!baseData || !updater) return
    applyQuickBuild(baseData, updater, entries)
    const totalLevels = entries.reduce((sum, e) => sum + e.levels, 0)
    updater.setCurrentCharacterLevel(Math.min(totalLevels, 20))
  }

  const handleClassSelected = (classId: string) => {
    if (classPickerRowIndex !== null) {
      setBuildEntries(
        buildEntries.map((e, i) => (i === classPickerRowIndex ? { ...e, classId } : e))
      )
    }
    setClassPickerRowIndex(null)
  }

  if (!baseData) {
    return (
      <YStack padding="$4" alignItems="center">
        <Text color="$placeholderColor">Cargando datos...</Text>
      </YStack>
    )
  }

  const pickerEntry = classPickerRowIndex !== null ? buildEntries[classPickerRowIndex] : null

  return (
    <YStack gap={16} flex={1} paddingTop={12}>
      {/* Quick Build */}
      <QuickBuildSection
        availableClasses={availableClasses}
        entries={buildEntries}
        onEntriesChange={setBuildEntries}
        onOpenClassSelector={setClassPickerRowIndex}
        onApply={handleQuickBuild}
      />

      {/* Header row with "Niveles" + compact level selector */}
      <XStack
        paddingHorizontal={16}
        alignItems="center"
        justifyContent="space-between"
      >
        <YStack>
          <Text fontSize={16} fontWeight="600" color="$color">
            Niveles
          </Text>
          <Text fontSize={13} color="$placeholderColor" marginTop={4}>
            Toca un nivel para configurarlo
          </Text>
        </YStack>
        <CurrentLevelSelector
          currentLevel={currentLevel}
          onLevelChange={(level) => {
            if (updater) {
              updater.setCurrentCharacterLevel(level)
            }
          }}
        />
      </XStack>

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
          const classLevel = getClassLevelAtSlot(displaySlots, index)

          return (
            <LevelSlotRow
              key={index}
              levelIndex={index}
              slot={slot}
              classLevel={classLevel}
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

      {/* Mobile: Modal with EntitySelectionView for class picking */}
      <Modal
        visible={classPickerRowIndex !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setClassPickerRowIndex(null)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
          <XStack
            paddingHorizontal={16}
            paddingVertical={12}
            alignItems="center"
            justifyContent="space-between"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
          >
            <Text fontSize={17} fontWeight="600" color="$color">
              Seleccionar clase
            </Text>
            <Pressable onPress={() => setClassPickerRowIndex(null)} hitSlop={8}>
              <FontAwesome name="times" size={20} color={themeColors.placeholderColor} />
            </Pressable>
          </XStack>

          <QuickBuildClassSelector
            availableClasses={availableClasses}
            currentClassId={pickerEntry?.classId ?? null}
            onSelect={handleClassSelected}
          />
        </SafeAreaView>
      </Modal>
    </YStack>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
})
