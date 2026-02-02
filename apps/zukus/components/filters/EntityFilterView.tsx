import { View, StyleSheet, Platform, Pressable } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { YStack, XStack, Text, ScrollView } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../ui'
import type {
  EntityFilterConfig,
  FilterDef,
  FilterState,
  FilterValue,
  RelationFilterDef,
  FacetFilterDef,
  EntityTypeFilterDef,
} from '@zukus/core'
import {
  isFacetFilter,
  isRelationFilter,
  isFilterGroup,
  isEntityTypeFilter,
  getRelationSecondaryOptions,
} from '@zukus/core'

// ============================================================================
// Types
// ============================================================================

type EntityFilterViewProps = {
  /** Filter configuration for the entity type */
  config: EntityFilterConfig
  /** All entities to derive options from */
  entities: unknown[]
  /** Current filter state */
  filterState: FilterState
  /** Callback when a filter value changes */
  onFilterChange: (filterId: string, value: FilterValue) => void
  /** Callback when user clicks Apply */
  onApply: () => void
  /** Callback when user clicks Cancel */
  onCancel: () => void
  /** Optional: Additional context shown above buttons */
  contextContent?: React.ReactNode
}

type FilterControlProps = {
  filter: FilterDef
  entities: unknown[]
  filterState: FilterState
  onFilterChange: (filterId: string, value: FilterValue) => void
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract unique values from entities for a given field path.
 * Used to generate options for facet filters dynamically.
 */
function extractUniqueValues(entities: unknown[], fieldPath: string): string[] {
  const values = new Set<string>()

  for (const entity of entities) {
    const value = getNestedValue(entity, fieldPath)
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        for (const v of value) {
          if (typeof v === 'string' || typeof v === 'number') {
            values.add(String(v))
          }
        }
      } else if (typeof value === 'string' || typeof value === 'number') {
        values.add(String(value))
      }
    }
  }

  return Array.from(values).sort()
}

/**
 * Get nested value from an object using dot-separated path.
 */
function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj

  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }

  return current
}

// ============================================================================
// Filter Controls
// ============================================================================

function RelationFilterControl({
  filter,
  entities,
  filterState,
  onFilterChange,
}: {
  filter: RelationFilterDef
  entities: unknown[]
  filterState: FilterState
  onFilterChange: (filterId: string, value: FilterValue) => void
}) {
  const { themeColors } = useTheme()
  const textColor = themeColors.color
  const placeholderColor = themeColors.placeholderColor
  const backgroundColor = themeColors.uiBackgroundColor
  const borderColor = themeColors.borderColor

  const primaryValue = filterState[filter.primary.id] as string | null
  const secondaryValue = filterState[filter.secondary.id] as string | number | null

  // Get secondary options based on primary selection
  const secondaryOptions = getRelationSecondaryOptions(entities, filter, primaryValue)

  const handlePrimaryChange = (value: string | null) => {
    onFilterChange(filter.primary.id, value)
    // Reset secondary when primary changes if current value is not available
    if (value === null) {
      onFilterChange(filter.secondary.id, null)
    } else {
      const newOptions = getRelationSecondaryOptions(entities, filter, value)
      const currentSecondary = filterState[filter.secondary.id]
      if (currentSecondary !== null && !newOptions.some((o) => o.value === currentSecondary)) {
        onFilterChange(filter.secondary.id, null)
      }
    }
  }

  // Web needs explicit background color on Picker
  const pickerStyle = Platform.select({
    web: [styles.picker, { color: textColor, backgroundColor }],
    default: [styles.picker, { color: textColor }],
  })

  return (
    <YStack gap={16}>
      {/* Primary selector */}
      <YStack gap={8}>
        <Text fontSize={14} fontWeight="600" color="$placeholderColor">
          {filter.primary.label.toUpperCase()}
        </Text>
        <View style={[styles.pickerContainer, { backgroundColor, borderColor }]}>
          <Picker
            selectedValue={primaryValue ?? ''}
            onValueChange={(v) => handlePrimaryChange(v === '' ? null : v)}
            style={pickerStyle}
            dropdownIconColor={placeholderColor}
          >
            <Picker.Item label={filter.primary.ui?.placeholder ?? `Todos`} value="" />
            {filter.primary.options.map((opt) => (
              <Picker.Item key={String(opt.value)} label={opt.label} value={String(opt.value)} />
            ))}
          </Picker>
        </View>
      </YStack>

      {/* Secondary selector - only show when primary is selected */}
      {primaryValue && secondaryOptions.length > 0 && (
        <YStack gap={8}>
          <Text fontSize={14} fontWeight="600" color="$placeholderColor">
            {filter.secondary.label.toUpperCase()}
          </Text>
          <View style={[styles.pickerContainer, { backgroundColor, borderColor }]}>
            <Picker
              selectedValue={secondaryValue === null ? '' : String(secondaryValue)}
              onValueChange={(v) => {
                if (v === '') {
                  onFilterChange(filter.secondary.id, null)
                } else {
                  // Determine if value is numeric
                  const numVal = parseInt(v, 10)
                  onFilterChange(filter.secondary.id, isNaN(numVal) ? v : numVal)
                }
              }}
              style={pickerStyle}
              dropdownIconColor={placeholderColor}
            >
              <Picker.Item label={filter.secondary.ui?.placeholder ?? `Todos`} value="" />
              {secondaryOptions.map((opt) => (
                <Picker.Item key={String(opt.value)} label={opt.label} value={String(opt.value)} />
              ))}
            </Picker>
          </View>
        </YStack>
      )}
    </YStack>
  )
}

function FacetFilterControl({
  filter,
  entities,
  filterState,
  onFilterChange,
}: {
  filter: FacetFilterDef
  entities: unknown[]
  filterState: FilterState
  onFilterChange: (filterId: string, value: FilterValue) => void
}) {
  const { themeColors, themeInfo } = useTheme()
  const textColor = themeColors.color
  const placeholderColor = themeColors.placeholderColor
  const backgroundColor = themeColors.uiBackgroundColor
  const borderColor = themeColors.borderColor
  const accentColor = themeInfo.colors.accent

  const currentValue = filterState[filter.id]

  // Extract options from entities dynamically
  const options = extractUniqueValues(entities, filter.facetField)

  // Don't render if no options available
  if (options.length === 0) {
    return null
  }

  // Multi-select mode: use chips
  if (filter.multiSelect) {
    const selectedValues = Array.isArray(currentValue) ? currentValue : []

    const handleToggle = (option: string) => {
      const newValues = selectedValues.includes(option)
        ? selectedValues.filter((v) => v !== option)
        : [...selectedValues, option]
      onFilterChange(filter.id, newValues.length > 0 ? newValues : null)
    }

    return (
      <YStack gap={8}>
        <Text fontSize={14} fontWeight="600" color="$placeholderColor">
          {filter.label.toUpperCase()}
        </Text>
        <XStack gap={8} flexWrap="wrap">
          {options.map((opt) => {
            const isSelected = selectedValues.includes(opt)
            return (
              <Pressable key={opt} onPress={() => handleToggle(opt)}>
                {({ pressed }) => (
                  <XStack
                    backgroundColor={isSelected ? accentColor : backgroundColor}
                    paddingHorizontal={12}
                    paddingVertical={8}
                    borderRadius={8}
                    borderWidth={1}
                    borderColor={isSelected ? accentColor : borderColor}
                    alignItems="center"
                    gap={6}
                    opacity={pressed ? 0.7 : 1}
                  >
                    {isSelected && <FontAwesome6 name="check" size={12} color="#FFFFFF" />}
                    <Text fontSize={13} color={isSelected ? '#FFFFFF' : '$color'}>
                      {opt}
                    </Text>
                  </XStack>
                )}
              </Pressable>
            )
          })}
        </XStack>
      </YStack>
    )
  }

  // Single select mode: use Picker
  const singleValue = typeof currentValue === 'string' ? currentValue : null

  // Web needs explicit background color on Picker
  const pickerStyle = Platform.select({
    web: [styles.picker, { color: textColor, backgroundColor }],
    default: [styles.picker, { color: textColor }],
  })

  return (
    <YStack gap={8}>
      <Text fontSize={14} fontWeight="600" color="$placeholderColor">
        {filter.label.toUpperCase()}
      </Text>
      <View style={[styles.pickerContainer, { backgroundColor, borderColor }]}>
        <Picker
          selectedValue={singleValue ?? ''}
          onValueChange={(v) => onFilterChange(filter.id, v === '' ? null : v)}
          style={pickerStyle}
          dropdownIconColor={placeholderColor}
        >
          <Picker.Item label={filter.ui?.placeholder ?? 'Todos'} value="" />
          {options.map((opt) => (
            <Picker.Item key={opt} label={opt} value={opt} />
          ))}
        </Picker>
      </View>
    </YStack>
  )
}

function EntityTypeFilterControl({
  filter,
  filterState,
  onFilterChange,
}: {
  filter: EntityTypeFilterDef
  filterState: FilterState
  onFilterChange: (filterId: string, value: FilterValue) => void
}) {
  const { themeColors, themeInfo } = useTheme()
  const backgroundColor = themeColors.uiBackgroundColor
  const borderColor = themeColors.borderColor
  const accentColor = themeInfo.colors.accent

  const currentValue = filterState[filter.id]
  const selectedTypes = Array.isArray(currentValue) ? currentValue : []

  const handleToggle = (entityType: string) => {
    if (filter.multiSelect !== false) {
      // Multi-select mode
      const newValues = selectedTypes.includes(entityType)
        ? selectedTypes.filter((v) => v !== entityType)
        : [...selectedTypes, entityType]
      onFilterChange(filter.id, newValues.length > 0 ? newValues : null)
    } else {
      // Single-select mode
      const newValue = selectedTypes.includes(entityType) ? null : entityType
      onFilterChange(filter.id, newValue)
    }
  }

  return (
    <YStack gap={8}>
      <Text fontSize={14} fontWeight="600" color="$placeholderColor">
        {filter.label.toUpperCase()}
      </Text>
      <XStack gap={8} flexWrap="wrap">
        {filter.entityTypes.map((entityType) => {
          const isSelected = selectedTypes.includes(entityType)
          const label = filter.typeLabels?.[entityType] ?? entityType
          return (
            <Pressable key={entityType} onPress={() => handleToggle(entityType)}>
              {({ pressed }) => (
                <XStack
                  backgroundColor={isSelected ? accentColor : backgroundColor}
                  paddingHorizontal={12}
                  paddingVertical={8}
                  borderRadius={8}
                  borderWidth={1}
                  borderColor={isSelected ? accentColor : borderColor}
                  alignItems="center"
                  gap={6}
                  opacity={pressed ? 0.7 : 1}
                >
                  {isSelected && <FontAwesome6 name="check" size={12} color="#FFFFFF" />}
                  <Text fontSize={13} color={isSelected ? '#FFFFFF' : '$color'}>
                    {label}
                  </Text>
                </XStack>
              )}
            </Pressable>
          )
        })}
      </XStack>
    </YStack>
  )
}

function FilterControl({ filter, entities, filterState, onFilterChange }: FilterControlProps) {
  if (isEntityTypeFilter(filter)) {
    return (
      <EntityTypeFilterControl
        filter={filter}
        filterState={filterState}
        onFilterChange={onFilterChange}
      />
    )
  }

  if (isRelationFilter(filter)) {
    return (
      <RelationFilterControl
        filter={filter}
        entities={entities}
        filterState={filterState}
        onFilterChange={onFilterChange}
      />
    )
  }

  if (isFacetFilter(filter)) {
    return (
      <FacetFilterControl
        filter={filter}
        entities={entities}
        filterState={filterState}
        onFilterChange={onFilterChange}
      />
    )
  }

  if (isFilterGroup(filter)) {
    const isRow = filter.layout === 'row'
    const Container = isRow ? XStack : YStack

    return (
      <YStack gap={8}>
        {filter.label && (
          <Text fontSize={14} fontWeight="600" color="$placeholderColor">
            {filter.label.toUpperCase()}
          </Text>
        )}
        <Container gap={isRow ? 12 : 16}>
          {filter.children.map((child) => (
            <View key={child.id} style={isRow ? { flex: 1 } : undefined}>
              <FilterControl
                filter={child}
                entities={entities}
                filterState={filterState}
                onFilterChange={onFilterChange}
              />
            </View>
          ))}
        </Container>
      </YStack>
    )
  }

  return null
}

// ============================================================================
// Main Component
// ============================================================================

export function EntityFilterView({
  config,
  entities,
  filterState,
  onFilterChange,
  onApply,
  onCancel,
  contextContent,
}: EntityFilterViewProps) {
  const { themeColors, themeInfo } = useTheme()
  const insets = useSafeAreaInsets()
  const accentColor = themeInfo.colors.accent

  // Calculate bottom padding for safe area (Android navigation buttons)
  const bottomPadding = Math.max(insets.bottom, 16)

  return (
    <YStack flex={1}>
      {/* Scrollable content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 24 }}>
        {/* Header */}
        <YStack gap={4}>
          <Text fontSize={20} fontWeight="700" color="$color">
            Filtros
          </Text>
          <Text fontSize={14} color="$placeholderColor">
            Filtra {config.label.toLowerCase()} por los campos disponibles
          </Text>
        </YStack>

        {/* Filter controls */}
        <YStack gap={20}>
          {config.filters.map((filter) => (
            <FilterControl
              key={filter.id}
              filter={filter}
              entities={entities}
              filterState={filterState}
              onFilterChange={onFilterChange}
            />
          ))}
        </YStack>

        {/* Context content (e.g., slot level reminder) */}
        {contextContent}
      </ScrollView>

      {/* Fixed bottom buttons */}
      <YStack
        paddingHorizontal={16}
        paddingTop={12}
        paddingBottom={bottomPadding}
        borderTopWidth={1}
        borderTopColor="$borderColor"
        backgroundColor="$background"
      >
        <XStack gap={12}>
          <Pressable
            onPress={onCancel}
            style={[styles.button, styles.secondaryButton, { borderColor: themeColors.borderColor }]}
          >
            {({ pressed }) => (
              <Text fontSize={15} fontWeight="600" color="$color" opacity={pressed ? 0.6 : 1}>
                Cancelar
              </Text>
            )}
          </Pressable>
          <Pressable
            onPress={onApply}
            style={[styles.button, styles.primaryButton, { backgroundColor: accentColor }]}
          >
            {({ pressed }) => (
              <Text fontSize={15} fontWeight="600" color="#FFFFFF" opacity={pressed ? 0.8 : 1}>
                Aplicar
              </Text>
            )}
          </Pressable>
        </XStack>
      </YStack>
    </YStack>
  )
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  pickerContainer: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    // backgroundColor set inline
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
})
