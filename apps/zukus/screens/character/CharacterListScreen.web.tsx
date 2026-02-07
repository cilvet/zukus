import { Image, Pressable, useWindowDimensions } from 'react-native'
import { ScrollView, Separator, Spinner, Text, XStack, YStack } from 'tamagui'
import { useCharacterList, type CharacterListItem } from '../../hooks'

const DESKTOP_BREAKPOINT = 768

export function CharacterListScreen() {
  const { characters, isLoading, isCreating, navigateToCharacter, createCharacter } = useCharacterList()
  const { width } = useWindowDimensions()
  const isDesktop = width >= DESKTOP_BREAKPOINT

  if (!isDesktop) {
    return (
      <MobileList
        characters={characters}
        isLoading={isLoading}
        onSelect={navigateToCharacter}
      />
    )
  }

  return (
    <DesktopGrid
      characters={characters}
      isLoading={isLoading}
      isCreating={isCreating}
      onSelect={navigateToCharacter}
      onCreate={createCharacter}
    />
  )
}

type ListProps = {
  characters: CharacterListItem[]
  isLoading: boolean
  onSelect: (id: string) => void
}

type DesktopGridProps = ListProps & {
  isCreating: boolean
  onCreate: () => void
}

function MobileList({ characters, isLoading, onSelect }: ListProps) {
  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner size="large" color="$accentColor" />
      </YStack>
    )
  }

  return (
    <ScrollView flex={1} backgroundColor="$background">
      {characters.length === 0 ? (
        <YStack padding="$4">
          <Text color="$placeholderColor">No hay personajes disponibles.</Text>
        </YStack>
      ) : null}

      <YStack>
        {characters.map((character, index) => (
          <YStack key={character.id}>
            <Pressable onPress={() => onSelect(character.id)}>
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
                    {character.build ? (
                      <Text fontSize={12} color="$placeholderColor" numberOfLines={1}>
                        {character.build}
                      </Text>
                    ) : null}
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

function DesktopGrid({ characters, isLoading, isCreating, onSelect, onCreate }: DesktopGridProps) {
  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner size="large" color="$accentColor" />
      </YStack>
    )
  }

  return (
    <ScrollView flex={1} backgroundColor="$background" contentContainerStyle={{ padding: 32 }}>
      <YStack width={900} maxWidth="100%" alignSelf="center" gap="$5">
        <YStack gap="$2">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={28} fontWeight="700" color="$color">
              Personajes
            </Text>
            <Pressable onPress={onCreate} disabled={isCreating}>
              {({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => (
                <XStack
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$3"
                  backgroundColor={pressed ? '$accentBackground' : hovered ? '$backgroundHover' : 'transparent'}
                  borderWidth={1}
                  borderColor="$accentColor"
                  alignItems="center"
                  gap="$2"
                  opacity={isCreating ? 0.5 : 1}
                  cursor={isCreating ? 'not-allowed' : 'pointer'}
                >
                  <Text fontSize={16} fontWeight="600" color="$accentColor">+</Text>
                  <Text fontSize={14} fontWeight="500" color="$accentColor">
                    {isCreating ? 'Creando...' : 'Nuevo personaje'}
                  </Text>
                </XStack>
              )}
            </Pressable>
          </XStack>
          <Text fontSize={14} color="$placeholderColor">
            Selecciona un personaje para abrir la ficha.
          </Text>
        </YStack>

        {characters.length === 0 ? (
          <YStack padding="$4" borderRadius="$4" borderWidth={1} borderColor="$borderColor">
            <Text color="$placeholderColor">No hay personajes disponibles.</Text>
          </YStack>
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {characters.map((character) => (
            <Pressable
              key={character.id}
              onPress={() => onSelect(character.id)}
            >
              {({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => (
                <YStack
                  padding="$3"
                  borderRadius="$4"
                  borderWidth={1}
                  borderColor={hovered ? '$accentColor' : '$borderColor'}
                  backgroundColor={pressed ? '$backgroundPress' : hovered ? '$backgroundHover' : '$background'}
                  gap="$3"
                  cursor="pointer"
                  hoverStyle={{ borderColor: '$accentColor' }}
                >
                  <XStack alignItems="center" gap="$3">
                    {character.imageUrl ? (
                      <Image
                        source={{ uri: character.imageUrl }}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 28,
                          backgroundColor: '#333',
                        }}
                      />
                    ) : (
                      <YStack
                        width={56}
                        height={56}
                        borderRadius={28}
                        backgroundColor="$uiBackgroundColor"
                        borderWidth={2}
                        borderColor="$borderColor"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize={22} fontWeight="700" color="$color">
                          {character.name.charAt(0).toUpperCase()}
                        </Text>
                      </YStack>
                    )}
                    <YStack gap="$1" flex={1}>
                      <Text fontSize={18} fontWeight="600" color="$color" numberOfLines={1}>
                        {character.name}
                      </Text>
                      {character.build ? (
                        <Text fontSize={12} color="$placeholderColor" numberOfLines={1}>
                          {character.build}
                        </Text>
                      ) : null}
                    </YStack>
                  </XStack>
                </YStack>
              )}
            </Pressable>
          ))}
        </div>
      </YStack>
    </ScrollView>
  )
}
