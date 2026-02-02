import { Pressable, View } from 'react-native'
import { YStack } from 'tamagui'
import type { InventoryItemInstance } from '@zukus/core'
import { InventoryItemView, type InventoryLayout } from './InventoryItemView'

type InventoryListProps = {
  items: InventoryItemInstance[]
  layout: InventoryLayout
  onItemPress?: (item: InventoryItemInstance) => void
  onToggleEquipped?: (item: InventoryItemInstance) => void
}

export function InventoryList({
  items,
  layout,
  onItemPress,
  onToggleEquipped,
}: InventoryListProps) {
  "use no memo"
  return (
    <YStack gap={10}>
      {items.map((item) => (
        <InventoryItemView
          key={item.instanceId}
          item={item}
          layout={layout}
          onPress={() => onItemPress?.(item)}
          onToggleEquipped={() => onToggleEquipped?.(item)}
        />
      ))}
    </YStack>
  )
}

type InventoryLayoutToggleProps = {
  layout: InventoryLayout
  onChange: (layout: InventoryLayout) => void
}

const LAYOUT_ORDER: InventoryLayout[] = ['compact', 'balanced', 'detailed']

function getNextLayout(layout: InventoryLayout): InventoryLayout {
  const index = LAYOUT_ORDER.indexOf(layout)
  const nextIndex = (index + 1) % LAYOUT_ORDER.length
  return LAYOUT_ORDER[nextIndex]
}

function CompactIcon({ color }: { color: string }) {
  return (
    <View style={{ gap: 3 }}>
      <View style={{ width: 16, height: 2, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ width: 12, height: 2, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ width: 10, height: 2, backgroundColor: color, borderRadius: 2 }} />
    </View>
  )
}

function BalancedIcon({ color }: { color: string }) {
  return (
    <View style={{ gap: 3 }}>
      <View style={{ width: 16, height: 2, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ width: 16, height: 2, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ width: 16, height: 2, backgroundColor: color, borderRadius: 2 }} />
    </View>
  )
}

function DetailedIcon({ color }: { color: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      <View style={{ width: 6, height: 14, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ width: 6, height: 14, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ width: 6, height: 14, backgroundColor: color, borderRadius: 2 }} />
    </View>
  )
}

export function InventoryLayoutToggle({ layout, onChange }: InventoryLayoutToggleProps) {
  const color = '#888'

  let icon = <BalancedIcon color={color} />
  if (layout === 'compact') {
    icon = <CompactIcon color={color} />
  } else if (layout === 'detailed') {
    icon = <DetailedIcon color={color} />
  }

  return (
    <Pressable onPress={() => onChange(getNextLayout(layout))}>
      {({ pressed }) => (
        <View style={{ padding: 6, borderRadius: 4, opacity: pressed ? 0.5 : 1 }}>
          {icon}
        </View>
      )}
    </Pressable>
  )
}

export type { InventoryLayout }
