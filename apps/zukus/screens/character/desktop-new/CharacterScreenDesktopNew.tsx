import { YStack, Text, Spinner } from 'tamagui'
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

  if (isLoading || error) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" color="$accentColor" />
      </YStack>
    )
  }

  return <CharacterScreenContent />
}
