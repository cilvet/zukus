import { Stack } from 'expo-router'
import { TamaguiProvider, Theme } from 'tamagui'
import { config, themes } from '@zukus/ui'
import { useFonts } from 'expo-font'
import { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

// Por ahora usamos un tema fijo, luego se puede hacer dinámico con Context
const CURRENT_THEME = 'zukus' as keyof typeof themes

export default function RootLayout() {
  const [loaded] = useFonts({
    // Las fuentes se cargarán cuando las configuremos
  })

  const theme = themes[CURRENT_THEME]

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={config}>
        <Theme name={CURRENT_THEME}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </Theme>
      </TamaguiProvider>
    </GestureHandlerRootView>
  )
}
