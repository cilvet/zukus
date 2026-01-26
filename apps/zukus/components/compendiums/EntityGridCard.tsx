import { Pressable, Image, StyleSheet } from 'react-native'
import { YStack, Text } from 'tamagui'
import type { StandardEntity } from '@zukus/core'

export type EntityGridCardProps = {
  entity: StandardEntity
  onPress: () => void
  primaryColor?: string
}

/**
 * Card para vista grid de entidades.
 * Muestra imagen prominente con nombre debajo.
 */
export function EntityGridCard({ entity, onPress, primaryColor = '#666' }: EntityGridCardProps) {
  const hasImage = !!entity.image

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
          {hasImage ? (
            <Image
              source={{ uri: entity.image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <YStack
              height={120}
              backgroundColor={primaryColor}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={36} fontWeight="700" color="white">
                {entity.name.charAt(0).toUpperCase()}
              </Text>
            </YStack>
          )}

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
  image: {
    width: '100%',
    height: 120,
  },
})
