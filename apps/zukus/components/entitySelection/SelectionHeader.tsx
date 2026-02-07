import { XStack, YStack, Text } from 'tamagui'

export type SelectionHeaderProps = {
  label: string
  current: number
  max: number
  min: number
}

export function SelectionHeader({ label, current, max, min }: SelectionHeaderProps) {
  const isMinMet = current >= min

  return (
    <YStack gap={4}>
      <Text fontSize={22} fontWeight="700" color="$color">
        {label}
      </Text>
      <XStack alignItems="center" gap={8}>
        <Text fontSize={14} color="$placeholderColor">
          Selecciona{' '}
          {min === max ? max : `${min}-${max}`}{' '}
          opcion(es)
        </Text>
        <XStack
          backgroundColor={isMinMet ? '$green9' : '$yellow9'}
          paddingHorizontal={8}
          paddingVertical={2}
          borderRadius={12}
          testID="selection-badge"
        >
          <Text fontSize={12} color="white" fontWeight="600">
            {current}/{max}
          </Text>
        </XStack>
      </XStack>
    </YStack>
  )
}
