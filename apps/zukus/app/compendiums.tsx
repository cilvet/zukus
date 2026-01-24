import { View } from 'react-native'
import { Text, YStack } from 'tamagui'
import { useTheme } from '../ui'
import { SafeAreaBottomSpacer } from '../components/layout'

export default function CompendiumsScreen() {
  const { themeColors } = useTheme()

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <YStack flex={1} padding="$4" backgroundColor="$background">
        <Text fontSize={14} color="$placeholderColor">
          Proximamente...
        </Text>
      </YStack>
      <SafeAreaBottomSpacer />
    </View>
  )
}
