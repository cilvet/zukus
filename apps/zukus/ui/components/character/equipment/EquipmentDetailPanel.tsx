import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import type { Item, Armor, Shield, Weapon } from '@zukus/core'
import { Checkbox } from '../../../atoms'

export type EquipmentDetailLayout = 'overview' | 'stats' | 'minimal'

type EquipmentDetailPanelProps = {
  item: Item
  onToggleEquipped?: () => void
}

type DetailStat = {
  label: string
  value: string
}

function isWeapon(item: Item): item is Weapon {
  return item.itemType === 'WEAPON'
}

function isArmor(item: Item): item is Armor {
  return item.itemType === 'ARMOR'
}

function isShield(item: Item): item is Shield {
  return item.itemType === 'SHIELD'
}

function getCritText(range: number, multiplier: number): string {
  if (range >= 20) {
    return `20/x${multiplier}`
  }
  return `${range}-20/x${multiplier}`
}

function getTypeLabel(item: Item): string {
  return item.itemType.replace(/_/g, ' ').toLowerCase()
}

function getDetailStats(item: Item): DetailStat[] {
  const stats: DetailStat[] = []

  if (isWeapon(item)) {
    stats.push({ label: 'Damage', value: item.damageDice })
    stats.push({ label: 'Crit', value: getCritText(item.baseCritRange, item.baseCritMultiplier) })
    stats.push({ label: 'Type', value: formatDamageType(item.damageType) })
    stats.push({ label: 'Attack', value: item.weaponAttackType })
  } else if (isArmor(item)) {
    stats.push({ label: 'Base AC', value: `${item.baseArmorBonus}` })
    stats.push({ label: 'Enhancement', value: `${item.enhancementBonus}` })
    stats.push({ label: 'Max Dex', value: `${item.maxDexBonus}` })
    stats.push({ label: 'Penalty', value: `${item.armorCheckPenalty}` })
    stats.push({ label: 'ASF', value: `${item.arcaneSpellFailureChance}%` })
  } else if (isShield(item)) {
    stats.push({ label: 'Base AC', value: `${item.baseShieldBonus}` })
    stats.push({ label: 'Enhancement', value: `${item.enhancementBonus}` })
    stats.push({ label: 'Penalty', value: `${item.armorCheckPenalty}` })
    stats.push({ label: 'ASF', value: `${item.arcaneSpellFailureChance}%` })
  }

  if (item.weight || item.weight === 0) {
    stats.push({ label: 'Weight', value: `${item.weight} lb` })
  }

  if (item.cost || item.cost === 0) {
    stats.push({ label: 'Cost', value: `${item.cost} gp` })
  }

  return stats
}

function formatDamageType(value: unknown): string {
  if (!value || typeof value !== 'object') {
    return String(value ?? '')
  }

  const damageType = value as { type?: string; damageType?: string; damageTypes?: string[]; firstDamageType?: string; secondDamageType?: string }

  if (damageType.type === 'basic' && damageType.damageType) {
    return damageType.damageType
  }

  if (damageType.type === 'multiple' && Array.isArray(damageType.damageTypes)) {
    return damageType.damageTypes.join(' / ')
  }

  if (damageType.type === 'halfAndHalf' && damageType.firstDamageType && damageType.secondDamageType) {
    return `${damageType.firstDamageType} / ${damageType.secondDamageType}`
  }

  return 'Unknown'
}

function EquipmentImagePlaceholder({ size, label }: { size: number; label: string }) {
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={8}
      backgroundColor="$uiBackgroundColor"
      borderWidth={1}
      borderColor="$borderColor"
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize={12} color="$placeholderColor">
        {label}
      </Text>
    </YStack>
  )
}

function DetailStatRow({ label, value }: DetailStat) {
  return (
    <XStack
      justifyContent="space-between"
      alignItems="center"
      paddingVertical={6}
      paddingHorizontal={10}
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      <Text fontSize={12} color="$placeholderColor">
        {label}
      </Text>
      <Text fontSize={13} fontWeight="600" color="$color">
        {value}
      </Text>
    </XStack>
  )
}

function OverviewLayout({
  item,
  stats,
  onToggleEquipped,
}: {
  item: Item
  stats: DetailStat[]
  onToggleEquipped?: () => void
}) {
  const typeLabel = getTypeLabel(item)

  return (
    <YStack gap={20}>
      <XStack alignItems="center" gap={12}>
        <EquipmentImagePlaceholder size={60} label={item.itemType.slice(0, 4)} />
        <YStack flex={1} gap={6}>
          <Text fontSize={22} fontWeight="700" color="$color">
            {item.name}
          </Text>
          <Text fontSize={12} color="$placeholderColor" textTransform="uppercase">
            {typeLabel}
          </Text>
        </YStack>
        {item.equipable ? (
          <Checkbox
            checked={item.equipped}
            onCheckedChange={() => onToggleEquipped?.()}
            size="small"
            variant="diamond"
          />
        ) : null}
      </XStack>

      {stats.length > 0 ? (
        <YStack
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius={8}
          overflow="hidden"
        >
          {stats.map((stat) => (
            <DetailStatRow key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </YStack>
      ) : null}

      {item.description ? (
        <YStack gap={8}>
          <Text fontSize={13} fontWeight="700" color="$color">
            Description
          </Text>
          <Text fontSize={13} color="$placeholderColor" lineHeight={20}>
            {item.description}
          </Text>
        </YStack>
      ) : null}
    </YStack>
  )
}

function StatsFirstLayout({
  item,
  stats,
  onToggleEquipped,
}: {
  item: Item
  stats: DetailStat[]
  onToggleEquipped?: () => void
}) {
  const typeLabel = getTypeLabel(item)

  return (
    <YStack gap={16}>
      <XStack justifyContent="space-between" alignItems="center">
        <YStack gap={4}>
          <Text fontSize={20} fontWeight="700" color="$color">
            {item.name}
          </Text>
          <Text fontSize={12} color="$placeholderColor" textTransform="uppercase">
            {typeLabel}
          </Text>
        </YStack>
        {item.equipable ? (
          <Checkbox
            checked={item.equipped}
            onCheckedChange={() => onToggleEquipped?.()}
            size="small"
            variant="diamond"
          />
        ) : null}
      </XStack>

      {stats.length > 0 ? (
        <YStack
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius={8}
          overflow="hidden"
        >
          {stats.map((stat) => (
            <DetailStatRow key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </YStack>
      ) : null}

      {item.description ? (
        <Text fontSize={13} color="$placeholderColor" lineHeight={20}>
          {item.description}
        </Text>
      ) : null}
    </YStack>
  )
}

function MinimalLayout({
  item,
  stats,
  onToggleEquipped,
}: {
  item: Item
  stats: DetailStat[]
  onToggleEquipped?: () => void
}) {
  const typeLabel = getTypeLabel(item)

  return (
    <YStack gap={12}>
      <XStack alignItems="center" gap={10}>
        <EquipmentImagePlaceholder size={48} label={item.itemType.slice(0, 4)} />
        <YStack flex={1} gap={4}>
          <Text fontSize={18} fontWeight="700" color="$color">
            {item.name}
          </Text>
          <Text fontSize={11} color="$placeholderColor" textTransform="uppercase">
            {typeLabel}
          </Text>
        </YStack>
        {item.equipable ? (
          <Checkbox
            checked={item.equipped}
            onCheckedChange={() => onToggleEquipped?.()}
            size="small"
            variant="diamond"
          />
        ) : null}
      </XStack>

      {stats.length > 0 ? (
        <YStack gap={6}>
          {stats.map((stat) => (
            <XStack key={stat.label} justifyContent="space-between">
              <Text fontSize={12} color="$placeholderColor">
                {stat.label}
              </Text>
              <Text fontSize={12} fontWeight="600" color="$color">
                {stat.value}
              </Text>
            </XStack>
          ))}
        </YStack>
      ) : null}

      {item.description ? (
        <Text fontSize={13} color="$placeholderColor" lineHeight={20}>
          {item.description}
        </Text>
      ) : null}
    </YStack>
  )
}

function DetailLayoutToggle({
  layout,
  onChange,
}: {
  layout: EquipmentDetailLayout
  onChange: (layout: EquipmentDetailLayout) => void
}) {
  const order: EquipmentDetailLayout[] = ['overview', 'stats', 'minimal']
  const currentIndex = order.indexOf(layout)
  const nextLayout = order[(currentIndex + 1) % order.length]

  let label = 'Overview'
  if (layout === 'stats') {
    label = 'Stats'
  } else if (layout === 'minimal') {
    label = 'Minimal'
  }

  return (
    <Pressable onPress={() => onChange(nextLayout)}>
      {({ pressed }) => (
        <View style={{ paddingHorizontal: 8, paddingVertical: 4, opacity: pressed ? 0.5 : 1 }}>
          <Text fontSize={11} color="$placeholderColor" textTransform="uppercase">
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  )
}

export function EquipmentDetailPanel({ item, onToggleEquipped }: EquipmentDetailPanelProps) {
  const [layout, setLayout] = useState<EquipmentDetailLayout>('overview')
  const stats = getDetailStats(item)

  return (
    <YStack gap={16}>
      <XStack justifyContent="flex-end">
        <DetailLayoutToggle layout={layout} onChange={setLayout} />
      </XStack>

      {layout === 'overview' ? (
        <OverviewLayout item={item} stats={stats} onToggleEquipped={onToggleEquipped} />
      ) : null}
      {layout === 'stats' ? (
        <StatsFirstLayout item={item} stats={stats} onToggleEquipped={onToggleEquipped} />
      ) : null}
      {layout === 'minimal' ? (
        <MinimalLayout item={item} stats={stats} onToggleEquipped={onToggleEquipped} />
      ) : null}
    </YStack>
  )
}
