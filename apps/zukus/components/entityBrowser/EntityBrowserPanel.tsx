import { View, Pressable, TextInput, StyleSheet } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { YStack, XStack, Text } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { useState } from 'react'
import { useTheme } from '../../ui'
import { EntityFilterView, ActiveFilterChips } from '../filters'
import { EntityRowWithMenu } from './EntityRowWithMenu'
import {
  ActionDropdownSheet,
  CounterBar,
  COUNTER_BAR_HEIGHT,
} from './actions'
import type {
  ButtonConfig,
  ActionHandlers,
  CounterHandlers,
  DropdownButtonConfig,
} from './types'
import { isDropdownConfig, isCounterConfig, isCounterHandlers } from './types'
import { filterBySearch, hasActiveFilters, createFilterStateWithOverrides } from './utils'
import type { StandardEntity, FilterState, FilterValue, EntityFilterConfig } from '@zukus/core'

// ============================================================================
// Types
// ============================================================================

export type EntityBrowserPanelProps<T extends StandardEntity> = {
  /** All entities to display */
  entities: T[]
  /** Filter configuration */
  filterConfig: EntityFilterConfig
  /** Initial filter state overrides */
  initialFilterOverrides?: Partial<FilterState>
  /** Action button configuration */
  buttonConfig: ButtonConfig
  /** Action handlers */
  handlers: ActionHandlers | CounterHandlers
  /** Called when entity row is pressed (navigate to detail) */
  onEntityPress: (entity: T) => void
  /** Search placeholder text */
  searchPlaceholder?: string
  /** Empty state text when no search */
  emptyText?: string
  /** Empty state text when searching */
  emptySearchText?: string
  /** Results count label (singular) */
  resultLabelSingular?: string
  /** Results count label (plural) */
  resultLabelPlural?: string
  /** Optional context content shown in filter view */
  filterContextContent?: React.ReactNode
  /** Render additional metadata line for each entity */
  getMetaLine?: (entity: T) => string | undefined
  /** Render badge for each entity */
  getBadge?: (entity: T) => string | null
  /** Custom filter function (in addition to config-based filters) */
  customFilter?: (entities: T[], filterState: FilterState) => T[]
}

// ============================================================================
// Component
// ============================================================================

/** @deprecated Use EntitySelectionView instead */
export function EntityBrowserPanel<T extends StandardEntity>({
  entities,
  filterConfig,
  initialFilterOverrides,
  buttonConfig,
  handlers,
  onEntityPress,
  searchPlaceholder = 'Buscar...',
  emptyText = 'No hay elementos disponibles.',
  emptySearchText = 'No se encontraron resultados.',
  resultLabelSingular = 'resultado',
  resultLabelPlural = 'resultados',
  filterContextContent,
  getMetaLine,
  getBadge,
  customFilter,
}: EntityBrowserPanelProps<T>) {
  'use no memo'

  const { themeColors, themeInfo } = useTheme()

  // Initialize filter state - computed once, stored in state
  const [appliedFilterState, setAppliedFilterState] = useState<FilterState>(() =>
    createFilterStateWithOverrides(filterConfig, initialFilterOverrides)
  )
  const [pendingFilterState, setPendingFilterState] = useState<FilterState>(() =>
    createFilterStateWithOverrides(filterConfig, initialFilterOverrides)
  )

  // View state
  const [showFilters, setShowFilters] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Dropdown state
  const [dropdownEntityId, setDropdownEntityId] = useState<string | null>(null)


  // Primitive colors
  const textColor = themeColors.color
  const placeholderColor = themeColors.placeholderColor
  const accentColor = themeInfo.colors.accent

  // Find entity by ID (for dropdown)
  const findEntity = (entityId: string) => entities.find((e) => e.id === entityId)

  // Apply filters - no useMemo needed with 'use no memo'
  const filteredByConfig = customFilter
    ? customFilter(entities, appliedFilterState)
    : entities

  const filteredEntities = filterBySearch(filteredByConfig, searchQuery)

  // ============================================================================
  // Handlers - plain functions, no useCallback needed with 'use no memo'
  // ============================================================================

  const handleEntityPress = (entityId: string) => {
    const entity = findEntity(entityId)
    if (entity) {
      onEntityPress(entity)
    }
  }

  const handleOpenDropdown = (entityId: string) => {
    setDropdownEntityId(entityId)
  }

  const handleCloseDropdown = () => {
    setDropdownEntityId(null)
  }

  const handleSelectDropdownAction = (actionId: string) => {
    if (!dropdownEntityId) return

    // Guardar el entityId antes de cerrar
    const entityId = dropdownEntityId

    // Cerrar el dropdown primero para evitar crash de Fabric
    // cuando el Modal se desmonta mientras hay un re-render
    handleCloseDropdown()

    // Ejecutar la acción después de que el Modal se desmonte
    setTimeout(() => {
      handlers.onExecute(actionId, entityId)
    }, 50)
  }

  const handleExecuteAction = (actionId: string, entityId: string) => {
    handlers.onExecute(actionId, entityId)
  }

  // Filter handlers
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

  // Progress for counter mode
  const showCounterBar = isCounterConfig(buttonConfig) && isCounterHandlers(handlers)
  const counterProgress = showCounterBar ? handlers.getProgress() : null
  const counterLabel = showCounterBar ? handlers.getProgressLabel() : ''
  const counterOnComplete = showCounterBar ? handlers.onComplete : undefined

  // Get action state for dropdown
  const getDropdownActionState = (actionId: string) => {
    if (!dropdownEntityId || !handlers.getActionState) {
      return {}
    }
    return handlers.getActionState(actionId, dropdownEntityId)
  }

  // Dropdown entity info
  const dropdownEntity = dropdownEntityId ? findEntity(dropdownEntityId) : null
  const dropdownGroups = isDropdownConfig(buttonConfig)
    ? (buttonConfig as DropdownButtonConfig).groups
    : []

  const hasFiltersActive = hasActiveFilters(appliedFilterState)

  // ============================================================================
  // Filter View
  // ============================================================================

  if (showFilters) {
    return (
      <EntityFilterView
        config={filterConfig}
        entities={entities}
        filterState={pendingFilterState}
        onFilterChange={handlePendingFilterChange}
        onApply={handleApplyFilters}
        onCancel={handleCancelFilters}
        contextContent={filterContextContent}
      />
    )
  }

  // ============================================================================
  // List View
  // ============================================================================

  const listBottomPadding = showCounterBar ? COUNTER_BAR_HEIGHT + 16 : 0

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={filteredEntities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: listBottomPadding }}
        renderItem={({ item }) => (
          <EntityRowWithMenu
            id={item.id}
            name={item.name}
            description={item.description}
            metaLine={getMetaLine?.(item)}
            badge={getBadge?.(item)}
            image={(item as any).image}
            color={textColor}
            placeholderColor={placeholderColor}
            accentColor={accentColor}
            buttonConfig={buttonConfig}
            onPress={handleEntityPress}
            onOpenDropdown={handleOpenDropdown}
            onExecuteAction={handleExecuteAction}
            getActionState={handlers.getActionState}
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
                  placeholder={searchPlaceholder}
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
                    backgroundColor={hasFiltersActive ? accentColor : '$uiBackgroundColor'}
                    paddingHorizontal={14}
                    paddingVertical={10}
                    borderRadius={10}
                    borderWidth={1}
                    borderColor={hasFiltersActive ? accentColor : '$borderColor'}
                    alignItems="center"
                    gap={6}
                    opacity={pressed ? 0.7 : 1}
                  >
                    <FontAwesome6
                      name="sliders"
                      size={14}
                      color={hasFiltersActive ? '#FFFFFF' : placeholderColor}
                    />
                    <Text
                      fontSize={14}
                      fontWeight="500"
                      color={hasFiltersActive ? '#FFFFFF' : '$placeholderColor'}
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
              {filteredEntities.length === 1 ? resultLabelSingular : resultLabelPlural}
            </Text>
          </YStack>
        }
        ListEmptyComponent={
          <Text color="$placeholderColor" textAlign="center" paddingVertical={32}>
            {searchQuery ? emptySearchText : emptyText}
          </Text>
        }
      />

      {/* Dropdown sheet (shared for all rows) */}
      <ActionDropdownSheet
        visible={dropdownEntityId !== null}
        onClose={handleCloseDropdown}
        entityName={dropdownEntity?.name ?? ''}
        groups={dropdownGroups}
        accentColor={accentColor}
        placeholderColor={placeholderColor}
        getActionState={getDropdownActionState}
        onSelectAction={handleSelectDropdownAction}
      />

      {/* Counter bar (for CGE mode) */}
      {showCounterBar && counterProgress && (
        <CounterBar
          current={counterProgress.current}
          max={counterProgress.max}
          label={counterLabel}
          accentColor={accentColor}
          onComplete={counterOnComplete}
        />
      )}
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
