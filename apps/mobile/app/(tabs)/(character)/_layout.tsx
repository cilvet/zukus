import { Stack } from 'expo-router'
import { Platform, useWindowDimensions } from 'react-native'
import { themes } from '@zukus/ui'

const CURRENT_THEME = 'zukus' as keyof typeof themes
const theme = themes[CURRENT_THEME]

const DESKTOP_BREAKPOINT = 768

export default function CharacterLayout() {
  const { width } = useWindowDimensions()
  const isWebDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT

  // En desktop web: sin header (usamos el Side Panel)
  // En mobile: header con navegación stack
  return (
    <Stack
      screenOptions={{
        headerShown: !isWebDesktop,
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.color,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: theme.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Personaje',
        }}
      />
      <Stack.Screen
        name="[id]"
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
