import { Stack, useRouter } from 'expo-router'
import { Pressable } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useTheme } from '../../ui'

export default function CharactersLayout() {
  const { themeColors } = useTheme()
  const router = useRouter()

  return (
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
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: '',
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          headerShown: true,
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
}
