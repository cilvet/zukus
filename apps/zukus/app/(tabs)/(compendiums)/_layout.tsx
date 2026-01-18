import { Stack } from 'expo-router'
import { useTheme } from '../../../ui'

export default function CompendiumsLayout() {
  const { themeColors } = useTheme()

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: themeColors.background,
        },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  )
}
