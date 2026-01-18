import { Text, YStack } from 'tamagui'

export default function CompendiumsScreen() {
  return (
    <YStack flex={1} padding="$4" backgroundColor="$background">
      <Text fontSize={24} fontWeight="700" color="$color">
        Mis compendios
      </Text>
      <Text fontSize={14} color="$placeholderColor" marginTop="$2">
        Proximamente...
      </Text>
    </YStack>
  )
}
