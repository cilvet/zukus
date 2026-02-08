import { useState } from 'react'
import { Platform, Pressable } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
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
import type { StandardEntity } from '@zukus/core'
import {
  spellFilterConfig,
  getFilterConfig,
  getLocalizedEntity,
  type EntityFilterConfig,
  type LocalizationContext,
} from '@zukus/core'
import { useActiveLocale } from '../../../ui/stores/translationStore'
import { EntitySelectionView } from '../../entitySelection'
import type { CounterHandlers, ActionResult } from '../../entityBrowser/types'
import {
  parseSelectionId,
  calculateSlotProgress,
  calculateKnownProgress,
  findNextEmptySlotIndex,
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
  const locale = useActiveLocale()

  // Parse selectionId to determine mode
  const selection = parseSelectionId(selectionId, primaryCGE?.id ?? '')
  const { mode, level: slotLevel, cgeId } = selection

  const entityType = primaryCGE?.entityType ?? 'spell'
  const defaultClassId = primaryCGE?.classId ?? 'wizard'
  const baseData = useCharacterStore((state) => state.baseData)

  // Source toggle for prepare mode when known exists (spellbook/known list)
  const hasKnown = !!primaryCGE?.config.known
  const showSourceToggle = mode === 'prepare' && hasKnown
  const [source, setSource] = useState<'known' | 'all'>('known')

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

  // Filter entities by source when in prepare mode with known
  const knownSelections = baseData?.cgeState?.[cgeId]?.knownSelections ?? {}
  const knownEntityIds = new Set<string>()
  if (showSourceToggle) {
    for (const ids of Object.values(knownSelections)) {
      for (const id of ids) {
        knownEntityIds.add(id)
      }
    }
  }

  const filteredEntities =
    showSourceToggle && source === 'known'
      ? allEntities.filter((e) => knownEntityIds.has(e.id))
      : allEntities

  // Helper to close panel
  const closePanel = () => {
    if (Platform.OS !== 'web') {
      router.back()
    } else {
      panelNav.goBack()
    }
  }

  // Calculate progress based on mode
  const isUnlimitedKnown = mode === 'known' && primaryCGE?.config.known?.type === 'UNLIMITED'
  const currentProgress =
    mode === 'known'
      ? calculateKnownProgress(primaryCGE, slotLevel)
      : calculateSlotProgress(primaryCGE, slotLevel)
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

      return {
        success: true,
        shouldClose: false,
      }
    },

    getProgress: () => currentProgress,

    getProgressLabel: () => {
      if (mode === 'known') {
        if (isUnlimitedKnown) {
          return `${currentProgress.current} en el libro`
        }
        return `${currentProgress.current} de ${currentProgress.max} aprendidos`
      }
      return `${currentProgress.current} de ${currentProgress.max} preparados`
    },

    onComplete: isUnlimitedKnown ? undefined : closePanel,
  }

  // Navigate to entity detail - plain function, no useCallback with 'use no memo'
  const handleEntityPress = (entity: EnrichedSpell) => {
    const ctx: LocalizationContext = { locale, compendiumLocale: 'en' }
    const localized = getLocalizedEntity(entity, ctx)
    navigateToDetail('compendiumEntity', entity.id, localized.name)
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

  const isKnownLabel = primaryCGE?.config.known?.type === 'UNLIMITED' ? 'Libro' : 'Conocidos'

  return (
    <YStack flex={1}>
      {showSourceToggle && (
        <XStack paddingHorizontal={16} paddingTop={8} gap={8}>
          <SourceChip
            label={isKnownLabel}
            active={source === 'known'}
            onPress={() => setSource('known')}
            accentColor={themeColors.accentColor}
          />
          <SourceChip
            label="Todos"
            active={source === 'all'}
            onPress={() => setSource('all')}
            accentColor={themeColors.accentColor}
          />
        </XStack>
      )}
      <EntitySelectionView
        entities={filteredEntities}
        modeConfig={{
          mode: 'counter',
          action: {
            id: 'prepare',
            label: mode === 'known' ? 'Aprender' : 'Preparar',
            icon: mode === 'known' ? 'book' : 'check',
          },
          handlers,
          closeOnComplete: !isUnlimitedKnown,
        }}
        filterConfig={filterConfig}
        initialFilterOverrides={initialFilterOverrides}
        onEntityPress={handleEntityPress}
        getBadge={getBadge}
        searchPlaceholder="Buscar por nombre..."
        emptyText={
          showSourceToggle && source === 'known'
            ? `No hay ${entityLabel} en tu ${isKnownLabel.toLowerCase()}. Cambia a "Todos" para ver la lista completa.`
            : `No hay ${entityLabel} disponibles para esta combinacion.`
        }
        emptySearchText="No se encontraron resultados."
        resultLabelSingular="resultado"
        resultLabelPlural="resultados"
        filterContextContent={filterContextContent}
      />
    </YStack>
  )
}

// ============================================================================
// SourceChip
// ============================================================================

type SourceChipProps = {
  label: string
  active: boolean
  onPress: () => void
  accentColor: string
}

function SourceChip({ label, active, onPress, accentColor }: SourceChipProps) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <XStack
          paddingVertical={6}
          paddingHorizontal={14}
          borderRadius={16}
          backgroundColor={active ? accentColor : '$uiBackgroundColor'}
          borderWidth={1}
          borderColor={active ? accentColor : '$borderColor'}
          opacity={pressed ? 0.7 : 1}
        >
          <Text
            fontSize={13}
            fontWeight={active ? '600' : '400'}
            color={active ? 'white' : '$color'}
          >
            {label}
          </Text>
        </XStack>
      )}
    </Pressable>
  )
}
