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
} from '@zukus/core'
import {
  EntityBrowserPanel,
  type ButtonConfig,
  type ActionHandlers,
  type ActionResult,
  type ActionState,
} from '../../entityBrowser'
import {
  applyItemFilters,
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
// Button Configuration
// ============================================================================

const ITEM_BUTTON_CONFIG: ButtonConfig = {
  type: 'dropdown',
  label: 'Anadir',
  icon: 'plus',
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
          toastMessage: `Has anadido ${entity.name}`,
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
            toastMessage: `Has anadido ${entity.name}`,
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
          toastMessage: `Has comprado ${entity.name}`,
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
    navigateToDetail('compendiumEntity', entity.id, entity.name)
  }

  // Custom filter function for items
  const customFilter = (entities: EnrichedItem[], filterState: FilterState) => {
    return applyItemFilters(entities, filterState)
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
    <EntityBrowserPanel
      entities={allItems}
      filterConfig={itemFilterConfig}
      initialFilterOverrides={initialFilterOverrides}
      buttonConfig={ITEM_BUTTON_CONFIG}
      handlers={handlers}
      onEntityPress={handleEntityPress}
      customFilter={customFilter}
      getMetaLine={getMetaLine}
      searchPlaceholder="Buscar items..."
      emptyText="No hay items disponibles con estos filtros."
      emptySearchText="No se encontraron items."
      resultLabelSingular="item"
      resultLabelPlural="items"
    />
  )
}
