import { Pressable } from 'react-native'
import { XStack, Text } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { useTheme } from '../../ui'
import type {
  EntityFilterConfig,
  FilterState,
  FilterDef,
  RelationFilterDef,
  FacetFilterDef,
} from '@zukus/core'
import { isRelationFilter, isFacetFilter, isFilterGroup, getRelationFilterChipLabel } from '@zukus/core'

// ============================================================================
// Types
// ============================================================================

type ActiveFilterChipsProps = {
  /** Filter configuration */
  config: EntityFilterConfig
  /** Current filter state */
  filterState: FilterState
  /** Callback to clear a specific filter */
  onClearFilter: (filterId: string) => void
  /** Callback to clear all filters */
  onClearAll?: () => void
}

type ChipData = {
  id: string
  label: string
  clearIds: string[] // IDs to clear when chip is removed
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build chip data from filter configuration and current state.
 */
function buildChips(config: EntityFilterConfig, filterState: FilterState): ChipData[] {
  const chips: ChipData[] = []

  function processFilter(filter: FilterDef) {
    if (isFilterGroup(filter)) {
      for (const child of filter.children) {
        processFilter(child)
      }
      return
    }

    if (isRelationFilter(filter)) {
      const primaryValue = filterState[filter.primary.id] as string | null
      const secondaryValue = filterState[filter.secondary.id] as string | number | null

      const label = getRelationFilterChipLabel(filter, primaryValue, secondaryValue)
      if (label) {
        chips.push({
          id: filter.id,
          label,
          clearIds: [filter.primary.id, filter.secondary.id],
        })
      }
      return
    }

    if (isFacetFilter(filter)) {
      const value = filterState[filter.id]

      // Multi-select: array of values
      if (Array.isArray(value) && value.length > 0) {
        // Show count if more than 2 values, otherwise list them
        if (value.length > 2) {
          chips.push({
            id: filter.id,
            label: `${filter.label}: ${value.length} seleccionados`,
            clearIds: [filter.id],
          })
        } else {
          chips.push({
            id: filter.id,
            label: `${filter.label}: ${value.join(', ')}`,
            clearIds: [filter.id],
          })
        }
        return
      }

      // Single select: string value
      if (typeof value === 'string' && value !== '') {
        chips.push({
          id: filter.id,
          label: `${filter.label}: ${value}`,
          clearIds: [filter.id],
        })
      }
    }
  }

  for (const filter of config.filters) {
    processFilter(filter)
  }

  return chips
}

// ============================================================================
// Component
// ============================================================================

export function ActiveFilterChips({
  config,
  filterState,
  onClearFilter,
  onClearAll,
}: ActiveFilterChipsProps) {
  const { themeColors } = useTheme()
  const placeholderColor = themeColors.placeholderColor

  const chips = buildChips(config, filterState)

  if (chips.length === 0) {
    return null
  }

  const handleClearChip = (chip: ChipData) => {
    for (const id of chip.clearIds) {
      onClearFilter(id)
    }
  }

  return (
    <XStack gap={8} flexWrap="wrap">
      {chips.map((chip) => (
        <XStack
          key={chip.id}
          backgroundColor="$uiBackgroundColor"
          paddingHorizontal={12}
          paddingVertical={6}
          borderRadius={16}
          borderWidth={1}
          borderColor="$borderColor"
          alignItems="center"
          gap={8}
        >
          <Text fontSize={13} color="$color">
            {chip.label}
          </Text>
          <Pressable onPress={() => handleClearChip(chip)} hitSlop={8}>
            {({ pressed }) => (
              <FontAwesome6
                name="xmark"
                size={14}
                color={placeholderColor}
                style={{ opacity: pressed ? 0.5 : 1 }}
              />
            )}
          </Pressable>
        </XStack>
      ))}

      {onClearAll && chips.length > 1 && (
        <Pressable onPress={onClearAll}>
          {({ pressed }) => (
            <XStack
              paddingHorizontal={12}
              paddingVertical={6}
              borderRadius={16}
              alignItems="center"
              opacity={pressed ? 0.5 : 1}
            >
              <Text fontSize={13} color="$placeholderColor">
                Limpiar todo
              </Text>
            </XStack>
          )}
        </Pressable>
      )}
    </XStack>
  )
}
