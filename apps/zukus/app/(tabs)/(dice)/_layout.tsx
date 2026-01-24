import { Stack, useRouter } from 'expo-router'
import { Platform, useWindowDimensions, Pressable } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useTheme } from '../../../ui'

const DESKTOP_BREAKPOINT = 768

export default function DiceLayout() {
  const { themeColors } = useTheme()
  const { width } = useWindowDimensions()
  const router = useRouter()
  const isWebDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT

  return (
    <Stack
      screenOptions={{
        headerShown: !isWebDesktop,
        headerStyle: {
          backgroundColor: themeColors.background,
        },
        headerTintColor: themeColors.color,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerLeft: () => (
          <Pressable onPress={() => router.replace('/home')} hitSlop={8}>
            <FontAwesome name="home" size={22} color={themeColors.color} style={{ marginLeft: 8 }} />
          </Pressable>
        ),
        contentStyle: {
          backgroundColor: themeColors.background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Dados' }} />
    </Stack>
  )
}
