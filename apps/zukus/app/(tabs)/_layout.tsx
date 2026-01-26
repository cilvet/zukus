import React from 'react'
import { Tabs } from 'expo-router'
import { useTheme } from '../../ui'
import { Platform, useWindowDimensions } from 'react-native'
import { YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { Topbar } from '../../components/layout'

const DESKTOP_BREAKPOINT = 768

type TabBarIconProps = {
  name: React.ComponentProps<typeof FontAwesome>['name']
  color: string
}

function TabBarIcon({ name, color }: TabBarIconProps) {
  return <FontAwesome size={22} style={{ marginBottom: 2 }} name={name} color={color} />
}

export default function TabsLayout() {
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const { themeColors } = useTheme()
  const isWebDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT

  // En desktop web: ocultar tabs, mostrar topbar
  if (isWebDesktop) {
    return (
      <YStack flex={1} backgroundColor={themeColors.background}>
        <Topbar />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tabs.Screen name="(character)" options={{ title: 'Personajes' }} />
          <Tabs.Screen name="(dice)" options={{ title: 'Dados' }} />
          <Tabs.Screen name="compendiums" options={{ title: 'Compendios' }} />
          <Tabs.Screen name="(settings)" options={{ title: 'Ajustes' }} />
        </Tabs>
      </YStack>
    )
  }

  // Mobile (nativo y web mobile): ocultar tabs, navegacion via HomeScreen
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="(character)" options={{ title: 'Personajes' }} />
      <Tabs.Screen name="(dice)" options={{ title: 'Dados' }} />
      <Tabs.Screen name="compendiums" options={{ title: 'Compendios' }} />
      <Tabs.Screen name="(settings)" options={{ title: 'Ajustes' }} />
    </Tabs>
  )
}
