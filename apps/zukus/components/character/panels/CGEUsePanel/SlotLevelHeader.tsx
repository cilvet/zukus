import { useState, useEffect } from 'react'
import { TextInput, StyleSheet } from 'react-native'
import { XStack, Text } from 'tamagui'

type SlotLevelHeaderProps = {
  label: string
  current: number
  max: number
  textColor: string
  onValueChange: (value: number) => void
}

export function SlotLevelHeader({
  label,
  current,
  max,
  textColor,
  onValueChange,
}: SlotLevelHeaderProps) {
  const [inputValue, setInputValue] = useState(String(current))
  const [isFocused, setIsFocused] = useState(false)

  // Sync from props when not focused
  useEffect(() => {
    if (!isFocused) {
      setInputValue(String(current))
    }
  }, [current, isFocused])

  const handleBlur = () => {
    setIsFocused(false)
    const parsed = parseInt(inputValue, 10)
    if (!isNaN(parsed) && parsed !== current) {
      onValueChange(parsed)
    } else {
      setInputValue(String(current))
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleChangeText = (text: string) => {
    // Allow empty string or numbers (including negative)
    if (text === '' || text === '-' || /^-?\d+$/.test(text)) {
      setInputValue(text)
    }
  }

  return (
    <XStack
      borderBottomWidth={2}
      borderColor="$borderColor"
      paddingTop={10}
      paddingBottom={6}
      paddingHorizontal={16}
      marginTop={16}
      alignItems="center"
      justifyContent="space-between"
    >
      <Text fontSize={18} color="$color" fontWeight="700">
        {label}
      </Text>
      <XStack alignItems="center" gap={4}>
        <TextInput
          style={[styles.slotInput, { color: textColor }]}
          value={inputValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="number-pad"
          selectTextOnFocus
          underlineColorAndroid="transparent"
        />
        <Text fontSize={18} color="$color" fontWeight="600">
          / {max}
        </Text>
      </XStack>
    </XStack>
  )
}

const styles = StyleSheet.create({
  slotInput: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    width: 36,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: 4,
  },
})
