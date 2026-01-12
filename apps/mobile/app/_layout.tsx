import { Stack } from 'expo-router'
import { TamaguiProvider, Theme } from 'tamagui'
import { config, ThemeProvider, useTheme } from '@zukus/ui'
import { useFonts } from 'expo-font'
import { useEffect } from 'react'
import { Platform, View, ActivityIndicator } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as NavigationBar from 'expo-navigation-bar'

function RootLayoutContent() {
  const { themeName, themeColors, isLoading } = useTheme()

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(themeColors.background)
      NavigationBar.setButtonStyleAsync('light')
    }
  }, [themeColors.background])

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#2e1a47', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#f3ca58" />
      </View>
    )
  }

  return (
    <TamaguiProvider config={config}>
      <Theme name={themeName}>
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
      </Theme>
    </TamaguiProvider>
  )
}

export default function RootLayout() {
  const [loaded] = useFonts({
    // Las fuentes se cargarán cuando las configuremos
  })

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
