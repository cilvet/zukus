import { ScrollView, StyleSheet } from 'react-native'
import { Text, YStack, XStack } from 'tamagui'
import { useTheme } from '../../../ui'

export function FeaturesSection() {
  const { themeColors } = useTheme()

  const features = [
    { name: 'Spellcasting', description: 'You can cast wizard spells from your spellbook.' },
    { name: 'Arcane Recovery', description: 'Once per day when you finish a short rest, you can recover spell slots.' },
    { name: 'Arcane Tradition', description: 'School of Evocation - sculpt your spells to harm foes while protecting allies.' },
    { name: 'Potent Cantrip', description: 'Your damaging cantrips affect even creatures that avoid the brunt of the effect.' },
    { name: 'Spell Mastery', description: 'Choose a 1st and 2nd level spell to cast at will.' },
  ]

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <YStack padding={16} gap={12}>
        <Text fontSize={18} fontWeight="700" color="$color">
          Features & Traits
        </Text>
        {features.map((feature, index) => (
          <YStack
            key={index}
            padding={12}
            backgroundColor="$uiBackgroundColor"
            borderRadius={8}
            borderWidth={1}
            borderColor="$borderColor"
            gap={4}
          >
            <Text fontSize={14} fontWeight="600" color="$color">
              {feature.name}
            </Text>
            <Text fontSize={12} color="$placeholderColor">
              {feature.description}
            </Text>
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
