import { Stack } from 'expo-router'
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native'
import { TamaguiProvider, Theme } from 'tamagui'
import { config, ThemeProvider, useTheme } from '../ui'
import { useFonts } from 'expo-font'
import { useMemo, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Platform } from 'react-native'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// React Scan solo en desarrollo y web
let reactScanInitialized = false
if (__DEV__ && typeof window !== 'undefined') {
  try {
    const { scan } = require('react-scan')
    scan({
      enabled: true,
      log: true,
    })
    reactScanInitialized = true
  } catch (error) {
    // react-scan no disponible o error al cargar
    console.warn('react-scan no pudo inicializarse:', error)
  }
}

function ThemedApp() {
  const { themeName, themeColors, isLoading } = useTheme()

  // Create a navigation theme that matches our app theme
  const navigationTheme = useMemo(() => ({
    dark: true,
    colors: {
      primary: themeColors.color,
      background: themeColors.background,
      card: themeColors.background,
      text: themeColors.color,
      border: themeColors.borderColor,
      notification: themeColors.colorFocus,
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400' as const,
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700' as const,
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '800' as const,
      },
    },
  }), [themeColors])

  if (isLoading) {
    return null
  }

  return (
    <TamaguiProvider config={config}>
      <Theme name={themeName}>
        <NavigationThemeProvider value={navigationTheme}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: themeColors.background },
              animation: 'ios_from_right',
              animationDuration: 200,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </NavigationThemeProvider>
      </Theme>
    </TamaguiProvider>
  )
}

export default function RootLayout() {
  const [loaded] = useFonts({
    // Las fuentes se cargarán cuando las configuremos
  })

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
