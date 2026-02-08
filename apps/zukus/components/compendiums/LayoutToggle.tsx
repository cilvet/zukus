import { Pressable } from 'react-native'
import { XStack } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { useTheme } from '../../ui'

export type LayoutToggleProps = {
  viewMode: 'grid' | 'list'
  onToggle: () => void
}

export function LayoutToggle({ viewMode, onToggle }: LayoutToggleProps) {
  const { themeInfo } = useTheme()
  const accentColor = themeInfo.colors.accent

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
          color={accentColor}
        />
      </XStack>
    </Pressable>
  )
}
