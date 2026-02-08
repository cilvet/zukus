import { Pressable, StyleSheet } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import type { StandardEntity } from '@zukus/core'
import { EntityImage } from '../../ui'
import { useLocalizedEntity } from '../../ui/hooks/useLocalizedEntity'

/**
 * Altura fija del item - DEBE coincidir con estimatedItemSize de FlashList.
 */
export const ENTITY_ITEM_HEIGHT = 68

export type EntityListItemProps = {
  entity: StandardEntity
  onPress: () => void
}

/**
 * Item de lista optimizado para FlashList.
 * Usa EntityImage para mostrar imagenes desde Supabase CDN.
 */
export function EntityListItem({
  entity: rawEntity,
  onPress,
}: EntityListItemProps) {
  const entity = useLocalizedEntity(rawEntity)

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {({ pressed }) => (
        <XStack
          height={ENTITY_ITEM_HEIGHT}
          alignItems="center"
          paddingHorizontal={16}
          gap={12}
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
          opacity={pressed ? 0.7 : 1}
        >
          <EntityImage
            image={entity.image}
            fallbackText={entity.name}
            size={44}
          />

          <YStack flex={1} gap={2}>
            <Text
              fontSize={15}
              fontWeight="600"
              color="$color"
              numberOfLines={1}
            >
              {entity.name}
            </Text>
            {entity.description && (
              <Text
                fontSize={12}
                color="$placeholderColor"
                numberOfLines={1}
              >
                {entity.description}
              </Text>
            )}
          </YStack>

          {entity.tags && entity.tags.length > 0 && (
            <Text fontSize={11} color="$accentColor">
              {entity.tags[0]}
            </Text>
          )}
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
