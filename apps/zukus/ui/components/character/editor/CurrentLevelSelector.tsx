import { useState } from 'react'
import { TextInput, StyleSheet } from 'react-native'
import { XStack, Text } from 'tamagui'
import { useTheme } from '../../../contexts/ThemeContext'

export type CurrentLevelSelectorProps = {
  currentLevel: number
  onLevelChange: (level: number) => void
}

/**
 * Selector de nivel con input numerico simple.
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
    <XStack
      alignItems="center"
      justifyContent="space-between"
      padding={12}
      borderRadius={10}
      borderWidth={1}
      borderColor={themeColors.borderColor}
      backgroundColor={themeColors.uiBackgroundColor}
    >
      <Text fontSize={14} color="$placeholderColor">
        Nivel actual
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
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    width: 50,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 6,
  },
})
