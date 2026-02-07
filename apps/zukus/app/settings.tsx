import { View, Text, ScrollView, XStack, YStack } from 'tamagui'
import { Platform, Pressable, View as RNView } from 'react-native'
import { useTheme } from '../ui'
import { useLocale } from '../ui/hooks/useLocale'
import { SafeAreaBottomSpacer } from '../components/layout'

const AVAILABLE_LANGUAGES = [
  { code: 'es', name: 'Espanol', flag: '\u{1F1EA}\u{1F1F8}' },
  { code: 'en', name: 'English', flag: '\u{1F1EC}\u{1F1E7}' },
] as const

export default function SettingsScreen() {
  'use no memo'
  const { themeName, setTheme, themeInfo, availableThemes, themeColors } = useTheme()
  const { locale, setLocale } = useLocale()

  return (
    <RNView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView flex={1} backgroundColor="$background">

      <YStack padding="$4" borderBottomWidth={1} borderBottomColor="$borderColor">
        <Text
          fontSize={14}
          fontWeight="600"
          color="$colorFocus"
          textTransform="uppercase"
          letterSpacing={1}
          marginBottom="$3"
        >
          Idioma
        </Text>
        <XStack
          alignItems="center"
          backgroundColor="$backgroundHover"
          padding="$4"
          borderRadius="$4"
          borderWidth={1}
          borderColor="$borderColor"
          marginBottom="$3"
        >
          <Text fontSize={28} marginRight="$3">
            {AVAILABLE_LANGUAGES.find((l) => l.code === locale)?.flag ?? '\u{1F310}'}
          </Text>
          <YStack>
            <Text fontSize={18} fontWeight="600" color="$color">
              {AVAILABLE_LANGUAGES.find((l) => l.code === locale)?.name ?? locale}
            </Text>
            <Text fontSize={13} color="$placeholderColor" marginTop="$1">
              Idioma actual
            </Text>
          </YStack>
        </XStack>
        <Text
          fontSize={12}
          fontWeight="600"
          color="$placeholderColor"
          textTransform="uppercase"
          letterSpacing={1}
          marginBottom="$2"
        >
          Idiomas disponibles ({AVAILABLE_LANGUAGES.length})
        </Text>
        <XStack flexWrap="wrap" gap="$3">
          {AVAILABLE_LANGUAGES.map((lang) => {
            const isSelected = lang.code === locale
            return (
              <Pressable key={lang.code} onPress={() => setLocale(lang.code)}>
                <YStack alignItems="center" width={70}>
                  <View
                    width={48}
                    height={48}
                    borderRadius={24}
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={isSelected ? 3 : 1}
                    borderColor={isSelected ? '$colorFocus' : '$borderColor'}
                    backgroundColor="$backgroundHover"
                  >
                    <Text fontSize={22}>{lang.flag}</Text>
                  </View>
                  <Text
                    fontSize={10}
                    color={isSelected ? '$colorFocus' : '$placeholderColor'}
                    fontWeight={isSelected ? '600' : '400'}
                    marginTop="$1"
                    textAlign="center"
                  >
                    {lang.name}
                  </Text>
                </YStack>
              </Pressable>
            )
          })}
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

      <YStack padding="$6" alignItems="center">
        <Text fontSize={14} color="$placeholderColor">
          Zukus v0.0.1
        </Text>
        <Text fontSize={12} color="$placeholderColor" opacity={0.6} marginTop="$1">
          Monorepo Demo
        </Text>
      </YStack>
    </ScrollView>
    <SafeAreaBottomSpacer />
  </RNView>
  )
}
