import { ScrollView, StyleSheet } from 'react-native'
import { Text, YStack } from 'tamagui'
import { useTheme } from '../../../ui'

export function DescriptionSection() {
  const { themeColors } = useTheme()

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <YStack padding={16} gap={16}>
        <YStack gap={8}>
          <Text fontSize={18} fontWeight="700" color="$color">
            Character Description
          </Text>
          <YStack gap={6}>
            <InfoRow label="Age" value="127 years" />
            <InfoRow label="Height" value="5'8&quot;" />
            <InfoRow label="Weight" value="145 lb" />
            <InfoRow label="Eyes" value="Golden" />
            <InfoRow label="Skin" value="Dark crimson" />
            <InfoRow label="Hair" value="Black with silver streaks" />
          </YStack>
        </YStack>

        <YStack gap={8}>
          <Text fontSize={16} fontWeight="600" color="$color">
            Appearance
          </Text>
          <Text fontSize={13} color="$placeholderColor" lineHeight={20}>
            A tall tiefling with dark crimson skin and curved horns that sweep back from the forehead. Golden eyes that
            seem to glow faintly in dim light. Wears flowing robes adorned with arcane symbols.
          </Text>
        </YStack>

        <YStack gap={8}>
          <Text fontSize={16} fontWeight="600" color="$color">
            Backstory
          </Text>
          <Text fontSize={13} color="$placeholderColor" lineHeight={20}>
            Born to a family of scholars in Waterdeep, showed exceptional magical talent from an early age. Studied at
            the prestigious Blackstaff Academy before setting out on adventures to uncover ancient magical artifacts.
          </Text>
        </YStack>

        <YStack gap={8}>
          <Text fontSize={16} fontWeight="600" color="$color">
            Personality Traits
          </Text>
          <Text fontSize={13} color="$placeholderColor" lineHeight={20}>
            Curious and scholarly, always seeking new knowledge. Values intelligence and preparation over brute force.
            Can be overly cautious when faced with the unknown.
          </Text>
        </YStack>
      </YStack>
    </ScrollView>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <YStack
      padding={10}
      backgroundColor="$uiBackgroundColor"
      borderRadius={6}
      borderWidth={1}
      borderColor="$borderColor"
    >
      <Text fontSize={10} color="$placeholderColor" textTransform="uppercase" marginBottom={2}>
        {label}
      </Text>
      <Text fontSize={13} color="$color">
        {value}
      </Text>
    </YStack>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
