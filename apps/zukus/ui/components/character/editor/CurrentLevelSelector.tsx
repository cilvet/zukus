import { useState } from 'react'
import { TextInput, StyleSheet } from 'react-native'
import { XStack, Text } from 'tamagui'
import { useTheme } from '../../../contexts/ThemeContext'

export type CurrentLevelSelectorProps = {
  currentLevel: number
  onLevelChange: (level: number) => void
}

/**
 * Selector de nivel compacto inline: "Nv." + input numérico.
 */
export function CurrentLevelSelector({
  currentLevel,
  onLevelChange,
}: CurrentLevelSelectorProps) {
  const { themeColors } = useTheme()
  const [text, setText] = useState(String(currentLevel))

  const handleChangeText = (value: string) => {
    setText(value)
  }

  const handleBlur = () => {
    const num = parseInt(text, 10)
    if (!isNaN(num) && num >= 1 && num <= 20) {
      onLevelChange(num)
      setText(String(num))
    } else {
      setText(String(currentLevel))
    }
  }

  return (
    <XStack alignItems="center" gap="$1.5">
      <Text fontSize={14} fontWeight="600" color="$placeholderColor">
        Nv.
      </Text>
      <TextInput
        value={text}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        keyboardType="number-pad"
        selectTextOnFocus
        style={[
          styles.input,
          {
            color: themeColors.color,
            borderColor: themeColors.borderColor,
          },
        ]}
      />
    </XStack>
  )
}

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    width: 40,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 6,
  },
})
