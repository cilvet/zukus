import { YStack, XStack, Text } from 'tamagui'
import { Pressable } from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'
import {
  useCharacterStore,
  useCharacterAttacks,
  useInventoryState,
  useComputedEntities,
  usePrimaryCGE,
  useTheme,
  AttacksSection,
  InventoryList,
  InventoryHeader,
  EntityTypeGroup,
} from '../../../ui'
import { CGETabView } from '../../../components/character'
import { TabEmptyState, type TabItem } from '../../../components/layout'
import { getCGELabel } from './utils'
import type { ComputedEntity } from '@zukus/core'

type TabsBuilderProps = {
  onAttackPress: (attack: { weaponUniqueId?: string; name: string }) => void
  onEntityPress: (entity: ComputedEntity) => void
  onInventoryItemPress: (instanceId: string, itemName: string) => void
  onOpenItemBrowser: () => void
  onOpenCurrencyEdit: () => void
}

export function useTabsBuilder({
  onAttackPress,
  onEntityPress,
  onInventoryItemPress,
  onOpenItemBrowser,
  onOpenCurrencyEdit,
}: TabsBuilderProps): TabItem[] {
  const attackData = useCharacterAttacks()
  const inventoryState = useInventoryState()
  const computedEntities = useComputedEntities()
  const primaryCGE = usePrimaryCGE()
  const toggleInventoryEquipped = useCharacterStore((state) => state.toggleInventoryEquipped)
  const { themeInfo } = useTheme()

  const entitiesByType = (() => {
    const groups: Record<string, ComputedEntity[]> = {}
    for (const entity of computedEntities) {
      const type = entity.entityType
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(entity)
    }
    return groups
  })()

  const entityTypes = Object.keys(entitiesByType).sort()
  const cgeLabel = primaryCGE ? getCGELabel(primaryCGE.entityType) : ''

  const tabs: TabItem[] = []

  // Attacks tab
  if (attackData && attackData.attacks.length > 0) {
    tabs.push({
      id: 'attacks',
      label: 'Attacks',
      badge: attackData.attacks.length,
      content: (
        <AttacksSection
          attacks={attackData.attacks}
          onAttackPress={onAttackPress}
        />
      ),
    })
  }

  // CGE/Spells tab
  if (primaryCGE) {
    tabs.push({
      id: 'spells',
      label: cgeLabel,
      content: <CGETabView cge={primaryCGE} />,
    })
  }

  // Inventory tab
  tabs.push({
    id: 'inventory',
    label: 'Inventory',
    badge: inventoryState.items.length,
    content: (
      <YStack gap={16}>
        <XStack justifyContent="space-between" alignItems="center">
          <InventoryHeader
            currentWeight={inventoryState.items.reduce((total, item) => {
              const weight = item.entity?.weight
              if (typeof weight === 'number') {
                return total + weight * item.quantity
              }
              return total
            }, 0)}
            maxWeight={100}
            currencies={inventoryState.currencies}
            onCurrenciesPress={onOpenCurrencyEdit}
          />
          <Pressable onPress={onOpenItemBrowser} hitSlop={8}>
            {({ pressed }) => (
              <XStack
                backgroundColor={themeInfo.colors.accent}
                paddingHorizontal={10}
                paddingVertical={6}
                borderRadius={6}
                alignItems="center"
                gap={4}
                opacity={pressed ? 0.7 : 1}
              >
                <FontAwesome6 name="plus" size={12} color="#FFFFFF" />
                <Text fontSize={12} fontWeight="600" color="#FFFFFF">
                  Add
                </Text>
              </XStack>
            )}
          </Pressable>
        </XStack>
        {inventoryState.items.length === 0 ? (
          <TabEmptyState message="No items in inventory." />
        ) : (
          <InventoryList
            items={inventoryState.items}
            onItemPress={(item) => {
              const name = item.customName ?? item.entity?.name ?? item.itemId
              onInventoryItemPress(item.instanceId, name)
            }}
            onToggleEquipped={(item) => toggleInventoryEquipped(item.instanceId)}
          />
        )}
      </YStack>
    ),
  })

  // Entities/Feats tab
  if (computedEntities.length > 0) {
    tabs.push({
      id: 'feats',
      label: 'Feats & Abilities',
      badge: computedEntities.length,
      content: (
        <YStack gap={16}>
          {entityTypes.map((entityType) => (
            <EntityTypeGroup
              key={entityType}
              entityType={entityType}
              entities={entitiesByType[entityType]}
              onEntityPress={onEntityPress}
            />
          ))}
        </YStack>
      ),
    })
  }

  return tabs
}
