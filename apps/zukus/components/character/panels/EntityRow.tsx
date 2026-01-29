import { Pressable } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { EntityImage } from '../../../ui'

/** Consistent sizing for entity rows across CGE panels */
export const ENTITY_ROW_IMAGE_SIZE = 32
export const ENTITY_ROW_PADDING_VERTICAL = 8
export const ENTITY_ROW_PADDING_HORIZONTAL = 16
export const ENTITY_ROW_GAP = 10

type EntityRowProps = {
  name: string
  image?: string
  subtitle?: string
  isLast?: boolean
  opacity?: number
  /** Called when the row is pressed (for navigation to entity detail) */
  onPress?: () => void
  /** Element shown on the right side of the row */
  rightElement?: React.ReactNode
}

/**
 * Shared entity row component for CGE panels (preparation and use).
 * Consistent sizing and spacing across all entity lists.
 */
export function EntityRow({
  name,
  image,
  subtitle,
  isLast = false,
  opacity = 1,
  onPress,
  rightElement,
}: EntityRowProps) {
  const content = (pressed?: boolean) => (
    <XStack
      alignItems="center"
      paddingVertical={ENTITY_ROW_PADDING_VERTICAL}
      paddingHorizontal={ENTITY_ROW_PADDING_HORIZONTAL}
      gap={ENTITY_ROW_GAP}
      borderBottomWidth={isLast ? 0 : 1}
      borderBottomColor="$borderColor"
      opacity={pressed ? 0.6 : opacity}
    >
      <EntityImage image={image} fallbackText={name} size={ENTITY_ROW_IMAGE_SIZE} />

      <YStack flex={1} gap={1}>
        <Text fontSize={13} color="$color">
          {name}
        </Text>
        {subtitle && (
          <Text fontSize={10} color="$placeholderColor">
            {subtitle}
          </Text>
        )}
      </YStack>

      {rightElement}
    </XStack>
  )

  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={4}>
        {({ pressed }) => content(pressed)}
      </Pressable>
    )
  }

  return content()
}

type EmptySlotRowProps = {
  isLast?: boolean
  label?: string
  onPress: () => void
}

/**
 * Empty slot placeholder for preparation/known panels.
 */
export function EmptySlotRow({ isLast = false, label = 'Preparar...', onPress }: EmptySlotRowProps) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <XStack
          alignItems="center"
          paddingVertical={ENTITY_ROW_PADDING_VERTICAL}
          paddingHorizontal={ENTITY_ROW_PADDING_HORIZONTAL}
          gap={ENTITY_ROW_GAP}
          borderBottomWidth={isLast ? 0 : 1}
          borderBottomColor="$borderColor"
          opacity={pressed ? 0.6 : 1}
        >
          <YStack
            width={ENTITY_ROW_IMAGE_SIZE}
            height={ENTITY_ROW_IMAGE_SIZE}
            borderRadius={Math.round(ENTITY_ROW_IMAGE_SIZE * 0.15)}
            borderWidth={1}
            borderColor="$borderColor"
            borderStyle="dashed"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={14} color="$placeholderColor">+</Text>
          </YStack>

          <Text fontSize={13} color="$placeholderColor" flex={1}>
            {label}
          </Text>
        </XStack>
      )}
    </Pressable>
  )
}

type LevelHeaderProps = {
  label: string
  count: string
}

/**
 * Level section header for CGE panels.
 */
export function LevelHeader({ label, count }: LevelHeaderProps) {
  return (
    <XStack
      borderBottomWidth={2}
      borderColor="$borderColor"
      paddingTop={10}
      paddingBottom={6}
      paddingHorizontal={ENTITY_ROW_PADDING_HORIZONTAL}
      marginTop={16}
      alignItems="center"
      justifyContent="space-between"
    >
      <Text fontSize={18} color="$color" fontWeight="700">
        {label}
      </Text>
      <Text fontSize={18} color="$color" fontWeight="600">
        {count}
      </Text>
    </XStack>
  )
}
