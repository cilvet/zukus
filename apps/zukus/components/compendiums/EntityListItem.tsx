import { Pressable, StyleSheet, Image } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';
import type { StandardEntity } from '@zukus/core';
import { useLocalizedEntity } from '../../ui/hooks/useLocalizedEntity';

/**
 * Altura fija del item - DEBE coincidir con estimatedItemSize de FlashList.
 */
export const ENTITY_ITEM_HEIGHT = 68;

export type EntityListItemProps = {
  entity: StandardEntity;
  onPress: () => void;
  // Props primitivas para comparacion eficiente
  imageBaseUrl?: string;
  primaryColor?: string;
};

/**
 * Item de lista optimizado para FlashList.
 *
 * Optimizaciones aplicadas:
 * - Altura fija para overrideItemLayout
 * - Props primitivas para evitar objetos nuevos
 * - React Compiler se encarga de la memoizacion
 */
export function EntityListItem({
  entity: rawEntity,
  onPress,
  imageBaseUrl,
  primaryColor = '#666',
}: EntityListItemProps) {
  const entity = useLocalizedEntity(rawEntity)

  const handlePress = () => {
    onPress();
  };

  // Construir URL de imagen si existe
  const imageUrl = entity.image
    ? imageBaseUrl
      ? `${imageBaseUrl}/${encodeURIComponent(entity.image)}`
      : entity.image
    : null;

  return (
    <Pressable onPress={handlePress} style={styles.container}>
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
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <YStack
              width={44}
              height={44}
              borderRadius={8}
              backgroundColor={primaryColor}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={18} fontWeight="700" color="white">
                {entity.name.charAt(0).toUpperCase()}
              </Text>
            </YStack>
          )}

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
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
});
