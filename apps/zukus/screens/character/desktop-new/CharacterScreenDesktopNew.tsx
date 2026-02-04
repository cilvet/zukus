import { YStack, Text } from 'tamagui'
import { useLocalSearchParams } from 'expo-router'
import { useCharacterSync } from '../../../hooks'
import { CharacterScreenContent } from './CharacterScreenContent'

/**
 * Desktop character screen (new DnD Beyond-inspired layout).
 * Handles loading states and delegates to CharacterScreenContent.
 */
export function CharacterScreenDesktopNew() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const characterId = id ?? ''
  const { isLoading, error } = useCharacterSync(characterId)

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

  return <CharacterScreenContent />
}
