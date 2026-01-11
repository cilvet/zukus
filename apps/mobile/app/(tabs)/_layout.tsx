import { Tabs } from 'expo-router'
import { themes } from '@zukus/ui'
import { Text, View, Platform, useWindowDimensions } from 'react-native'
import { YStack } from 'tamagui'
import { Topbar } from '../../components/layout'

const CURRENT_THEME = 'zukus' as keyof typeof themes
const theme = themes[CURRENT_THEME]

const DESKTOP_BREAKPOINT = 768

type TabIconProps = {
  label: string
  focused: boolean
}

function TabIcon({ label, focused }: TabIconProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 8,
      }}
    >
      <Text
        style={{
          fontSize: 10,
          fontWeight: focused ? '700' : '400',
          color: focused ? theme.tabBarActive : theme.tabBarInactive,
        }}
      >
        {label}
      </Text>
    </View>
  )
}

export default function TabsLayout() {
  const { width } = useWindowDimensions()
  const isWebDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT

  // En desktop web: ocultar tabs, mostrar topbar
  if (isWebDesktop) {
    return (
      <YStack flex={1} backgroundColor={theme.background}>
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
          backgroundColor: theme.tabBarBackground,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="(character)"
        options={{
          title: 'Personaje',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="👤" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(spells)"
        options={{
          title: 'Conjuros',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="✨" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="⚙️" focused={focused} />
          ),
        }}
      />
    </Tabs>
  )
}
