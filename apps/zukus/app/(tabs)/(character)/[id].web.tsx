import { useLocalSearchParams } from 'expo-router'
import { useWindowDimensions } from 'react-native'
import { Text, YStack } from 'tamagui'
import { CharacterScreen, CharacterScreenDesktop } from '../../../screens'
import { useCharacterSync } from '../../../hooks'

const DESKTOP_BREAKPOINT = 768

export default function CharacterDetailRouteWeb() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { width } = useWindowDimensions()
  const characterId = id ?? ''
  const { isLoading, error } = useCharacterSync(characterId)
  const isDesktop = width >= DESKTOP_BREAKPOINT

  if (!characterId) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Text color="$placeholderColor">Personaje invalido.</Text>
      </YStack>
    )
  }

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Text color="$placeholderColor">Cargando personaje...</Text>
      </YStack>
    )
  }

  if (error) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Text color="$colorFocus">{error}</Text>
      </YStack>
    )
  }

  if (isDesktop) {
    return <CharacterScreenDesktop />
  }

  return <CharacterScreen />
}
