import { Pressable, StyleSheet } from 'react-native';
import { XStack } from 'tamagui';
import { FontAwesome6 } from '@expo/vector-icons';

export type LayoutToggleProps = {
  viewMode: 'grid' | 'list';
  onToggle: () => void;
};

export function LayoutToggle({ viewMode, onToggle }: LayoutToggleProps) {
  return (
    <Pressable onPress={onToggle} hitSlop={8}>
      <XStack
        padding="$2"
        borderRadius="$2"
        backgroundColor="$accentBackground"
      >
        <FontAwesome6
          name={viewMode === 'grid' ? 'grip' : 'list'}
          size={16}
          color="#a78bfa"
        />
      </XStack>
    </Pressable>
  );
}
