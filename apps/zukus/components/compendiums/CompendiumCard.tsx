import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';
import { useTheme } from '../../ui';

export type CompendiumCardProps = {
  id: string;
  name: string;
  description?: string;
  entityCount: number;
  onPress: () => void;
};

function CompendiumCardComponent({
  name,
  description,
  entityCount,
  onPress,
}: CompendiumCardProps) {
  const { themeColors } = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      {({ pressed }) => (
        <YStack
          padding="$4"
          borderRadius="$4"
          borderWidth={1}
          borderColor="$borderColor"
          backgroundColor="$background"
          opacity={pressed ? 0.7 : 1}
          gap="$2"
        >
          <XStack justifyContent="space-between" alignItems="flex-start">
            <Text
              fontSize={16}
              fontWeight="700"
              color="$color"
              flex={1}
              numberOfLines={1}
            >
              {name}
            </Text>
            <YStack
              backgroundColor="$accentBackground"
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$2"
              marginLeft="$2"
            >
              <Text fontSize={12} fontWeight="600" color="$accentColor">
                {entityCount}
              </Text>
            </YStack>
          </XStack>

          {description && (
            <Text
              fontSize={13}
              color="$placeholderColor"
              numberOfLines={2}
              lineHeight={18}
            >
              {description}
            </Text>
          )}
        </YStack>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
});

// Memoizado con comparacion por ID
function arePropsEqual(prev: CompendiumCardProps, next: CompendiumCardProps): boolean {
  return prev.id === next.id && prev.entityCount === next.entityCount;
}

export const CompendiumCard = memo(CompendiumCardComponent, arePropsEqual);
