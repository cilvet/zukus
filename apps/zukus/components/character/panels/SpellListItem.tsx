import { Pressable, StyleSheet } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { EntityImage } from '../../../ui'

/**
 * Altura fija del item - DEBE coincidir con estimatedItemSize de FlashList.
 */
export const SPELL_ITEM_HEIGHT = 72

export type SpellListItemProps = {
  id: string
  name: string
  description: string | undefined
  levelLabel: string | null
  image: string | undefined
  color: string
  placeholderColor: string
  onPress: (id: string) => void
}

/**
 * Item de lista de conjuro optimizado para FlashList.
 *
 * Optimizaciones:
 * - Altura fija para overrideItemLayout
 * - Props primitivas (no objetos)
 * - React Compiler se encarga de memoizacion
 */
export function SpellListItem({
  id,
  name,
  description,
  levelLabel,
  image,
  color,
  placeholderColor,
  onPress,
}: SpellListItemProps) {
  return (
    <Pressable onPress={() => onPress(id)} style={styles.container}>
      {({ pressed }) => (
        <XStack
          height={SPELL_ITEM_HEIGHT}
          alignItems="center"
          paddingHorizontal={16}
          gap={12}
          opacity={pressed ? 0.6 : 1}
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <EntityImage image={image} fallbackText={name} />

          <YStack flex={1} gap={4}>
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
              {levelLabel !== null && (
                <Text fontSize={12} color={placeholderColor} marginLeft={8}>
                  {levelLabel}
                </Text>
              )}
            </XStack>
            {description && (
              <Text fontSize={12} color={placeholderColor} numberOfLines={2}>
                {description}
              </Text>
            )}
          </YStack>
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
