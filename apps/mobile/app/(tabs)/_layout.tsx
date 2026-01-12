import React from 'react'
import { Tabs } from 'expo-router'
import { useTheme } from '@zukus/ui'
import { Platform, useWindowDimensions } from 'react-native'
import { YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
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
          <Tabs.Screen name="(character)" options={{ title: 'Personaje' }} />
          <Tabs.Screen name="(spells)" options={{ title: 'Conjuros' }} />
          <Tabs.Screen name="(settings)" options={{ title: 'Ajustes' }} />
        </Tabs>
      </YStack>
    )
  }

  // Mobile (nativo y web): mostrar tabs
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.tabBarBackground,
          borderTopColor: themeColors.tabBarBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: themeColors.tabBarActive,
        tabBarInactiveTintColor: themeColors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        sceneStyle: {
          paddingTop: insets.top,
          backgroundColor: themeColors.background,
        },
      }}
    >
      <Tabs.Screen
        name="(character)"
        options={{
          title: 'Personaje',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(spells)"
        options={{
          title: 'Conjuros',
          tabBarIcon: ({ color }) => <TabBarIcon name="magic" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
    </Tabs>
  )
}
