import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';
import { FontAwesome6 } from '@expo/vector-icons';

export type EntityTypeCardProps = {
  typeName: string;
  displayName: string;
  count: number;
  description?: string;
  onPress: () => void;
};

/**
 * Iconos para tipos de entidad comunes.
 */
const TYPE_ICONS: Record<string, string> = {
  spell: 'wand-magic-sparkles',
  feat: 'star',
  buff: 'shield-halved',
  class: 'hat-wizard',
  classFeature: 'bolt',
  system_levels: 'chart-line',
  character_ability_increase: 'arrow-up',
};

function EntityTypeCardComponent({
  typeName,
  displayName,
  count,
  description,
  onPress,
}: EntityTypeCardProps) {
  const iconName = TYPE_ICONS[typeName] || 'cube';

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      {({ pressed }) => (
        <XStack
          padding="$3"
          borderRadius="$3"
          borderWidth={1}
          borderColor="$borderColor"
          backgroundColor="$background"
          opacity={pressed ? 0.7 : 1}
          alignItems="center"
          gap="$3"
        >
          <YStack
            width={40}
            height={40}
            borderRadius="$2"
            backgroundColor="$accentBackground"
            alignItems="center"
            justifyContent="center"
          >
            <FontAwesome6
              name={iconName as any}
              size={18}
              color="#a78bfa"
            />
          </YStack>

          <YStack flex={1} gap="$1">
            <Text fontSize={15} fontWeight="600" color="$color" numberOfLines={1}>
              {displayName}
            </Text>
            {description && (
              <Text fontSize={12} color="$placeholderColor" numberOfLines={1}>
                {description}
              </Text>
            )}
          </YStack>

          <YStack
            backgroundColor="$accentBackground"
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius="$2"
          >
            <Text fontSize={13} fontWeight="600" color="$accentColor">
              {count}
            </Text>
          </YStack>

          <FontAwesome6 name="chevron-right" size={14} color="#666" />
        </XStack>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
});

// Memoizado con comparacion simple
function arePropsEqual(prev: EntityTypeCardProps, next: EntityTypeCardProps): boolean {
  return prev.typeName === next.typeName && prev.count === next.count;
}

export const EntityTypeCard = memo(EntityTypeCardComponent, arePropsEqual);
