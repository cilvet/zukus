import { Pressable, StyleSheet } from 'react-native'
import { YStack, Text } from 'tamagui'
import type { StandardEntity } from '@zukus/core'
import { EntityImage } from '../../ui'
import { useLocalizedEntity } from '../../ui/hooks/useLocalizedEntity'

export type EntityGridCardProps = {
  entity: StandardEntity
  onPress: () => void
}

/**
 * Card para vista grid de entidades.
 * Muestra imagen prominente con nombre debajo.
 * Usa EntityImage para URLs correctas desde Supabase CDN.
 */
export function EntityGridCard({ entity: rawEntity, onPress }: EntityGridCardProps) {
  const entity = useLocalizedEntity(rawEntity)

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {({ pressed }) => (
        <YStack
          backgroundColor="$uiBackgroundColor"
          borderRadius={12}
          borderWidth={1}
          borderColor="$borderColor"
          overflow="hidden"
          opacity={pressed ? 0.8 : 1}
        >
          {/* Image area */}
          <YStack
            height={120}
            alignItems="center"
            justifyContent="center"
          >
            <EntityImage
              image={entity.image}
              fallbackText={entity.name}
              size={120}
            />
          </YStack>

          {/* Content */}
          <YStack padding={12} gap={4}>
            <Text
              fontSize={14}
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
                numberOfLines={2}
                lineHeight={16}
              >
                {entity.description}
              </Text>
            )}

            {entity.tags && entity.tags.length > 0 && (
              <Text fontSize={11} color="$accentColor" numberOfLines={1}>
                {entity.tags.slice(0, 2).join(', ')}
              </Text>
            )}
          </YStack>
        </YStack>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 160,
    maxWidth: 200,
  },
})
