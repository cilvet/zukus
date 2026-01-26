/**
 * Layout para la seccion de Compendios.
 *
 * IMPORTANTE - PATRON PARA OCULTAR HEADER EN DESKTOP:
 * ====================================================
 * Este layout usa Stack para navegacion interna. En desktop web,
 * el Topbar ya esta presente desde (tabs)/_layout.tsx, por lo que
 * debemos ocultar el header del Stack.
 *
 * La clave es usar `headerShown: !isWebDesktop` en screenOptions.
 * Si el header sigue apareciendo, verificar:
 * 1. Que isWebDesktop se calcula correctamente (Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT)
 * 2. Que no hay un headerShown: true en las opciones individuales de cada Screen
 * 3. Que el componente se re-renderiza cuando cambia el tamaño de ventana
 *
 * Ver tambien: /characters/_layout.tsx para rutas fuera de (tabs)
 */
import { Stack, useRouter } from 'expo-router'
import { Platform, useWindowDimensions, Pressable } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useTheme } from '../../../ui'

const DESKTOP_BREAKPOINT = 768

export default function CompendiumsLayout() {
  const { themeColors } = useTheme()
  const { width } = useWindowDimensions()
  const router = useRouter()

  // Desktop web: Topbar viene de (tabs)/_layout.tsx, NO mostrar header del Stack
  // Mobile: mostrar header del Stack para navegacion
  const isWebDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT

  return (
    <Stack
      screenOptions={{
        // CRITICO: Ocultar header en desktop porque Topbar ya existe
        headerShown: !isWebDesktop,
        headerStyle: {
          backgroundColor: themeColors.background,
        },
        headerTintColor: themeColors.color,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerLeft: () => (
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <FontAwesome
              name="chevron-left"
              size={18}
              color={themeColors.color}
              style={{ marginLeft: 8 }}
            />
          </Pressable>
        ),
        contentStyle: {
          backgroundColor: themeColors.background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Compendios' }} />
      <Stack.Screen name="[compendiumId]/index" options={{ title: '' }} />
      <Stack.Screen name="[compendiumId]/[entityType]/index" options={{ title: '' }} />
    </Stack>
  )
}
