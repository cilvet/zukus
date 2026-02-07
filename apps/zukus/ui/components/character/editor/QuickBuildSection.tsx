'use no memo'

import { TextInput, StyleSheet, Pressable } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useTheme } from '../../../contexts/ThemeContext'
import type { ClassOption } from './levelEditorHelpers'
import type { LevelSlot } from '@zukus/core'

export type BuildEntry = {
  classId: string | null
  levels: string
}

/**
 * Derives build entries from the character's current level slots.
 * Groups consecutive slots with the same classId into entries.
 * e.g. [Fighter, Fighter, Fighter, Druid, Druid] → [{Fighter, 3}, {Druid, 2}]
 */
export function deriveBuildEntries(
  levelSlots: LevelSlot[],
  currentLevel: number
): BuildEntry[] {
  const activeSlots = levelSlots.slice(0, currentLevel)
  if (activeSlots.length === 0) return [{ classId: null, levels: '1' }]

  const entries: BuildEntry[] = []
  let currentClassId: string | null = null
  let count = 0

  for (const slot of activeSlots) {
    if (slot.classId !== currentClassId) {
      if (currentClassId !== null && count > 0) {
        entries.push({ classId: currentClassId, levels: String(count) })
      }
      currentClassId = slot.classId
      count = 1
    } else {
      count++
    }
  }
  if (currentClassId !== null && count > 0) {
    entries.push({ classId: currentClassId, levels: String(count) })
  }

  return entries.length > 0 ? entries : [{ classId: null, levels: '1' }]
}

type QuickBuildSectionProps = {
  availableClasses: ClassOption[]
  entries: BuildEntry[]
  onEntriesChange: (entries: BuildEntry[]) => void
  onOpenClassSelector: (rowIndex: number) => void
  onApply: (entries: { classId: string; levels: number }[]) => void
}

export function QuickBuildSection({
  availableClasses,
  entries,
  onEntriesChange,
  onOpenClassSelector,
  onApply,
}: QuickBuildSectionProps) {
  const { themeColors } = useTheme()

  const totalLevels = entries.reduce((sum, e) => {
    const n = parseInt(e.levels, 10)
    return sum + (isNaN(n) ? 0 : n)
  }, 0)

  const handleApply = () => {
    const validEntries = entries
      .filter((e) => e.classId !== null)
      .map((e) => {
        const n = parseInt(e.levels, 10)
        return { classId: e.classId!, levels: isNaN(n) || n < 1 ? 1 : Math.min(n, 20) }
      })
    if (validEntries.length === 0) return
    if (totalLevels > 20) return
    onApply(validEntries)
  }

  const handleAddRow = () => {
    onEntriesChange([...entries, { classId: null, levels: '1' }])
  }

  const handleRemoveRow = (index: number) => {
    if (entries.length <= 1) return
    onEntriesChange(entries.filter((_, i) => i !== index))
  }

  const updateEntry = (index: number, patch: Partial<BuildEntry>) => {
    onEntriesChange(entries.map((e, i) => (i === index ? { ...e, ...patch } : e)))
  }

  const handleLevelBlur = (index: number) => {
    const num = parseInt(entries[index].levels, 10)
    if (isNaN(num) || num < 1) {
      updateEntry(index, { levels: '1' })
    } else if (num > 20) {
      updateEntry(index, { levels: '20' })
    }
  }

  const hasValidEntries = entries.some((e) => e.classId !== null)

  return (
    <YStack paddingHorizontal={16} gap={8}>
      <Text fontSize={13} fontWeight="600" color="$placeholderColor">
        Build rápida
      </Text>

      {/* Build rows */}
      {entries.map((entry, index) => {
        const selectedClass = availableClasses.find((c) => c.id === entry.classId)

        return (
          <XStack key={index} alignItems="center" gap={8}>
            {/* Class selector button */}
            <Pressable
              onPress={() => onOpenClassSelector(index)}
              style={({ pressed }) => [
                styles.classButton,
                {
                  borderColor: themeColors.borderColor,
                  backgroundColor: pressed ? themeColors.uiBackgroundColor : 'transparent',
                },
              ]}
            >
              <Text
                fontSize={14}
                color={selectedClass ? '$color' : '$placeholderColor'}
                numberOfLines={1}
              >
                {selectedClass?.name ?? 'Clase...'}
              </Text>
            </Pressable>

            {/* Level input */}
            <TextInput
              value={entry.levels}
              onChangeText={(v) => updateEntry(index, { levels: v })}
              onBlur={() => handleLevelBlur(index)}
              keyboardType="number-pad"
              selectTextOnFocus
              style={[
                styles.levelInput,
                {
                  color: themeColors.color,
                  borderColor: themeColors.borderColor,
                },
              ]}
            />

            {/* Remove row button */}
            {entries.length > 1 && (
              <Pressable
                onPress={() => handleRemoveRow(index)}
                hitSlop={8}
                style={styles.removeButton}
              >
                <FontAwesome name="minus-circle" size={18} color="#ef4444" />
              </Pressable>
            )}
          </XStack>
        )
      })}

      {/* Bottom row: add + total + apply */}
      <XStack alignItems="center" gap={8}>
        <Pressable onPress={handleAddRow} hitSlop={8} style={styles.addButton}>
          <FontAwesome name="plus" size={12} color="#3b82f6" />
          <Text fontSize={13} color="#3b82f6" fontWeight="500">
            Clase
          </Text>
        </Pressable>

        <XStack flex={1} />

        <Text
          fontSize={12}
          color={totalLevels > 20 ? '$red10' : '$placeholderColor'}
        >
          Total: {totalLevels}/20
        </Text>

        <Pressable
          onPress={handleApply}
          disabled={!hasValidEntries || totalLevels > 20}
          style={({ pressed }) => [
            styles.applyButton,
            {
              opacity: hasValidEntries && totalLevels <= 20 ? (pressed ? 0.7 : 1) : 0.4,
            },
          ]}
        >
          <Text fontSize={13} fontWeight="600" color="white">
            Aplicar
          </Text>
        </Pressable>
      </XStack>
    </YStack>
  )
}

const styles = StyleSheet.create({
  classButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  levelInput: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    width: 44,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 6,
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  applyButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
})
