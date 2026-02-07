import {
  useCharacterStore,
  useCompendiumContext,
  useCurrencies,
} from '../../../ui'
import { useNavigateToDetail } from '../../../navigation'
import type { FilterState } from '@zukus/core'
import {
  itemFilterConfig,
  ITEM_ENTITY_TYPES,
  ITEM_TYPE_LABELS,
  getLocalizedEntity,
  type LocalizationContext,
} from '@zukus/core'
import { useActiveLocale } from '../../../ui/stores/translationStore'
import { EntitySelectionView } from '../../entitySelection'
import type { ActionHandlers, ActionResult, ActionState } from '../../entityBrowser/types'
import {
  formatCost,
  getAllItems,
  getInitialFilterOverrides,
  type EnrichedItem,
} from './itemBrowserUtils'

// ============================================================================
// Types
// ============================================================================

type ItemBrowserPanelProps = {
  /**
   * Optional: Pre-selected entity types to filter by.
   */
  defaultEntityTypes?: string[]
  /**
   * Optional callback when an item is added.
   */
  onItemAdded?: (instanceId: string) => void
}

// ============================================================================
// Main Component
// ============================================================================

export function ItemBrowserPanel({ defaultEntityTypes, onItemAdded }: ItemBrowserPanelProps) {
  'use no memo'

  const compendium = useCompendiumContext()
  const addToInventory = useCharacterStore((state) => state.addToInventory)
  const spendCurrency = useCharacterStore((state) => state.spendCurrency)
  const currencies = useCurrencies()
  const navigateToDetail = useNavigateToDetail()
  const locale = useActiveLocale()

  // Get all items from all item entity types
  const allItems = getAllItems(compendium, ITEM_ENTITY_TYPES)

  // Initial filter overrides
  const initialFilterOverrides = getInitialFilterOverrides(defaultEntityTypes)

  // Helper to check if can afford item
  const canAfford = (item: EnrichedItem): boolean => {
    if (!item.cost) return true

    const { amount, currency } = item.cost
    const currentAmount = currencies[currency] ?? 0
    return currentAmount >= amount
  }

  // Helper for localized entity name
  const localizedName = (entity: EnrichedItem): string => {
    const ctx: LocalizationContext = { locale, compendiumLocale: 'en' }
    return getLocalizedEntity(entity, ctx).name
  }

  // Action handlers - plain object, no useMemo needed with 'use no memo'
  const handlers: ActionHandlers = {
    onExecute: (actionId: string, entityId: string): ActionResult => {
      const entity = allItems.find((e) => e.id === entityId)
      if (!entity) {
        console.warn('Entity not found:', entityId)
        return { success: false }
      }

      if (actionId === 'add') {
        // Add free - just add to inventory
        const result = addToInventory({
          itemId: entityId,
          entityType: entity.entityType,
          quantity: 1,
          entity: entity,
        })

        if (!result.success) {
          console.warn('Failed to add item:', result.error)
          return { success: false }
        }

        onItemAdded?.(result.instanceId ?? '')

        return {
          success: true,
          shouldClose: false,
          toastMessage: `Has anadido ${localizedName(entity)}`,
        }
      }

      if (actionId === 'buy') {
        // Buy - check cost and deduct
        if (!entity.cost) {
          // No cost, treat as free
          const result = addToInventory({
            itemId: entityId,
            entityType: entity.entityType,
            quantity: 1,
            entity: entity,
          })

          if (!result.success) {
            return { success: false }
          }

          onItemAdded?.(result.instanceId ?? '')
          return {
            success: true,
            shouldClose: false,
            toastMessage: `Has anadido ${localizedName(entity)}`,
          }
        }

        // Check if can afford
        if (!canAfford(entity)) {
          return { success: false }
        }

        // Spend currency first
        const spendResult = spendCurrency(entity.cost.currency, entity.cost.amount)
        if (!spendResult.success) {
          console.warn('Failed to spend currency:', spendResult.error)
          return { success: false }
        }

        // Then add item
        const addResult = addToInventory({
          itemId: entityId,
          entityType: entity.entityType,
          quantity: 1,
          entity: entity,
        })

        if (!addResult.success) {
          console.warn('Failed to add item:', addResult.error)
          return { success: false }
        }

        onItemAdded?.(addResult.instanceId ?? '')

        return {
          success: true,
          shouldClose: false,
          toastMessage: `Has comprado ${localizedName(entity)}`,
        }
      }

      return { success: false }
    },

    getActionState: (actionId: string, entityId: string): ActionState => {
      const entity = allItems.find((e) => e.id === entityId)
      if (!entity) return {}

      if (actionId === 'buy') {
        const costText = formatCost(entity.cost)
        const affordable = canAfford(entity)

        return {
          subtext: costText ?? 'Sin coste',
          disabled: entity.cost ? !affordable : false,
        }
      }

      return {}
    },
  }

  // Navigate to entity detail
  const handleEntityPress = (entity: EnrichedItem) => {
    navigateToDetail('compendiumEntity', entity.id, localizedName(entity))
  }

  // Get meta line for each item
  const getMetaLine = (item: EnrichedItem) => {
    const parts: string[] = []

    const typeLabel = ITEM_TYPE_LABELS[item.entityType]
    if (typeLabel) parts.push(typeLabel)

    if (item.weight !== undefined) {
      parts.push(`${item.weight} lb`)
    }

    const costText = formatCost(item.cost)
    if (costText) parts.push(costText)

    return parts.length > 0 ? parts.join(' | ') : undefined
  }

  return (
    <EntitySelectionView
      entities={allItems}
      modeConfig={{
        mode: 'dropdown',
        buttonLabel: 'Anadir',
        buttonIcon: 'plus',
        groups: [
          {
            label: 'Gratis',
            actions: [{ id: 'add', label: 'Anadir al inventario', icon: 'box-open' }],
          },
          {
            label: 'Comercio',
            actions: [{ id: 'buy', label: 'Comprar', icon: 'coins' }],
          },
        ],
        handlers,
      }}
      filterConfig={itemFilterConfig}
      initialFilterOverrides={initialFilterOverrides}
      onEntityPress={handleEntityPress}
      getMetaLine={getMetaLine}
      searchPlaceholder="Buscar items..."
      emptyText="No hay items disponibles con estos filtros."
      emptySearchText="No se encontraron items."
      resultLabelSingular="item"
      resultLabelPlural="items"
    />
  )
}
