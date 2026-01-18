import { Image, Pressable } from 'react-native'
import { ScrollView, Separator, Text, XStack, YStack } from 'tamagui'
import { useCharacterList } from '../../hooks'

export function CharacterListScreen() {
  const { characters, isLoading, error, navigateToCharacter } = useCharacterList()

  return (
    <ScrollView flex={1} backgroundColor="$background">
      {isLoading ? (
        <YStack padding="$4">
          <Text color="$placeholderColor">Cargando personajes...</Text>
        </YStack>
      ) : null}

      {error ? (
        <YStack padding="$4">
          <Text color="$colorFocus">{error}</Text>
        </YStack>
      ) : null}

      {!isLoading && !error && characters.length === 0 ? (
        <YStack padding="$4">
          <Text color="$placeholderColor">No hay personajes disponibles.</Text>
        </YStack>
      ) : null}

      <YStack>
        {characters.map((character, index) => (
          <YStack key={character.id}>
            <Pressable onPress={() => navigateToCharacter(character.id)}>
              {({ pressed }) => (
                <XStack
                  alignItems="center"
                  paddingVertical="$3"
                  paddingHorizontal="$4"
                  backgroundColor={pressed ? '$backgroundPress' : 'transparent'}
                  gap="$3"
                >
                  {character.imageUrl ? (
                    <Image
                      source={{ uri: character.imageUrl }}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: '#333',
                      }}
                    />
                  ) : (
                    <YStack
                      width={44}
                      height={44}
                      borderRadius={22}
                      backgroundColor="$uiBackgroundColor"
                      borderWidth={2}
                      borderColor="$borderColor"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize={18} fontWeight="700" color="$color">
                        {character.name.charAt(0).toUpperCase()}
                      </Text>
                    </YStack>
                  )}
                  <YStack gap="$0.5" flex={1}>
                    <Text fontSize={16} fontWeight="500" color="$color" numberOfLines={1}>
                      {character.name}
                    </Text>
                    <Text fontSize={12} color="$placeholderColor">
                      {formatModified(character.modified)}
                    </Text>
                  </YStack>
                </XStack>
              )}
            </Pressable>
            {index < characters.length - 1 ? (
              <Separator borderColor="$borderColor" />
            ) : null}
          </YStack>
        ))}
      </YStack>
    </ScrollView>
  )
}

function formatModified(value: string | null) {
  if (!value) return 'Sin cambios'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin cambios'
  return date.toLocaleString()
}
