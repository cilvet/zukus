import { Stack, useRouter, useSegments } from 'expo-router'
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native'
import { TamaguiProvider, Theme, PortalProvider } from 'tamagui'
import { config, ThemeProvider, useTheme } from '../ui'
import { useFonts } from 'expo-font'
import { useMemo, useEffect } from 'react'
import { Platform, useWindowDimensions } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { AuthProvider, useAuth } from '../contexts'
import { LocalizedCompendiumProvider } from '../ui/components/EntityProvider/CompendiumContext'

const DESKTOP_BREAKPOINT = 768

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
  const { session, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const segments = useSegments()
  const { width } = useWindowDimensions()

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

  useEffect(() => {
    if (isAuthLoading) return
    const [rootSegment] = segments
    const inAuthGroup = rootSegment === '(auth)'

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login')
      return
    }

    if (session && inAuthGroup) {
      // Mobile va a /home, desktop va directo a characters
      const isWebDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT
      if (isWebDesktop) {
        router.replace('/characters')
      } else {
        router.replace('/home')
      }
    }
  }, [isAuthLoading, segments, router, session, width])

  if (isLoading) {
    return null
  }

  return (
    <TamaguiProvider config={config}>
      <Theme name={themeName}>
        <PortalProvider>
          <BottomSheetModalProvider>
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
            <Stack.Screen name="home" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            {/* Rutas de nivel superior para mobile */}
            <Stack.Screen name="characters" />
            <Stack.Screen
              name="dice"
              options={{
                headerShown: true,
                headerTitle: 'Dados',
                headerStyle: { backgroundColor: themeColors.background },
                headerTintColor: themeColors.color,
              }}
            />
            <Stack.Screen
              name="compendiums"
              options={{
                headerShown: true,
                headerTitle: 'Compendios',
                headerStyle: { backgroundColor: themeColors.background },
                headerTintColor: themeColors.color,
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                headerShown: true,
                headerTitle: 'Ajustes',
                headerStyle: { backgroundColor: themeColors.background },
                headerTintColor: themeColors.color,
              }}
            />
            <Stack.Screen
              name="chat"
              options={{
                headerShown: true,
                headerTitle: 'Chat',
                headerStyle: {
                  backgroundColor: themeColors.background,
                },
                headerTintColor: themeColors.color,
                headerTitleStyle: {
                  fontWeight: '600',
                },
              }}
            />
            </Stack>
          </NavigationThemeProvider>
          </BottomSheetModalProvider>
        </PortalProvider>
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
        <KeyboardProvider>
          <ThemeProvider>
            <AuthProvider>
              <LocalizedCompendiumProvider>
                <ThemedApp />
              </LocalizedCompendiumProvider>
            </AuthProvider>
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
