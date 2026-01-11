import { Stack } from 'expo-router'
import { TamaguiProvider, Theme } from 'tamagui'
import { config, themes } from '@zukus/ui'
import { useFonts } from 'expo-font'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// Por ahora usamos un tema fijo, luego se puede hacer dinámico con Context
const CURRENT_THEME = 'zukus' as keyof typeof themes

export default function RootLayout() {
  const [loaded] = useFonts({
    // Las fuentes se cargarán cuando las configuremos
  })

  const theme = themes[CURRENT_THEME]

  useEffect(() => {
    if (Platform.OS === 'android') {
      import('expo-navigation-bar').then((NavigationBar) => {
        NavigationBar.setBackgroundColorAsync(theme.background)
        NavigationBar.setButtonStyleAsync('light')
      })
    }
  }, [theme.background])

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.background }}>
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
    </SafeAreaProvider>
  )
}
