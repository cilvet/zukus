import { Pressable, StyleSheet, View } from 'react-native'
import { Text, YStack, XStack } from 'tamagui'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faHatWizard } from '@fortawesome/free-solid-svg-icons/faHatWizard'
import { faDiceD20 } from '@fortawesome/free-solid-svg-icons/faDiceD20'
import { useTheme } from '../ui'
import { SafeAreaBottomSpacer } from '../components/layout'

type HomeOption = {
  key: string
  label: string
  description: string
  icon: 'user' | 'book' | 'cog'
  faIcon?: typeof faHatWizard
  route: string
}

const HOME_OPTIONS: HomeOption[] = [
  {
    key: 'characters',
    label: 'Mis Personajes',
    description: 'Gestiona tus personajes de D&D',
    icon: 'user',
    route: '/characters',
  },
  {
    key: 'dice',
    label: 'Dados',
    description: 'Lanza dados virtuales',
    icon: 'user',
    faIcon: faDiceD20,
    route: '/dice',
  },
  {
    key: 'chat',
    label: 'Chat',
    description: 'Asistente de D&D con IA',
    icon: 'user',
    faIcon: faHatWizard,
    route: '/chat',
  },
  {
    key: 'compendiums',
    label: 'Compendios',
    description: 'Consulta reglas y contenido',
    icon: 'book',
    route: '/compendiums',
  },
  {
    key: 'settings',
    label: 'Ajustes',
    description: 'Configura la aplicacion',
    icon: 'cog',
    route: '/settings',
  },
]

/**
 * Pantalla inicial de la app en mobile.
 * Muestra cards/botones para navegar a las diferentes secciones.
 */
export function HomeScreen() {
  const { themeColors } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  function handleOptionPress(route: string) {
    router.push(route as any)
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 16,
          paddingBottom: 16,
        }}
      >
        {/* Header */}
        <YStack paddingHorizontal={20} marginBottom={32}>
          <Text fontSize={28} fontWeight="700" color="$color">
            Zukus
          </Text>
          <Text fontSize={14} color="$placeholderColor" marginTop={4}>
            Tu companero de D&D 3.5
          </Text>
        </YStack>

        {/* Options Grid */}
        <YStack paddingHorizontal={16} gap={12}>
          {HOME_OPTIONS.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => handleOptionPress(option.route)}
              style={({ pressed }) => [
                styles.optionCard,
                {
                  backgroundColor: themeColors.uiBackgroundColor,
                  borderColor: themeColors.borderColor,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <XStack alignItems="center" gap={16} padding={16}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: themeColors.backgroundHover },
                  ]}
                >
                  {option.faIcon ? (
                    <FontAwesomeIcon
                      icon={option.faIcon as any}
                      size={24}
                      color={themeColors.color}
                    />
                  ) : (
                    <FontAwesome name={option.icon} size={24} color={themeColors.color} />
                  )}
                </View>
                <YStack flex={1}>
                  <Text fontSize={16} fontWeight="600" color="$color">
                    {option.label}
                  </Text>
                  <Text fontSize={12} color="$placeholderColor" marginTop={2}>
                    {option.description}
                  </Text>
                </YStack>
                <FontAwesome name="chevron-right" size={14} color={themeColors.placeholderColor} />
              </XStack>
            </Pressable>
          ))}
        </YStack>
      </View>
      <SafeAreaBottomSpacer />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  optionCard: {
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
