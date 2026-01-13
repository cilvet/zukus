import { ScrollView, StyleSheet } from 'react-native'
import { Text, YStack, XStack } from 'tamagui'
import { useTheme } from '@zukus/ui'

export function ActionsSection() {
  const { themeColors } = useTheme()

  const actions = [
    { name: 'Fireball', type: 'Action', range: '150 ft', damage: '8d6 fire' },
    { name: 'Magic Missile', type: 'Action', range: '120 ft', damage: '3 × (1d4+1) force' },
    { name: 'Shield', type: 'Reaction', range: 'Self', damage: '+5 AC' },
    { name: 'Misty Step', type: 'Bonus Action', range: '30 ft', damage: 'Teleport' },
  ]

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <YStack padding={16} gap={12}>
        <Text fontSize={18} fontWeight="700" color="$color">
          Actions
        </Text>
        {actions.map((action, index) => (
          <YStack
            key={index}
            padding={12}
            backgroundColor="$uiBackgroundColor"
            borderRadius={8}
            borderWidth={1}
            borderColor="$borderColor"
            gap={6}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={14} fontWeight="600" color="$color">
                {action.name}
              </Text>
              <Text fontSize={10} color="$placeholderColor" textTransform="uppercase">
                {action.type}
              </Text>
            </XStack>
            <XStack gap={16}>
              <Text fontSize={12} color="$placeholderColor">
                Range: {action.range}
              </Text>
              <Text fontSize={12} color="$colorFocus">
                {action.damage}
              </Text>
            </XStack>
          </YStack>
        ))}
      </YStack>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
