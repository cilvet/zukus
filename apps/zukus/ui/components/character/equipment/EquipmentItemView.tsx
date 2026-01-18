import { Pressable } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import type { Item, Armor, Shield, Weapon } from '@zukus/core'
import { Checkbox } from '../../../atoms'

export type EquipmentLayout = 'compact' | 'balanced' | 'detailed'

type EquipmentItemViewProps = {
  item: Item
  layout: EquipmentLayout
  onPress?: () => void
  onToggleEquipped?: () => void
}

type StatChipProps = {
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

function getWeightText(weight?: number): string | null {
  if (!weight && weight !== 0) return null
  return `${weight} lb`
}

function getCostText(cost?: number): string | null {
  if (!cost && cost !== 0) return null
  return `${cost} gp`
}

function getPrimaryStats(item: Item): StatChipProps[] {
  if (isWeapon(item)) {
    return [
      { label: 'Damage', value: item.damageDice },
      { label: 'Crit', value: getCritText(item.baseCritRange, item.baseCritMultiplier) },
    ]
  }

  if (isArmor(item)) {
    const totalArmor = item.baseArmorBonus + item.enhancementBonus
    return [
      { label: 'AC', value: `+${totalArmor}` },
      { label: 'Max Dex', value: `${item.maxDexBonus}` },
    ]
  }

  if (isShield(item)) {
    const totalShield = item.baseShieldBonus + item.enhancementBonus
    return [
      { label: 'AC', value: `+${totalShield}` },
      { label: 'Penalty', value: `${item.armorCheckPenalty}` },
    ]
  }

  return []
}

function getSecondaryStats(item: Item): StatChipProps[] {
  if (isWeapon(item)) {
    return [
      { label: 'Type', value: formatDamageType(item.damageType) },
      { label: 'Range', value: item.weaponAttackType },
    ]
  }

  if (isArmor(item)) {
    return [
      { label: 'Penalty', value: `${item.armorCheckPenalty}` },
      { label: 'Speed', value: `${item.speed30}/${item.speed20}` },
    ]
  }

  if (isShield(item)) {
    return [
      { label: 'Penalty', value: `${item.armorCheckPenalty}` },
      { label: 'ASF', value: `${item.arcaneSpellFailureChance}%` },
    ]
  }

  return []
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

function getCompactSubtitle(item: Item): string {
  const primaryStats = getPrimaryStats(item) ?? []
  if (primaryStats.length > 0) {
    return primaryStats.map((stat) => `${stat.value}`).join(' • ')
  }

  return item.itemType
}

function getTypeLabel(item: Item): string {
  return item.itemType.replace(/_/g, ' ').toLowerCase()
}

function EquipmentImagePlaceholder({ size, label }: { size: number; label: string }) {
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

function StatChip({ label, value }: StatChipProps) {
  return (
    <YStack
      paddingVertical={4}
      paddingHorizontal={8}
      borderRadius={4}
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="$uiBackgroundColor"
      minWidth={72}
    >
      <Text fontSize={9} color="$placeholderColor" textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize={12} fontWeight="600" color="$color">
        {value}
      </Text>
    </YStack>
  )
}

function EquipmentItemShell({
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

function EquipmentToggle({
  item,
  onToggleEquipped,
}: {
  item: Item
  onToggleEquipped?: () => void
}) {
  if (!item.equipable) {
    return null
  }

  return (
    <Checkbox
      checked={item.equipped}
      onCheckedChange={() => onToggleEquipped?.()}
      size="small"
      variant="diamond"
    />
  )
}

function CompactLayout({ item, onPress, onToggleEquipped }: EquipmentItemViewProps) {
  "use no memo"
  const subtitle = getCompactSubtitle(item)
  const weightText = getWeightText(item.weight)

  return (
    <EquipmentItemShell
      onPress={onPress}
      rightSlot={
        <YStack alignItems="flex-end" gap={4}>
          <EquipmentToggle item={item} onToggleEquipped={onToggleEquipped} />
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
        <EquipmentImagePlaceholder size={28} label={item.itemType.slice(0, 3)} />
        <YStack gap={2} flex={1}>
          <Text fontSize={13} fontWeight="600" color="$color" numberOfLines={1}>
            {item.name}
          </Text>
          <Text fontSize={11} color="$placeholderColor" numberOfLines={1}>
            {subtitle}
          </Text>
        </YStack>
      </XStack>
    </EquipmentItemShell>
  )
}

function BalancedLayout({ item, onPress, onToggleEquipped }: EquipmentItemViewProps) {
  "use no memo"
  const typeLabel = getTypeLabel(item)
  const primaryStats = getPrimaryStats(item) ?? []
  const weightText = getWeightText(item.weight)
  const costText = getCostText(item.cost)

  return (
    <EquipmentItemShell
      onPress={onPress}
      rightSlot={
        <YStack alignItems="flex-end" gap={4}>
          <EquipmentToggle item={item} onToggleEquipped={onToggleEquipped} />
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
        <EquipmentImagePlaceholder size={36} label={item.itemType.slice(0, 3)} />
        <YStack gap={4} flex={1}>
          <Text fontSize={14} fontWeight="700" color="$color" numberOfLines={1}>
            {item.name}
          </Text>
          <Text fontSize={11} color="$placeholderColor" textTransform="uppercase">
            {typeLabel}
          </Text>
          {primaryStats.length > 0 ? (
            <XStack gap={8}>
              {primaryStats.map((stat) => (
                <Text key={stat.label} fontSize={11} color="$placeholderColor">
                  {stat.value}
                </Text>
              ))}
            </XStack>
          ) : null}
        </YStack>
      </XStack>
    </EquipmentItemShell>
  )
}

function DetailedLayout({ item, onPress, onToggleEquipped }: EquipmentItemViewProps) {
  "use no memo"
  const typeLabel = getTypeLabel(item)
  const primaryStats = getPrimaryStats(item) ?? []
  const secondaryStats = getSecondaryStats(item) ?? []
  const weightText = getWeightText(item.weight)
  const costText = getCostText(item.cost)

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
        <EquipmentImagePlaceholder size={44} label={item.itemType.slice(0, 3)} />
        <Pressable onPress={onPress} style={{ flex: 1 }}>
          <YStack gap={4}>
            <Text fontSize={16} fontWeight="700" color="$color">
              {item.name}
            </Text>
            <Text fontSize={11} color="$placeholderColor" textTransform="uppercase">
              {typeLabel}
            </Text>
          </YStack>
        </Pressable>
        <EquipmentToggle item={item} onToggleEquipped={onToggleEquipped} />
      </XStack>

      {primaryStats.length > 0 ? (
        <XStack gap={8} flexWrap="wrap">
          {primaryStats.map((stat) => (
            <StatChip key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </XStack>
      ) : null}

      {secondaryStats.length > 0 ? (
        <XStack gap={8} flexWrap="wrap">
          {secondaryStats.map((stat) => (
            <StatChip key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </XStack>
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

export function EquipmentItemView(props: EquipmentItemViewProps) {
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
