import React from 'react'
import { Slider as TamaguiSlider, XStack, Text, Stack } from 'tamagui'

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
  const handleValueChange = (values: number[]) => {
    onValueChange(values[0])
  }

  return (
    <XStack alignItems="center" gap={8} width="100%">
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
      >
        <TamaguiSlider.Track
          height={4}
          backgroundColor="$borderColor"
          borderRadius={2}
        >
          <TamaguiSlider.TrackActive
            backgroundColor="$color"
            borderRadius={2}
          />
        </TamaguiSlider.Track>

        <TamaguiSlider.Thumb
          index={0}
          size={24}
          backgroundColor="transparent"
          borderWidth={0}
        >
          <Stack
            width={14}
            height={14}
            backgroundColor="$background"
            transform={[{ rotate: '45deg' }]}
            borderRadius={0}
            borderWidth={1.5}
            borderColor="$color"
          />
        </TamaguiSlider.Thumb>
      </TamaguiSlider>

      {showValue && (
        <Text fontSize={12} color="$color" minWidth={24} textAlign="right">
          {value}
        </Text>
      )}
    </XStack>
  )
}
