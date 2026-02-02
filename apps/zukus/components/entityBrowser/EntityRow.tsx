import { Pressable, StyleSheet } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { EntityImage } from '../../ui'
import { ActionButton } from './actions'
import type { ButtonConfig } from './types'

/**
 * Altura fija del EntityRow - DEBE coincidir con estimatedItemSize de FlashList.
 */
export const ENTITY_ROW_HEIGHT = 72

export type EntityRowProps = {
  id: string
  name: string
  description?: string
  /** Optional metadata line (e.g., "Weapon | 3 lb | 15 gp") */
  metaLine?: string
  /** Optional badge/label (e.g., "Nv 3") */
  badge?: string | null
  image?: string
  color: string
  placeholderColor: string
  accentColor: string
  buttonConfig: ButtonConfig
  buttonDisabled?: boolean
  /** Called when row is pressed (navigate to detail) */
  onPress: (id: string) => void
  /** Called when dropdown needs to open */
  onOpenDropdown?: (id: string) => void
  /** Called when counter action is executed */
  onExecuteAction?: (actionId: string, entityId: string) => void
}

/**
 * Entity row optimized for FlashList.
 *
 * Structure:
 * - Pressable row → navigates to detail
 * - Action button (right) → opens dropdown or executes action (doesn't propagate)
 *
 * Optimizations:
 * - Fixed height for overrideItemLayout
 * - Primitive props (no objects)
 * - React Compiler handles memoization
 */
export function EntityRow({
  id,
  name,
  description,
  metaLine,
  badge,
  image,
  color,
  placeholderColor,
  accentColor,
  buttonConfig,
  buttonDisabled,
  onPress,
  onOpenDropdown,
  onExecuteAction,
}: EntityRowProps) {
  return (
    <Pressable onPress={() => onPress(id)} style={styles.container}>
      {({ pressed }) => (
        <XStack
          height={ENTITY_ROW_HEIGHT}
          alignItems="center"
          paddingHorizontal={16}
          gap={12}
          opacity={pressed ? 0.6 : 1}
          borderBottomWidth={StyleSheet.hairlineWidth}
          borderBottomColor="$borderColor"
        >
          {/* Entity image */}
          <EntityImage image={image} fallbackText={name} />

          {/* Content */}
          <YStack flex={1} gap={2}>
            <XStack alignItems="center" justifyContent="space-between">
              <Text
                fontSize={15}
                color={color}
                fontWeight="500"
                flex={1}
                numberOfLines={1}
              >
                {name}
              </Text>
              {badge && (
                <Text fontSize={12} color={placeholderColor} marginLeft={8}>
                  {badge}
                </Text>
              )}
            </XStack>
            {metaLine && (
              <Text fontSize={12} color={placeholderColor} numberOfLines={1}>
                {metaLine}
              </Text>
            )}
            {description && (
              <Text fontSize={12} color={placeholderColor} numberOfLines={1}>
                {description}
              </Text>
            )}
          </YStack>

          {/* Action button - stop propagation to prevent row press */}
          <Pressable
            onPress={(e) => e.stopPropagation()}
            hitSlop={0}
          >
            <ActionButton
              config={buttonConfig}
              entityId={id}
              accentColor={accentColor}
              placeholderColor={placeholderColor}
              disabled={buttonDisabled}
              onOpenDropdown={onOpenDropdown}
              onExecute={onExecuteAction}
            />
          </Pressable>
        </XStack>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
})
