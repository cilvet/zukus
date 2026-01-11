import { Stack } from 'expo-router'
import { themes } from '@zukus/ui'

const CURRENT_THEME = 'zukus' as keyof typeof themes
const theme = themes[CURRENT_THEME]

export default function SpellsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
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
