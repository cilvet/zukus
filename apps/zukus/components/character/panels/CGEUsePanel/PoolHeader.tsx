import { YStack, XStack, Text } from 'tamagui'

type PoolHeaderProps = {
  label: string
  current: number
  max: number
  accentColor: string
}

export function PoolHeader({ label, current, max, accentColor }: PoolHeaderProps) {
  const percentage = max > 0 ? (current / max) * 100 : 0

  return (
    <YStack paddingHorizontal={16} gap={8}>
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize={14} color="$placeholderColor" fontWeight="600" textTransform="uppercase">
          {label}
        </Text>
        <Text fontSize={24} color="$color" fontWeight="700">
          {current} / {max}
        </Text>
      </XStack>
      {/* Progress bar */}
      <YStack
        height={8}
        backgroundColor="$borderColor"
        borderRadius={4}
        overflow="hidden"
      >
        <YStack
          height="100%"
          width={`${percentage}%`}
          backgroundColor={accentColor}
          borderRadius={4}
        />
      </YStack>
    </YStack>
  )
}
