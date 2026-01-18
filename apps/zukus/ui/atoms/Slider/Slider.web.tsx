import React, { useRef } from 'react'
import { Slider as TamaguiSlider, XStack, Text } from 'tamagui'
import * as Haptics from 'expo-haptics'

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

  const handleValueChange = (values: number[]) => {
    const newValue = values[0]
    
    // Trigger haptic feedback only when the value actually changes (step by step)
    if (newValue !== lastValueRef.current) {
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

      <TamaguiSlider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleValueChange}
        flex={1}
        size="$4"
        marginHorizontal={-8}
      >
        <TamaguiSlider.Track
          height={6}
          backgroundColor="$borderColor"
          borderRadius={3}
        >
          <TamaguiSlider.TrackActive
            backgroundColor="$color"
            borderRadius={3}
          />
        </TamaguiSlider.Track>

        <TamaguiSlider.Thumb
          index={0}
          size={36}
          circular
          backgroundColor="$color"
          borderWidth={3}
          borderColor="$background"
          pressStyle={{
            scale: 1.1,
          }}
          hoverStyle={{
            scale: 1.05,
          }}
        />
      </TamaguiSlider>

      {showValue && (
        <Text fontSize={16} color="$color" minWidth={32} textAlign="right" fontWeight="700">
          {value}
        </Text>
      )}
    </XStack>
  )
}
