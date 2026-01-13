import { View, Text, ScrollView, XStack, YStack } from 'tamagui'
import { Platform, Pressable } from 'react-native'
import { useTheme } from '@zukus/ui'

export default function SettingsScreen() {
  const { themeName, setTheme, themeInfo, availableThemes } = useTheme()

  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack padding="$4" borderBottomWidth={1} borderBottomColor="$borderColor">
        <Text fontSize={24} fontWeight="bold" color="$color">
          Ajustes
        </Text>
        <Text fontSize={14} color="$placeholderColor" marginTop="$1">
          Configuracion de la aplicacion
        </Text>
      </YStack>

      <YStack padding="$4" borderBottomWidth={1} borderBottomColor="$borderColor">
        <Text
          fontSize={14}
          fontWeight="600"
          color="$colorFocus"
          textTransform="uppercase"
          letterSpacing={1}
          marginBottom="$3"
        >
          Plataforma actual
        </Text>
        <XStack
          justifyContent="space-between"
          paddingVertical="$3"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Text fontSize={15} color="$placeholderColor">
            Sistema
          </Text>
          <Text fontSize={15} fontWeight="600" color="$color">
            {Platform.OS}
          </Text>
        </XStack>
        <XStack justifyContent="space-between" paddingVertical="$3">
          <Text fontSize={15} color="$placeholderColor">
            Version
          </Text>
          <Text fontSize={15} fontWeight="600" color="$color">
            {Platform.Version}
          </Text>
        </XStack>
      </YStack>

      <YStack padding="$4" borderBottomWidth={1} borderBottomColor="$borderColor">
        <Text
          fontSize={14}
          fontWeight="600"
          color="$colorFocus"
          textTransform="uppercase"
          letterSpacing={1}
          marginBottom="$3"
        >
          Tema actual
        </Text>
        <XStack
          alignItems="center"
          backgroundColor="$backgroundHover"
          padding="$4"
          borderRadius="$4"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <View
            width={48}
            height={48}
            borderRadius="$4"
            alignItems="center"
            justifyContent="center"
            borderWidth={2}
            borderColor="$borderColor"
            backgroundColor={themeInfo.colors.background}
          >
            <View
              width={24}
              height={24}
              borderRadius={12}
              backgroundColor={themeInfo.colors.primary}
            />
          </View>
          <YStack marginLeft="$4">
            <Text fontSize={18} fontWeight="600" color="$color">
              {themeInfo.displayName}
            </Text>
            <Text fontSize={13} color="$placeholderColor" marginTop="$1">
              Tema {themeInfo.checkboxVariant}
            </Text>
          </YStack>
        </XStack>
      </YStack>

      <YStack padding="$4" borderBottomWidth={1} borderBottomColor="$borderColor">
        <Text
          fontSize={14}
          fontWeight="600"
          color="$colorFocus"
          textTransform="uppercase"
          letterSpacing={1}
          marginBottom="$3"
        >
          Temas disponibles ({availableThemes.length})
        </Text>
        <XStack flexWrap="wrap" gap="$3">
          {availableThemes.map((t) => {
            const isSelected = t.name === themeName
            return (
              <Pressable key={t.name} onPress={() => setTheme(t.name)}>
                <YStack alignItems="center" width={70}>
                  <View
                    width={48}
                    height={48}
                    borderRadius={24}
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={isSelected ? 3 : 1}
                    borderColor={isSelected ? '$colorFocus' : '$borderColor'}
                    backgroundColor={t.colors.background}
                  >
                    <View
                      width={20}
                      height={20}
                      borderRadius={10}
                      backgroundColor={t.colors.primary}
                    />
                  </View>
                  <Text
                    fontSize={10}
                    color={isSelected ? '$colorFocus' : '$placeholderColor'}
                    fontWeight={isSelected ? '600' : '400'}
                    marginTop="$1"
                    textAlign="center"
                  >
                    {t.displayName}
                  </Text>
                </YStack>
              </Pressable>
            )
          })}
        </XStack>
      </YStack>

      <YStack
        margin="$4"
        padding="$4"
        backgroundColor="$uiBackgroundColor"
        borderRadius="$4"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <Text fontSize={14} fontWeight="600" color="$colorFocus" marginBottom="$2">
          Navegacion
        </Text>
        <Text fontSize={13} color="$placeholderColor" lineHeight={20}>
          Este tab no tiene navegacion anidada.{'\n'}
          Solo contiene esta pantalla de configuracion.{'\n\n'}
          Esto demuestra que cada tab puede tener su propia estructura de navegacion independiente.
        </Text>
      </YStack>

      <YStack padding="$6" alignItems="center">
        <Text fontSize={14} color="$placeholderColor">
          Zukus v0.0.1
        </Text>
        <Text fontSize={12} color="$placeholderColor" opacity={0.6} marginTop="$1">
          Monorepo Demo
        </Text>
      </YStack>
    </ScrollView>
  )
}
