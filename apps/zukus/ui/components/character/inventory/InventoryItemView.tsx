import { Pressable } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import type { InventoryItemInstance } from '@zukus/core'
import { Checkbox } from '../../../atoms'
import {
  isItemEquipped,
  isItemWielded,
  isItemActive,
} from '@zukus/core'

export type InventoryLayout = 'compact' | 'balanced' | 'detailed'

type InventoryItemViewProps = {
  item: InventoryItemInstance
  layout: InventoryLayout
  onPress?: () => void
  onToggleEquipped?: () => void
}

function getItemName(item: InventoryItemInstance): string {
  return item.customName ?? item.entity?.name ?? item.itemId
}

function getItemType(item: InventoryItemInstance): string {
  return item.entityType.replace(/_/g, ' ')
}

function getWeightText(item: InventoryItemInstance): string | null {
  const weight = item.entity?.weight
  if (typeof weight !== 'number') return null
  const totalWeight = weight * item.quantity
  return `${totalWeight} lb`
}

function getCostText(item: InventoryItemInstance): string | null {
  const cost = item.entity?.cost
  if (!cost) return null

  if (typeof cost === 'number') {
    return `${cost} gp`
  }

  if (typeof cost === 'object' && 'amount' in cost && 'currency' in cost) {
    return `${cost.amount} ${cost.currency}`
  }

  return null
}

function getQuantityText(quantity: number): string | null {
  if (quantity <= 1) return null
  return `x${quantity}`
}

function ItemImagePlaceholder({ size, label }: { size: number; label: string }) {
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={6}
      backgroundColor="$backgroundHover"
      borderWidth={1}
      borderColor="$borderColor"
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize={10} color="$placeholderColor">
        {label}
      </Text>
    </YStack>
  )
}

function StatusIndicators({ item }: { item: InventoryItemInstance }) {
  const equipped = isItemEquipped(item)
  const wielded = isItemWielded(item)
  const active = isItemActive(item)

  if (!equipped && !wielded && !active) return null

  return (
    <XStack gap={4}>
      {equipped && (
        <YStack
          paddingVertical={2}
          paddingHorizontal={6}
          borderRadius={4}
          backgroundColor="$blue4"
        >
          <Text fontSize={9} color="$blue10" fontWeight="600">
            EQ
          </Text>
        </YStack>
      )}
      {wielded && (
        <YStack
          paddingVertical={2}
          paddingHorizontal={6}
          borderRadius={4}
          backgroundColor="$orange4"
        >
          <Text fontSize={9} color="$orange10" fontWeight="600">
            WD
          </Text>
        </YStack>
      )}
      {active && (
        <YStack
          paddingVertical={2}
          paddingHorizontal={6}
          borderRadius={4}
          backgroundColor="$green4"
        >
          <Text fontSize={9} color="$green10" fontWeight="600">
            ON
          </Text>
        </YStack>
      )}
    </XStack>
  )
}

function ItemShell({
  onPress,
  rightSlot,
  children,
  padding = 10,
}: {
  onPress?: () => void
  rightSlot?: React.ReactNode
  children: React.ReactNode
  padding?: number
}) {
  return (
    <XStack
      padding={padding}
      backgroundColor="$uiBackgroundColor"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius={6}
      alignItems="center"
      gap={8}
    >
      <Pressable onPress={onPress} style={{ flex: 1 }}>
        {children}
      </Pressable>
      {rightSlot}
    </XStack>
  )
}

function EquipToggle({
  item,
  onToggleEquipped,
}: {
  item: InventoryItemInstance
  onToggleEquipped?: () => void
}) {
  // Only show toggle if the entity supports equipped
  const hasEquipped = item.entity && 'equipped' in item.entity
  if (!hasEquipped) return null

  return (
    <Checkbox
      checked={isItemEquipped(item)}
      onCheckedChange={() => onToggleEquipped?.()}
      size="small"
      variant="diamond"
    />
  )
}

function CompactLayout({ item, onPress, onToggleEquipped }: InventoryItemViewProps) {
  "use no memo"
  const name = getItemName(item)
  const typeLabel = getItemType(item).slice(0, 3).toUpperCase()
  const weightText = getWeightText(item)
  const quantityText = getQuantityText(item.quantity)

  return (
    <ItemShell
      onPress={onPress}
      rightSlot={
        <YStack alignItems="flex-end" gap={4}>
          <EquipToggle item={item} onToggleEquipped={onToggleEquipped} />
          {weightText ? (
            <Text fontSize={10} color="$placeholderColor">
              {weightText}
            </Text>
          ) : null}
        </YStack>
      }
      padding={8}
    >
      <XStack alignItems="center" gap={8}>
        <ItemImagePlaceholder size={28} label={typeLabel} />
        <YStack gap={2} flex={1}>
          <XStack gap={6} alignItems="center">
            <Text fontSize={13} fontWeight="600" color="$color" numberOfLines={1} flex={1}>
              {name}
            </Text>
            {quantityText ? (
              <Text fontSize={11} color="$placeholderColor">
                {quantityText}
              </Text>
            ) : null}
          </XStack>
          <StatusIndicators item={item} />
        </YStack>
      </XStack>
    </ItemShell>
  )
}

function BalancedLayout({ item, onPress, onToggleEquipped }: InventoryItemViewProps) {
  "use no memo"
  const name = getItemName(item)
  const typeLabel = getItemType(item)
  const typeLabelShort = typeLabel.slice(0, 3).toUpperCase()
  const weightText = getWeightText(item)
  const costText = getCostText(item)
  const quantityText = getQuantityText(item.quantity)

  return (
    <ItemShell
      onPress={onPress}
      rightSlot={
        <YStack alignItems="flex-end" gap={4}>
          <EquipToggle item={item} onToggleEquipped={onToggleEquipped} />
          {weightText ? (
            <Text fontSize={10} color="$placeholderColor">
              {weightText}
            </Text>
          ) : null}
          {costText ? (
            <Text fontSize={10} color="$placeholderColor">
              {costText}
            </Text>
          ) : null}
        </YStack>
      }
    >
      <XStack alignItems="center" gap={10}>
        <ItemImagePlaceholder size={36} label={typeLabelShort} />
        <YStack gap={4} flex={1}>
          <XStack gap={6} alignItems="center">
            <Text fontSize={14} fontWeight="700" color="$color" numberOfLines={1} flex={1}>
              {name}
            </Text>
            {quantityText ? (
              <Text fontSize={12} color="$placeholderColor">
                {quantityText}
              </Text>
            ) : null}
          </XStack>
          <Text fontSize={11} color="$placeholderColor" textTransform="uppercase">
            {typeLabel}
          </Text>
          <StatusIndicators item={item} />
        </YStack>
      </XStack>
    </ItemShell>
  )
}

function DetailedLayout({ item, onPress, onToggleEquipped }: InventoryItemViewProps) {
  "use no memo"
  const name = getItemName(item)
  const typeLabel = getItemType(item)
  const typeLabelShort = typeLabel.slice(0, 3).toUpperCase()
  const weightText = getWeightText(item)
  const costText = getCostText(item)
  const quantityText = getQuantityText(item.quantity)
  const description = item.entity?.description

  return (
    <YStack
      padding={12}
      backgroundColor="$uiBackgroundColor"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius={8}
      gap={12}
    >
      <XStack alignItems="center" gap={10}>
        <ItemImagePlaceholder size={44} label={typeLabelShort} />
        <Pressable onPress={onPress} style={{ flex: 1 }}>
          <YStack gap={4}>
            <XStack gap={6} alignItems="center">
              <Text fontSize={16} fontWeight="700" color="$color" flex={1}>
                {name}
              </Text>
              {quantityText ? (
                <Text fontSize={13} color="$placeholderColor">
                  {quantityText}
                </Text>
              ) : null}
            </XStack>
            <Text fontSize={11} color="$placeholderColor" textTransform="uppercase">
              {typeLabel}
            </Text>
          </YStack>
        </Pressable>
        <EquipToggle item={item} onToggleEquipped={onToggleEquipped} />
      </XStack>

      <StatusIndicators item={item} />

      {description ? (
        <Text fontSize={12} color="$placeholderColor" numberOfLines={2}>
          {description}
        </Text>
      ) : null}

      {(weightText || costText) ? (
        <XStack gap={12}>
          {weightText ? (
            <Text fontSize={11} color="$placeholderColor">
              Weight: {weightText}
            </Text>
          ) : null}
          {costText ? (
            <Text fontSize={11} color="$placeholderColor">
              Cost: {costText}
            </Text>
          ) : null}
        </XStack>
      ) : null}
    </YStack>
  )
}

export function InventoryItemView(props: InventoryItemViewProps) {
  "use no memo"
  const { layout } = props

  if (layout === 'compact') {
    return <CompactLayout {...props} />
  }

  if (layout === 'balanced') {
    return <BalancedLayout {...props} />
  }

  return <DetailedLayout {...props} />
}
