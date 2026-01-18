import React, { useRef } from 'react'
import { XStack, Text } from 'tamagui'
import RNSlider from '@react-native-community/slider'
import * as Haptics from 'expo-haptics'
import { useTheme } from 'tamagui'

export type SliderProps = {
  value: number
  min: number
  max: number
  step?: number
  onValueChange: (value: number) => void
  label?: string
  showValue?: boolean
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onValueChange,
  label,
  showValue = true,
}: SliderProps) {
  const lastValueRef = useRef(value)
  const theme = useTheme()

  const handleValueChange = (newValue: number) => {
    // Trigger haptic feedback only when value changes to a new step
    if (newValue !== lastValueRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      lastValueRef.current = newValue
    }
    onValueChange(newValue)
  }

  return (
    <XStack alignItems="center" gap={12} width="100%">
      {label && (
        <Text fontSize={12} color="$color">
          {label}
        </Text>
      )}

      <RNSlider
        style={{ flex: 1, height: 50, marginHorizontal: -8 }}
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={handleValueChange}
        minimumTrackTintColor={theme.color?.val}
        maximumTrackTintColor={theme.borderColor?.val}
        thumbTintColor={theme.color?.val}
      />

      {showValue && (
        <Text fontSize={16} color="$color" minWidth={32} textAlign="right" fontWeight="700">
          {value}
        </Text>
      )}
    </XStack>
  )
}
