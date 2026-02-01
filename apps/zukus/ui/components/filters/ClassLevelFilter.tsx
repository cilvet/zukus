import { Pressable, ScrollView, StyleSheet } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import { useTheme } from '../../contexts/ThemeContext'

// ============================================================================
// Types
// ============================================================================

export type ClassLevelFilterProps = {
  /** Available classes to show */
  availableClasses: ClassOption[]
  /** Currently selected class ID (null = any) */
  selectedClassId: string | null
  /** Currently selected level (null = any level) */
  selectedLevel: number | null
  /** Callback when class changes */
  onClassChange: (classId: string | null) => void
  /** Callback when level changes */
  onLevelChange: (level: number | null) => void
  /** Available levels for the selected class (default: 0-9) */
  availableLevels?: number[]
}

export type ClassOption = {
  id: string
  label: string
}

// ============================================================================
// Default classes to show (most common D&D 3.5 spellcasters)
// ============================================================================

export const DEFAULT_SPELLCASTING_CLASSES: ClassOption[] = [
  { id: 'wizard', label: 'Mago' },
  { id: 'sorcerer', label: 'Hechicero' },
  { id: 'cleric', label: 'Clerigo' },
  { id: 'druid', label: 'Druida' },
  { id: 'bard', label: 'Bardo' },
  { id: 'paladin', label: 'Paladin' },
  { id: 'ranger', label: 'Explorador' },
]

const DEFAULT_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

// ============================================================================
// Component
// ============================================================================

/**
 * ClassLevelFilter - Compact filter for selecting class and spell level.
 *
 * Features:
 * - Horizontally scrollable class chips
 * - Level chips (0-9) that appear after selecting a class
 * - "Any" option for both class and level
 * - Visually connected in a single container
 */
export function ClassLevelFilter({
  availableClasses,
  selectedClassId,
  selectedLevel,
  onClassChange,
  onLevelChange,
  availableLevels = DEFAULT_LEVELS,
}: ClassLevelFilterProps) {
  const { themeColors } = useTheme()

  const handleClassSelect = (classId: string | null) => {
    onClassChange(classId)
    // Reset level when changing class
    if (classId !== selectedClassId) {
      onLevelChange(null)
    }
  }

  return (
    <YStack
      gap={8}
      padding={12}
      borderRadius={10}
      borderWidth={1}
      borderColor={themeColors.borderColor}
      backgroundColor={themeColors.uiBackgroundColor}
    >
      {/* Class selector */}
      <YStack gap={6}>
        <Text fontSize={12} color="$placeholderColor" fontWeight="500">
          CLASE
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {/* Any class option */}
          <FilterChip
            label="Todas"
            selected={selectedClassId === null}
            onPress={() => handleClassSelect(null)}
          />

          {availableClasses.map((cls) => (
            <FilterChip
              key={cls.id}
              label={cls.label}
              selected={selectedClassId === cls.id}
              onPress={() => handleClassSelect(cls.id)}
            />
          ))}
        </ScrollView>
      </YStack>

      {/* Level selector - only show when a class is selected */}
      {selectedClassId !== null && (
        <YStack gap={6}>
          <Text fontSize={12} color="$placeholderColor" fontWeight="500">
            NIVEL
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {/* Any level option */}
            <FilterChip
              label="Todos"
              selected={selectedLevel === null}
              onPress={() => onLevelChange(null)}
              compact
            />

            {availableLevels.map((level) => (
              <FilterChip
                key={level}
                label={String(level)}
                selected={selectedLevel === level}
                onPress={() => onLevelChange(level)}
                compact
              />
            ))}
          </ScrollView>
        </YStack>
      )}
    </YStack>
  )
}

// ============================================================================
// FilterChip subcomponent
// ============================================================================

type FilterChipProps = {
  label: string
  selected: boolean
  onPress: () => void
  compact?: boolean
}

function FilterChip({ label, selected, onPress, compact = false }: FilterChipProps) {
  const { themeColors, themeInfo } = useTheme()

  // Use accent color from themeInfo for selected state
  const accentColor = themeInfo.colors.accent

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <XStack
          paddingHorizontal={compact ? 10 : 14}
          paddingVertical={6}
          borderRadius={16}
          backgroundColor={selected ? accentColor : themeColors.background}
          borderWidth={1}
          borderColor={selected ? accentColor : themeColors.borderColor}
          opacity={pressed ? 0.7 : 1}
        >
          <Text
            fontSize={13}
            fontWeight={selected ? '600' : '400'}
            color={selected ? '#FFFFFF' : themeColors.color}
          >
            {label}
          </Text>
        </XStack>
      )}
    </Pressable>
  )
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
})
