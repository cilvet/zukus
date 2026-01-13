import { ScrollView, StyleSheet } from 'react-native'
import { Text, YStack, XStack } from 'tamagui'
import { useTheme } from '@zukus/ui'

export function InventorySection() {
  const { themeColors } = useTheme()

  const items = [
    { name: 'Staff of Power', quantity: 1, weight: '4 lb' },
    { name: 'Spellbook', quantity: 1, weight: '3 lb' },
    { name: 'Component Pouch', quantity: 1, weight: '2 lb' },
    { name: 'Robe of the Archmagi', quantity: 1, weight: '4 lb' },
    { name: 'Healing Potion', quantity: 5, weight: '0.5 lb' },
    { name: 'Gold Pieces', quantity: 450, weight: '9 lb' },
  ]

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <YStack padding={16} gap={12}>
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={18} fontWeight="700" color="$color">
            Inventory
          </Text>
          <Text fontSize={12} color="$placeholderColor">
            22.5 / 150 lb
          </Text>
        </XStack>
        {items.map((item, index) => (
          <XStack
            key={index}
            padding={12}
            backgroundColor="$uiBackgroundColor"
            borderRadius={8}
            borderWidth={1}
            borderColor="$borderColor"
            justifyContent="space-between"
            alignItems="center"
          >
            <YStack flex={1}>
              <Text fontSize={14} fontWeight="600" color="$color">
                {item.name}
              </Text>
              <Text fontSize={11} color="$placeholderColor">
                {item.weight}
              </Text>
            </YStack>
            <Text fontSize={13} color="$colorFocus">
              × {item.quantity}
            </Text>
          </XStack>
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
