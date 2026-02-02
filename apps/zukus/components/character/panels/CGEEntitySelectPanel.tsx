import { Platform } from 'react-native'
import { XStack, Text } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
  usePrimaryCGE,
  useTheme,
  useCharacterStore,
  useCompendiumContext,
} from '../../../ui'
import { usePanelNavigation } from '../../../hooks'
import { useNavigateToDetail } from '../../../navigation'
import type { StandardEntity, FilterState } from '@zukus/core'
import {
  spellFilterConfig,
  getFilterConfig,
  applyRelationFilter,
  isRelationFilter,
  isFacetFilter,
  isFilterGroup,
  type EntityFilterConfig,
} from '@zukus/core'
import {
  EntityBrowserPanel,
  type ButtonConfig,
  type CounterHandlers,
  type ActionResult,
} from '../../entityBrowser'
import {
  parseSelectionId,
  calculateSlotProgress,
  findNextEmptySlotIndex,
  matchesFacetFilter,
} from './cgeUtils'

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

  const { themeColors } = useTheme()
  const primaryCGE = usePrimaryCGE()
  const compendium = useCompendiumContext()
  const prepareEntityForCGE = useCharacterStore((state) => state.prepareEntityForCGE)
  const addKnownForCGE = useCharacterStore((state) => state.addKnownForCGE)
  const panelNav = usePanelNavigation('character')
  const router = useRouter()
  const navigateToDetail = useNavigateToDetail()

  // Parse selectionId to determine mode
  const selection = parseSelectionId(selectionId, primaryCGE?.id ?? '')
  const { mode, level: slotLevel, cgeId } = selection

  const entityType = primaryCGE?.entityType ?? 'spell'
  const defaultClassId = primaryCGE?.classId ?? 'wizard'

  // Get filter configuration
  const filterConfig: EntityFilterConfig = getFilterConfig(entityType) ?? spellFilterConfig

  // Initial filter overrides - no useMemo with 'use no memo'
  const initialFilterOverrides = {
    class: defaultClassId,
    // For LIMITED_TOTAL (level -1), don't set a level filter
    level: slotLevel >= 0 ? slotLevel : null,
  }

  // All entities - no useMemo with 'use no memo'
  const allEntities = compendium.getAllEntities(entityType) as EnrichedSpell[]

  // Helper to close panel
  const closePanel = () => {
    if (Platform.OS !== 'web') {
      router.back()
    } else {
      panelNav.goBack()
    }
  }

  // Button configuration - counter type for CGE
  const buttonConfig: ButtonConfig = {
    type: 'counter' as const,
    action: {
      id: 'prepare',
      label: mode === 'known' ? 'Aprender' : 'Preparar',
      icon: mode === 'known' ? 'book' : 'check',
    },
    closeOnComplete: true,
  }

  // Custom filter function - no useCallback with 'use no memo'
  const customFilter = (entities: EnrichedSpell[], filterState: FilterState) => {
    let result = entities

    // Process each filter
    for (const filter of filterConfig.filters) {
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

    return result
  }

  // Calculate progress and next slot outside of callbacks to avoid hook issues
  // After each successful preparation, the store updates and triggers re-render,
  // which recalculates these values automatically.
  const currentProgress = calculateSlotProgress(primaryCGE, slotLevel)
  const nextEmptySlotIndex = findNextEmptySlotIndex(primaryCGE, slotLevel)

  // Counter handlers - plain object, no useMemo with 'use no memo'
  const handlers: CounterHandlers = {
    onExecute: (actionId: string, entityId: string): ActionResult => {
      const entity = allEntities.find((e) => e.id === entityId)
      if (!entity) {
        console.warn('Entity not found:', entityId)
        return { success: false }
      }

      let result

      if (mode === 'known') {
        // Add to known entities
        result = addKnownForCGE(cgeId, entity, slotLevel)
        if (!result.success) {
          console.warn('Failed to add known entity:', result.error)
          return { success: false }
        }
      } else {
        // Prepare in slot - use pre-calculated next empty slot index
        const { trackId = 'base' } = selection

        if (nextEmptySlotIndex === -1) {
          console.warn('No empty slots available at level', slotLevel)
          return { success: false }
        }

        result = prepareEntityForCGE(cgeId, slotLevel, nextEmptySlotIndex, entityId, trackId)
        if (!result.success) {
          console.warn('Failed to prepare entity:', result.error)
          return { success: false }
        }
      }

      // La vista de completado se encarga de mostrar el boton OK cuando se llega al maximo
      return {
        success: true,
        shouldClose: false,
      }
    },

    getProgress: () => currentProgress,

    getProgressLabel: () => {
      if (mode === 'known') {
        return `${currentProgress.current} aprendidos`
      }
      return `${currentProgress.current} de ${currentProgress.max} preparados`
    },

    onComplete: closePanel,
  }

  // Navigate to entity detail - plain function, no useCallback with 'use no memo'
  const handleEntityPress = (entity: EnrichedSpell) => {
    navigateToDetail('compendiumEntity', entity.id, entity.name)
  }

  // Get badge (level for selected class)
  const selectedClassId = initialFilterOverrides.class
  const getBadge = (entity: EnrichedSpell) => {
    if (!selectedClassId) return null
    const lvl = entity.classData?.classLevels[selectedClassId]
    return lvl !== undefined ? `Nv ${lvl}` : null
  }

  // Filter context content
  const filterContextContent =
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
        <FontAwesome6 name="circle-info" size={14} color={themeColors.placeholderColor} />
        <Text fontSize={13} color="$placeholderColor" flex={1}>
          {mode === 'known'
            ? `Aprendiendo ${entityType} de nivel ${slotLevel}`
            : `Preparando para slot de nivel ${slotLevel}`}
        </Text>
      </XStack>
    ) : undefined

  const entityLabel = entityType === 'spell' ? 'conjuros' : entityType === 'maneuver' ? 'maniobras' : 'entidades'

  return (
    <EntityBrowserPanel
      entities={allEntities}
      filterConfig={filterConfig}
      initialFilterOverrides={initialFilterOverrides}
      buttonConfig={buttonConfig}
      handlers={handlers}
      onEntityPress={handleEntityPress}
      customFilter={customFilter}
      getBadge={getBadge}
      searchPlaceholder="Buscar por nombre..."
      emptyText={`No hay ${entityLabel} disponibles para esta combinacion.`}
      emptySearchText="No se encontraron resultados."
      resultLabelSingular="resultado"
      resultLabelPlural="resultados"
      filterContextContent={filterContextContent}
    />
  )
}
