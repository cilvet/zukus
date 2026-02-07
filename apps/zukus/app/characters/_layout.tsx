import { useState } from 'react'
import { Stack, useRouter } from 'expo-router'
import { ActivityIndicator, Platform, Pressable, useWindowDimensions } from 'react-native'
import { YStack } from 'tamagui'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useTheme } from '../../ui'
import { Topbar } from '../../components/layout'
import { characterRepository } from '../../services/characterRepository'

const DESKTOP_BREAKPOINT = 768

function CreateCharacterButton() {
  const { themeColors } = useTheme()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (isCreating) return
    setIsCreating(true)
    try {
      const id = await characterRepository.create()
      setIsCreating(false)
      router.push({
        pathname: '/characters/edit/[id]',
        params: { id },
      })
    } catch {
      setIsCreating(false)
    }
  }

  return (
    <Pressable onPress={handleCreate} disabled={isCreating} hitSlop={8}>
      {isCreating ? (
        <ActivityIndicator size="small" color={themeColors.color} style={{ marginRight: 8 }} />
      ) : (
        <FontAwesome name="plus" size={20} color={themeColors.color} style={{ marginRight: 8 }} />
      )}
    </Pressable>
  )
}

export default function CharactersLayout() {
  const { themeColors } = useTheme()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isWebDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT

  const stackContent = (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: themeColors.background,
        },
        headerTintColor: themeColors.color,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: themeColors.background,
        },
        animation: 'ios_from_right',
        animationDuration: 200,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        // En desktop web, ocultar headers porque tenemos Topbar
        headerShown: !isWebDesktop,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Mis Personajes',
          headerLeft: () => (
            <Pressable onPress={() => router.replace('/home')} hitSlop={8}>
              <FontAwesome name="home" size={22} color={themeColors.color} style={{ marginLeft: 8 }} />
            </Pressable>
          ),
          headerRight: () => <CreateCharacterButton />,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: '',
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: '',
        }}
      />
      <Stack.Screen
        name="detail/[...slug]"
        options={{
          title: 'Detalle',
        }}
      />
      <Stack.Screen
        name="formula-playground"
        options={{
          title: 'Formula Playground',
        }}
      />
    </Stack>
  )

  // Desktop web: envolver con Topbar
  if (isWebDesktop) {
    return (
      <YStack flex={1} backgroundColor={themeColors.background}>
        <Topbar />
        {stackContent}
      </YStack>
    )
  }

  // Mobile: solo el stack con headers normales
  return stackContent
}
