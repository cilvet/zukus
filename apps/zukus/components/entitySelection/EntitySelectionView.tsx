import { View, Pressable, StyleSheet } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack, XStack, Text } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { useState } from 'react'
import { useTheme } from '../../ui'
import { EntityFilterView, ActiveFilterChips } from '../filters'
import { EntityRowWithMenu, ENTITY_ROW_HEIGHT } from '../entityBrowser/EntityRowWithMenu'
import {
  ActionDropdownSheet,
  CounterBar,
  COUNTER_BAR_HEIGHT,
} from '../entityBrowser/actions'
import type {
  ButtonConfig,
  DropdownButtonConfig,
} from '../entityBrowser/types'
import { isDropdownConfig, isCounterConfig, isCounterHandlers } from '../entityBrowser/types'
import { filterBySearch, hasActiveFilters, createFilterStateWithOverrides } from '../entityBrowser/utils'
import { SearchBar } from './SearchBar'
import { SelectionHeader } from './SelectionHeader'
import { SelectionRow, SELECTION_ROW_HEIGHT } from './SelectionRow'
import { SelectionBar, SELECTION_BAR_HEIGHT } from './SelectionBar'
import type { EntitySelectionViewProps, ModeConfig, SelectionModeConfig } from './types'
import { isDropdownMode, isCounterMode, isSelectionMode, isBrowseMode } from './types'
import type { StandardEntity, FilterState, FilterValue, EntityFilterConfig } from '@zukus/core'
import { applyFilterConfig, createInitialFilterState } from '@zukus/core'
import { useLocalizedEntities } from '../../ui/hooks/useLocalizedEntity'

// ============================================================================
// Helpers
// ============================================================================

/**
 * Build a ButtonConfig from the ModeConfig for EntityRowWithMenu.
 * Selection mode in large lists uses a counter-style button labeled "Seleccionar".
 */
function buildButtonConfig(modeConfig: ModeConfig): ButtonConfig | null {
  if (isBrowseMode(modeConfig)) {
    return null
  }

  if (isDropdownMode(modeConfig)) {
    return {
      type: 'dropdown',
      label: modeConfig.buttonLabel,
      icon: modeConfig.buttonIcon,
      groups: modeConfig.groups,
    }
  }

  if (isCounterMode(modeConfig)) {
    return {
      type: 'counter',
      action: modeConfig.action,
      closeOnComplete: modeConfig.closeOnComplete,
    }
  }

  // Selection mode (large) - use counter-style button
  return {
    type: 'counter',
    action: { id: 'select', label: 'Seleccionar', icon: 'check' },
  }
}

const PICKER_ROW_HEIGHT = 56

// ============================================================================
// Component
// ============================================================================

export function EntitySelectionView<T extends StandardEntity>({
  entities: rawEntities,
  modeConfig,
  onEntityPress,
  filterConfig,
  initialFilterOverrides,
  customFilter,
  getMetaLine,
  getBadge,
  searchPlaceholder = 'Buscar...',
  emptyText = 'No hay elementos disponibles.',
  emptySearchText = 'No se encontraron resultados.',
  resultLabelSingular = 'resultado',
  resultLabelPlural = 'resultados',
  filterContextContent,
}: EntitySelectionViewProps<T>) {
  'use no memo'

  const entities = useLocalizedEntities(rawEntities) as T[]
  const { themeColors, themeInfo } = useTheme()
  const insets = useSafeAreaInsets()

  // ============================================================================
  // Filter State
  // ============================================================================

  const [appliedFilterState, setAppliedFilterState] = useState<FilterState>(() => {
    if (!filterConfig) return {}
    return createFilterStateWithOverrides(filterConfig, initialFilterOverrides)
  })
  const [pendingFilterState, setPendingFilterState] = useState<FilterState>(() => {
    if (!filterConfig) return {}
    return createFilterStateWithOverrides(filterConfig, initialFilterOverrides)
  })

  // View state
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownEntityId, setDropdownEntityId] = useState<string | null>(null)

  // Primitive colors
  const textColor = themeColors.color
  const placeholderColor = themeColors.placeholderColor
  const accentColor = themeInfo.colors.accent

  // ============================================================================
  // Mode-derived values
  // ============================================================================

  const isSelection = isSelectionMode(modeConfig)
  const isInstantSelect = isSelection && !!modeConfig.instantSelect
  const isSmallSelection = isSelection && !isInstantSelect && entities.length <= 15
  const isBrowse = isBrowseMode(modeConfig)
  const showSearchBar = isBrowse || entities.length > 15 || !!filterConfig

  // Max reached for selection mode (used for disabling rows/buttons)
  const isMaxReached = isSelection && !modeConfig.instantSelect && modeConfig.max !== 1 && modeConfig.selectedEntities.length >= modeConfig.max

  // ============================================================================
  // Filtering
  // ============================================================================

  const filteredByConfig = (() => {
    if (customFilter) {
      return customFilter(entities, appliedFilterState)
    }
    if (filterConfig) {
      return applyFilterConfig(entities, filterConfig, appliedFilterState)
    }
    return entities
  })()

  const filteredEntities = filterBySearch(filteredByConfig, searchQuery)

  // ============================================================================
  // Selection mode: build combined data for small lists
  // ============================================================================

  type SelectionItem = {
    entity: T
    isSelected: boolean
    instanceId?: string
    disabled: boolean
    showEligibilityBadge: boolean
  }

  let selectionItems: SelectionItem[] | null = null

  if (isSelection && isSmallSelection) {
    const selectedIds = new Set(
      modeConfig.selectedEntities.map((inst) => inst.entity.id)
    )
    const eligibilityMap = new Map(
      modeConfig.eligibleEntities.map((fr) => [fr.entity.id, fr])
    )
    const instanceMap = new Map(
      modeConfig.selectedEntities.map((inst) => [inst.entity.id, inst.instanceId])
    )

    // Selected first, then available
    const selected: SelectionItem[] = []
    const available: SelectionItem[] = []

    for (const entity of filteredEntities) {
      const fr = eligibilityMap.get(entity.id)
      const isEntitySelected = selectedIds.has(entity.id)

      const item: SelectionItem = {
        entity,
        isSelected: isEntitySelected,
        instanceId: instanceMap.get(entity.id),
        disabled: false,
        showEligibilityBadge: fr ? !fr.matches : false,
      }

      // Disable if not eligible
      if (fr && !fr.matches) {
        item.disabled = true
      }

      // Disable if max reached and not already selected (skip for single-select = radio behavior)
      if (!isEntitySelected && modeConfig.selectedEntities.length >= modeConfig.max && modeConfig.max !== 1) {
        item.disabled = true
      }

      if (isEntitySelected) {
        selected.push(item)
      } else {
        available.push(item)
      }
    }

    selectionItems = [...selected, ...available]
  }

  // ============================================================================
  // Selection mode: data for large lists
  // ============================================================================

  let largeSelectionEntities: T[] | null = null

  if (isSelection && !isSmallSelection && !isInstantSelect) {
    const selectedIds = new Set(
      modeConfig.selectedEntities.map((inst) => inst.entity.id)
    )
    // Filter out already selected entities
    largeSelectionEntities = filteredEntities.filter((e) => !selectedIds.has(e.id))
  }

  // Pre-compute selected IDs for instantSelect mode
  const instantSelectIds = isInstantSelect
    ? new Set(modeConfig.selectedEntities.map((inst) => inst.entity.id))
    : null

  // ============================================================================
  // Handlers
  // ============================================================================

  const findEntity = (entityId: string) => entities.find((e) => e.id === entityId)

  const handleEntityPress = (entityId: string) => {
    const entity = findEntity(entityId)
    if (entity) onEntityPress(entity)
  }

  const handleOpenDropdown = (entityId: string) => setDropdownEntityId(entityId)
  const handleCloseDropdown = () => setDropdownEntityId(null)

  const handleSelectDropdownAction = (actionId: string) => {
    if (!dropdownEntityId || !isDropdownMode(modeConfig)) return
    const entityId = dropdownEntityId
    handleCloseDropdown()
    setTimeout(() => {
      modeConfig.handlers.onExecute(actionId, entityId)
    }, 50)
  }

  const handleExecuteAction = (actionId: string, entityId: string) => {
    if (isDropdownMode(modeConfig)) {
      modeConfig.handlers.onExecute(actionId, entityId)
    } else if (isCounterMode(modeConfig)) {
      modeConfig.handlers.onExecute(actionId, entityId)
    } else if (isSelectionMode(modeConfig)) {
      // Radio behavior: auto-deselect current when max=1
      if (modeConfig.max === 1 && modeConfig.selectedEntities.length > 0) {
        const current = modeConfig.selectedEntities[0]!
        modeConfig.onDeselect(current.instanceId)
      }
      modeConfig.onSelect(entityId)
    }
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

  const handleCancelFilters = () => setShowFilters(false)

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

  // Selection row toggle
  const handleSelectionToggle = (entityId: string, checked: boolean) => {
    if (!isSelectionMode(modeConfig)) return

    if (checked) {
      // Radio behavior: auto-deselect current when max=1
      if (modeConfig.max === 1 && modeConfig.selectedEntities.length > 0) {
        const current = modeConfig.selectedEntities[0]!
        modeConfig.onDeselect(current.instanceId)
      }
      modeConfig.onSelect(entityId)
    } else {
      // Find the instanceId for this entity
      const instance = modeConfig.selectedEntities.find(
        (inst) => inst.entity.id === entityId
      )
      if (instance) {
        modeConfig.onDeselect(instance.instanceId)
      }
    }
  }

  // ============================================================================
  // Derived state for rendering
  // ============================================================================

  const hasFiltersActive = hasActiveFilters(appliedFilterState)

  // Counter bar
  const showCounterBar = isCounterMode(modeConfig) && isCounterHandlers(modeConfig.handlers)
  const counterProgress = showCounterBar ? modeConfig.handlers.getProgress() : null
  const counterLabel = showCounterBar ? modeConfig.handlers.getProgressLabel() : ''
  const counterOnComplete = showCounterBar ? modeConfig.handlers.onComplete : undefined

  // Selection bar
  const showSelectionBar = isSelection && modeConfig.selectedEntities.length > 0

  // Dropdown
  const dropdownEntity = dropdownEntityId ? findEntity(dropdownEntityId) : null
  const dropdownGroups = isDropdownMode(modeConfig) ? modeConfig.groups : []
  const getDropdownActionState = (actionId: string) => {
    if (!dropdownEntityId || !isDropdownMode(modeConfig) || !modeConfig.handlers.getActionState) {
      return {}
    }
    return modeConfig.handlers.getActionState(actionId, dropdownEntityId)
  }

  // Get action state for rows (for dropdown/counter modes)
  const getRowActionState = (() => {
    if (isDropdownMode(modeConfig) && modeConfig.handlers.getActionState) {
      return modeConfig.handlers.getActionState
    }
    if (isCounterMode(modeConfig) && modeConfig.handlers.getActionState) {
      return modeConfig.handlers.getActionState
    }
    return undefined
  })()

  // ButtonConfig for EntityRowWithMenu
  const buttonConfig = buildButtonConfig(modeConfig)

  // ============================================================================
  // Filter View
  // ============================================================================

  if (showFilters && filterConfig) {
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

  const safeBottom = insets.bottom || 8
  const listBottomPadding = showCounterBar
    ? COUNTER_BAR_HEIGHT + safeBottom + 16
    : showSelectionBar
      ? SELECTION_BAR_HEIGHT + safeBottom + 16
      : safeBottom

  // Determine which data array and renderItem to use
  const useSelectionRows = isSelection && isSmallSelection && selectionItems
  const useInstantSelect = isInstantSelect

  const listData = useInstantSelect
    ? filteredEntities
    : useSelectionRows
      ? selectionItems
      : isSelection && !isSmallSelection && largeSelectionEntities
        ? largeSelectionEntities
        : filteredEntities

  const displayCount = isSelection && !isSmallSelection && !isInstantSelect
    ? filteredEntities.length // Show total count, not just non-selected
    : listData.length

  return (
    <View style={{ flex: 1 }}>
      {/* Sticky header - outside FlashList */}
      <YStack padding={16} gap={12}>
        {/* Selection header */}
        {isSelection && !isInstantSelect && (
          <SelectionHeader
            label={modeConfig.selectionLabel ?? 'Seleccion'}
            current={modeConfig.selectedEntities.length}
            max={modeConfig.max}
            min={modeConfig.min}
          />
        )}

        {/* Search bar + Filter button */}
        {showSearchBar && (
          <XStack gap={8} alignItems="center">
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={searchPlaceholder}
              textColor={textColor}
              placeholderColor={placeholderColor}
            />

            {filterConfig && (
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
            )}
          </XStack>
        )}

        {/* Applied filter chips */}
        {filterConfig && (
          <ActiveFilterChips
            config={filterConfig}
            filterState={appliedFilterState}
            onClearFilter={handleClearFilter}
            onClearAll={handleClearAllFilters}
          />
        )}
      </YStack>

      {/* FlashList - takes remaining space */}
      <FlashList
        style={{ flex: 1 }}
        data={listData}
        keyExtractor={(item) => {
          if (useSelectionRows) {
            return (item as SelectionItem).entity.id
          }
          return (item as T).id
        }}
        estimatedItemSize={useInstantSelect ? PICKER_ROW_HEIGHT : useSelectionRows ? SELECTION_ROW_HEIGHT : ENTITY_ROW_HEIGHT}
        contentContainerStyle={{ paddingBottom: listBottomPadding }}
        renderItem={({ item }) => {
          if (useInstantSelect) {
            const entity = item as T
            return (
              <Pressable onPress={() => (modeConfig as SelectionModeConfig).onSelect(entity.id)}>
                {({ pressed }) => (
                  <XStack
                    height={PICKER_ROW_HEIGHT}
                    alignItems="center"
                    paddingHorizontal={16}
                    gap={12}
                    opacity={pressed ? 0.6 : 1}
                    borderBottomWidth={StyleSheet.hairlineWidth}
                    borderBottomColor="$borderColor"
                  >
                    <YStack flex={1} gap={2}>
                      <Text fontSize={15} fontWeight="500" color="$color" numberOfLines={1}>
                        {entity.name}
                      </Text>
                      {entity.description && (
                        <Text fontSize={12} color="$placeholderColor" numberOfLines={1}>
                          {entity.description}
                        </Text>
                      )}
                    </YStack>
                    {instantSelectIds!.has(entity.id) && (
                      <FontAwesome6 name="check" size={16} color={accentColor} />
                    )}
                  </XStack>
                )}
              </Pressable>
            )
          }

          if (useSelectionRows) {
            const selItem = item as SelectionItem
            return (
              <SelectionRow
                id={selItem.entity.id}
                name={selItem.entity.name}
                description={selItem.entity.description}
                badge={getBadge?.(selItem.entity) ?? undefined}
                isSelected={selItem.isSelected}
                disabled={selItem.disabled}
                showEligibilityBadge={selItem.showEligibilityBadge}
                onToggle={handleSelectionToggle}
              />
            )
          }

          const entity = item as T
          return (
            <EntityRowWithMenu
              id={entity.id}
              name={entity.name}
              description={entity.description}
              metaLine={getMetaLine?.(entity)}
              badge={getBadge?.(entity)}
              image={(entity as any).image}
              color={textColor}
              placeholderColor={placeholderColor}
              accentColor={accentColor}
              buttonConfig={buttonConfig ?? undefined}
              buttonDisabled={isMaxReached}
              onPress={handleEntityPress}
              onOpenDropdown={handleOpenDropdown}
              onExecuteAction={handleExecuteAction}
              getActionState={getRowActionState}
            />
          )
        }}
        ListHeaderComponent={
          <YStack padding={16} gap={12}>
            {/* Results count */}
            <Text fontSize={13} color="$placeholderColor">
              {displayCount}{' '}
              {displayCount === 1 ? resultLabelSingular : resultLabelPlural}
            </Text>
          </YStack>
        }
        ListEmptyComponent={
          <Text color="$placeholderColor" textAlign="center" paddingVertical={32}>
            {searchQuery ? emptySearchText : emptyText}
          </Text>
        }
      />

      {/* Selection bar (for selection mode, not browse) */}
      {isSelection && !isInstantSelect && !isBrowseMode(modeConfig) && (
        <SelectionBar
          selectedEntities={modeConfig.selectedEntities}
          onDeselect={modeConfig.onDeselect}
          current={modeConfig.selectedEntities.length}
          max={modeConfig.max}
          min={modeConfig.min}
          label={modeConfig.selectionLabel}
          accentColor={accentColor}
          placeholderColor={placeholderColor}
        />
      )}

      {/* Dropdown sheet (shared for all rows) */}
      {isDropdownMode(modeConfig) && (
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
      )}

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
