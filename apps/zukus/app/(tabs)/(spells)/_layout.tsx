import { Stack } from 'expo-router'
import { Platform, useWindowDimensions } from 'react-native'
import { useTheme } from '@zukus/ui'

const DESKTOP_BREAKPOINT = 768

export default function SpellsLayout() {
  const { width } = useWindowDimensions()
  const { themeColors } = useTheme()
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
        contentStyle: {
          backgroundColor: themeColors.background,
        },
        animation: 'ios_from_right',
        animationDuration: 200,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Conjuros',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Detalle',
        }}
      />
      <Stack.Screen
        name="component/[id]"
        options={{
          title: 'Componente',
        }}
      />
    </Stack>
  )
}
