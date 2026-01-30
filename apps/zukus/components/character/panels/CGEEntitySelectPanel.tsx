import { View, Pressable, TextInput, StyleSheet, Platform } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { YStack, XStack, Text } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'expo-router'
import {
  usePrimaryCGE,
  useTheme,
  useCharacterStore,
  useCompendiumContext,
} from '../../../ui'
import { usePanelNavigation } from '../../../hooks'
import { useNavigateToDetail } from '../../../navigation'
import type { StandardEntity, FilterState, FilterValue, FacetFilterDef } from '@zukus/core'
import {
  spellFilterConfig,
  getFilterConfig,
  createInitialFilterState,
  applyRelationFilter,
  isRelationFilter,
  isFacetFilter,
  isFilterGroup,
  type EntityFilterConfig,
} from '@zukus/core'
import { SpellListItem } from './SpellListItem'
import { EntityFilterView, ActiveFilterChips } from '../../filters'

// ============================================================================
// Types
// ============================================================================

type CGEEntitySelectPanelProps = {
  /**
   * Format depends on mode:
   * - Prepare mode: "level:slotIndex:cgeId:trackId"
   * - Known mode: "known:level:cgeId"
   */
  selectionId: string
}

type SelectionMode = 'prepare' | 'known'

type ParsedSelection = {
  mode: SelectionMode
  level: number
  cgeId: string
  // Only for prepare mode
  slotIndex?: number
  trackId?: string
}

/**
 * Parse selectionId to determine mode and extract params.
 */
function parseSelectionId(selectionId: string, fallbackCgeId: string): ParsedSelection {
  const parts = selectionId.split(':')

  // Known mode: "known:level:cgeId"
  if (parts[0] === 'known') {
    return {
      mode: 'known',
      level: parseInt(parts[1] ?? '0', 10),
      cgeId: parts[2] ?? fallbackCgeId,
    }
  }

  // Prepare mode: "level:slotIndex:cgeId:trackId"
  return {
    mode: 'prepare',
    level: parseInt(parts[0] ?? '0', 10),
    slotIndex: parseInt(parts[1] ?? '0', 10),
    cgeId: parts[2] ?? fallbackCgeId,
    trackId: parts[3] ?? 'base',
  }
}

type EnrichedSpell = StandardEntity & {
  image?: string
  classData?: {
    classLevelKeys: string[]
    classLevels: Record<string, number>
  }
}

// ============================================================================
// Component
// ============================================================================

export function CGEEntitySelectPanel({ selectionId }: CGEEntitySelectPanelProps) {
  'use no memo'

  // ============================================================================
  // Helper functions (inside component to avoid React Compiler issues)
  // ============================================================================

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

  function matchesFacetFilter(
    entity: unknown,
    filter: FacetFilterDef,
    filterValue: FilterValue
  ): boolean {
    if (filterValue === null || filterValue === undefined) return true

    const fieldValue = getNestedValue(entity, filter.facetField)

    // Multi-select: filterValue is an array, match if ANY selected value matches
    if (Array.isArray(filterValue)) {
      if (filterValue.length === 0) return true

      // Entity field is also an array (e.g., components)
      if (Array.isArray(fieldValue)) {
        return filterValue.some((fv) => fieldValue.includes(fv))
      }

      // Entity field is a single value
      return filterValue.includes(fieldValue as string)
    }

    // Single select
    if (filterValue === '') return true

    if (Array.isArray(fieldValue)) {
      return fieldValue.includes(filterValue)
    }

    return fieldValue === filterValue
  }

  function applyFilters(
    entities: EnrichedSpell[],
    filterState: FilterState,
    config: typeof spellFilterConfig
  ): EnrichedSpell[] {
    const start = performance.now()

    let result = entities

    // Process each filter in the config
    for (const filter of config.filters) {
      if (isRelationFilter(filter)) {
        const primaryValue = filterState[filter.primary.id] as string | null
        const secondaryValue = filterState[filter.secondary.id] as string | number | null

        if (primaryValue !== null) {
          result = result.filter((entity) =>
            applyRelationFilter(entity, filter, primaryValue, secondaryValue)
          )
        }
      } else if (isFacetFilter(filter)) {
        const value = filterState[filter.id]
        result = result.filter((entity) => matchesFacetFilter(entity, filter, value))
      } else if (isFilterGroup(filter)) {
        // Process group children
        for (const child of filter.children) {
          if (isRelationFilter(child)) {
            const primaryValue = filterState[child.primary.id] as string | null
            const secondaryValue = filterState[child.secondary.id] as string | number | null

            if (primaryValue !== null) {
              result = result.filter((entity) =>
                applyRelationFilter(entity, child, primaryValue, secondaryValue)
              )
            }
          } else if (isFacetFilter(child)) {
            const value = filterState[child.id]
            result = result.filter((entity) => matchesFacetFilter(entity, child, value))
          }
        }
      }
    }

    const elapsed = performance.now() - start
    console.log(
      `[Perf] applyFilters: ${elapsed.toFixed(2)}ms (${entities.length} -> ${result.length})`
    )

    return result
  }

  function filterBySearch(entities: EnrichedSpell[], query: string): EnrichedSpell[] {
    if (!query.trim()) return entities

    const start = performance.now()
    const q = query.toLowerCase().trim()
    const result = entities.filter((entity) => {
      const nameMatch = entity.name.toLowerCase().includes(q)
      const descMatch = entity.description?.toLowerCase().includes(q)
      return nameMatch || descMatch
    })

    const elapsed = performance.now() - start
    console.log(
      `[Perf] filterBySearch("${q}"): ${elapsed.toFixed(2)}ms (${entities.length} -> ${result.length})`
    )

    return result
  }

  function hasActiveFilters(filterState: FilterState): boolean {
    return Object.values(filterState).some((value) => {
      if (value === null || value === undefined || value === '') return false
      if (Array.isArray(value)) return value.length > 0
      return true
    })
  }

  const { themeColors, themeInfo } = useTheme()
  const primaryCGE = usePrimaryCGE()
  const compendium = useCompendiumContext()
  const prepareEntityForCGE = useCharacterStore((state) => state.prepareEntityForCGE)
  const addKnownForCGE = useCharacterStore((state) => state.addKnownForCGE)
  const panelNav = usePanelNavigation('character')
  const router = useRouter()
  const navigateToDetail = useNavigateToDetail()

  // Parse selectionId to determine mode (known vs prepare)
  const selection = parseSelectionId(selectionId, primaryCGE?.id ?? '')
  const { mode, level: slotLevel, cgeId } = selection

  const entityType = primaryCGE?.entityType ?? 'spell'
  const defaultClassId = primaryCGE?.classId ?? 'wizard'

  // Get filter configuration from registry based on entity type
  const filterConfig: EntityFilterConfig = getFilterConfig(entityType) ?? spellFilterConfig

  // Initialize filter state with defaults from CGE context
  const initialFilterState = useMemo(() => {
    const state = createInitialFilterState(filterConfig)
    // Override defaults with CGE context
    state['class'] = defaultClassId
    // For LIMITED_TOTAL (level -1), don't set a level filter - allow any level
    state['level'] = slotLevel >= 0 ? slotLevel : null
    return state
  }, [filterConfig, defaultClassId, slotLevel])

  // View state
  const [showFilters, setShowFilters] = useState(false)

  // Filter state (applied filters)
  const [appliedFilterState, setAppliedFilterState] = useState<FilterState>(initialFilterState)

  // Pending filter state (while editing in filter view)
  const [pendingFilterState, setPendingFilterState] = useState<FilterState>(initialFilterState)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Primitive colors extracted for FlashList items
  const textColor = themeColors.color
  const placeholderColor = themeColors.placeholderColor
  const accentColor = themeInfo.colors.accent

  // Data pipeline
  const allEntities = compendium.getAllEntities(entityType) as EnrichedSpell[]
  const filteredByConfig = applyFilters(allEntities, appliedFilterState, filterConfig)
  const filteredEntities = filterBySearch(filteredByConfig, searchQuery)

  const handleSelectEntity = useCallback(
    (entityId: string) => {
      let result

      if (mode === 'known') {
        // Add to known entities - find entity from the already-loaded list
        const entity = allEntities.find((e) => e.id === entityId)
        if (!entity) {
          console.warn('Entity not found:', entityId)
          return
        }
        result = addKnownForCGE(cgeId, entity, slotLevel)
        if (!result.success) {
          console.warn('Failed to add known entity:', result.error)
          return
        }
      } else {
        // Prepare in slot
        const { slotIndex = 0, trackId = 'base' } = selection
        result = prepareEntityForCGE(cgeId, slotLevel, slotIndex, entityId, trackId)
        if (!result.success) {
          console.warn('Failed to prepare entity:', result.error)
          return
        }
      }

      if (Platform.OS !== 'web') {
        router.back()
      } else {
        panelNav.goBack()
      }
    },
    [mode, selection, allEntities, addKnownForCGE, prepareEntityForCGE, cgeId, slotLevel, router, panelNav]
  )

  const handleViewEntityDetail = useCallback(
    (entityId: string) => {
      // Find entity name from the already-filtered list to avoid context issues
      const entity = filteredEntities.find(e => e.id === entityId)
      const entityName = entity?.name ?? entityId
      navigateToDetail('compendiumEntity', entityId, entityName)
    },
    [filteredEntities, navigateToDetail]
  )

  const handleOpenFilters = () => {
    setPendingFilterState({ ...appliedFilterState })
    setShowFilters(true)
  }

  const handleApplyFilters = () => {
    setAppliedFilterState({ ...pendingFilterState })
    setShowFilters(false)
  }

  const handleCancelFilters = () => {
    setShowFilters(false)
  }

  const handlePendingFilterChange = (filterId: string, value: FilterValue) => {
    setPendingFilterState((prev) => ({ ...prev, [filterId]: value }))
  }

  const handleClearFilter = (filterId: string) => {
    setAppliedFilterState((prev) => ({ ...prev, [filterId]: null }))
  }

  const handleClearAllFilters = () => {
    const clearedState: FilterState = {}
    for (const key of Object.keys(appliedFilterState)) {
      clearedState[key] = null
    }
    setAppliedFilterState(clearedState)
  }

  // Pre-compute level label for the selected class
  const selectedClassId = appliedFilterState['class'] as string | null
  const levelLabelForClass = selectedClassId
    ? (spell: EnrichedSpell) => {
        const lvl = spell.classData?.classLevels[selectedClassId]
        return lvl !== undefined ? `Nv ${lvl}` : null
      }
    : () => null

  const hasFilters = hasActiveFilters(appliedFilterState)

  // ============================================================================
  // Filter View
  // ============================================================================

  if (showFilters) {
    return (
      <EntityFilterView
        config={filterConfig}
        entities={allEntities}
        filterState={pendingFilterState}
        onFilterChange={handlePendingFilterChange}
        onApply={handleApplyFilters}
        onCancel={handleCancelFilters}
        contextContent={
          slotLevel >= 0 ? (
            <XStack
              backgroundColor="$uiBackgroundColor"
              padding={12}
              borderRadius={8}
              borderWidth={1}
              borderColor="$borderColor"
              gap={8}
              alignItems="center"
            >
              <FontAwesome6 name="circle-info" size={14} color={placeholderColor} />
              <Text fontSize={13} color="$placeholderColor" flex={1}>
                {mode === 'known'
                  ? `Aprendiendo ${entityType} de nivel ${slotLevel}`
                  : `Preparando para slot de nivel ${slotLevel}`}
              </Text>
            </XStack>
          ) : undefined
        }
      />
    )
  }

  // ============================================================================
  // List View
  // ============================================================================

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={filteredEntities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SpellListItem
            id={item.id}
            name={item.name}
            description={item.description}
            levelLabel={levelLabelForClass(item)}
            image={item.image}
            color={textColor}
            placeholderColor={placeholderColor}
            onPress={handleSelectEntity}
            onInfoPress={handleViewEntityDetail}
          />
        )}
        ListHeaderComponent={
          <YStack padding={16} gap={12}>
            {/* Search bar + Filter button */}
            <XStack gap={8} alignItems="center">
              <XStack
                flex={1}
                backgroundColor="$background"
                borderRadius={10}
                borderWidth={1}
                borderColor="$borderColor"
                paddingHorizontal={12}
                paddingVertical={8}
                alignItems="center"
                gap={8}
              >
                <FontAwesome6 name="magnifying-glass" size={14} color={placeholderColor} />
                <TextInput
                  style={[styles.searchInput, { color: textColor }]}
                  placeholder="Buscar por nombre..."
                  placeholderTextColor={placeholderColor}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                    <FontAwesome6 name="xmark" size={14} color={placeholderColor} />
                  </Pressable>
                )}
              </XStack>

              {/* Filter button */}
              <Pressable onPress={handleOpenFilters}>
                {({ pressed }) => (
                  <XStack
                    backgroundColor={hasFilters ? accentColor : '$uiBackgroundColor'}
                    paddingHorizontal={14}
                    paddingVertical={10}
                    borderRadius={10}
                    borderWidth={1}
                    borderColor={hasFilters ? accentColor : '$borderColor'}
                    alignItems="center"
                    gap={6}
                    opacity={pressed ? 0.7 : 1}
                  >
                    <FontAwesome6
                      name="sliders"
                      size={14}
                      color={hasFilters ? '#FFFFFF' : placeholderColor}
                    />
                    <Text
                      fontSize={14}
                      fontWeight="500"
                      color={hasFilters ? '#FFFFFF' : '$placeholderColor'}
                    >
                      Filtros
                    </Text>
                  </XStack>
                )}
              </Pressable>
            </XStack>

            {/* Applied filter chips */}
            <ActiveFilterChips
              config={filterConfig}
              filterState={appliedFilterState}
              onClearFilter={handleClearFilter}
              onClearAll={handleClearAllFilters}
            />

            {/* Results count */}
            <Text fontSize={13} color="$placeholderColor">
              {filteredEntities.length}{' '}
              {filteredEntities.length === 1 ? 'resultado' : 'resultados'}
            </Text>
          </YStack>
        }
        ListEmptyComponent={
          <Text color="$placeholderColor" textAlign="center" paddingVertical={32}>
            {searchQuery
              ? 'No se encontraron resultados'
              : `No hay ${entityType === 'spell' ? 'conjuros' : entityType === 'maneuver' ? 'maniobras' : 'entidades'} disponibles para esta combinacion.`}
          </Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
})
