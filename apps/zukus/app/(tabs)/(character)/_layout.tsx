import { Stack } from 'expo-router'
import { Platform, useWindowDimensions } from 'react-native'
import { useTheme } from '../../../ui'

const DESKTOP_BREAKPOINT = 768

export default function CharacterLayout() {
  const { width } = useWindowDimensions()
  const { themeColors } = useTheme()
  const isWebDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT

  // En desktop web: sin header (usamos el Side Panel)
  // En mobile: header con navegación stack
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
          title: 'Personajes',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Detalle',
        }}
      />
      <Stack.Screen
        name="detail/[...slug]"
        options={{
          title: 'Detalle',
        }}
      />
      <Stack.Screen
        name="ability/[id]"
        options={{
          title: 'Habilidad',
        }}
      />
    </Stack>
  )
}
