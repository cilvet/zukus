import { useEffect, useMemo, useState } from 'react'
import { Pressable, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { useAuth } from '../../contexts'
import { SupabaseCharacterRepository, type CharacterListItem } from '../../services/characterRepository'

const DESKTOP_BREAKPOINT = 768

function formatModified(value: string | null) {
  if (!value) return 'Sin cambios'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin cambios'
  return date.toLocaleString()
}

export function CharacterListScreen() {
  const router = useRouter()
  const { session } = useAuth()
  const { width } = useWindowDimensions()
  const isDesktop = width >= DESKTOP_BREAKPOINT
  const repository = useMemo(() => new SupabaseCharacterRepository(), [])

  const [characters, setCharacters] = useState<CharacterListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return

    let isMounted = true

    const loadCharacters = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await repository.listByUser()
        if (isMounted) {
          setCharacters(data)
          setIsLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Error al cargar personajes'
          setError(message)
          setIsLoading(false)
        }
      }
    }

    loadCharacters()

    return () => {
      isMounted = false
    }
  }, [repository, session])

  return (
    <ScrollView flex={1} backgroundColor="$background" contentContainerStyle={{ padding: 24 }}>
      <YStack
        width={isDesktop ? 680 : '100%'}
        alignSelf="center"
        gap="$4"
      >
        <YStack gap="$2">
          <Text fontSize={24} fontWeight="700" color="$color">
            Personajes
          </Text>
          <Text fontSize={13} color="$placeholderColor">
            Selecciona un personaje para abrir la ficha.
          </Text>
        </YStack>

        {isLoading ? (
          <YStack padding="$4" borderRadius="$4" borderWidth={1} borderColor="$borderColor">
            <Text color="$placeholderColor">Cargando personajes...</Text>
          </YStack>
        ) : null}

        {error ? (
          <YStack padding="$4" borderRadius="$4" borderWidth={1} borderColor="$borderColor">
            <Text color="$colorFocus">{error}</Text>
          </YStack>
        ) : null}

        {!isLoading && !error && characters.length === 0 ? (
          <YStack padding="$4" borderRadius="$4" borderWidth={1} borderColor="$borderColor">
            <Text color="$placeholderColor">No hay personajes disponibles.</Text>
          </YStack>
        ) : null}

        <YStack gap="$2">
          {characters.map((character) => (
            <Pressable
              key={character.id}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/(character)/[id]',
                  params: { id: character.id },
                })
              }
            >
              {({ pressed }) => (
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  padding="$4"
                  borderRadius="$4"
                  borderWidth={1}
                  borderColor="$borderColor"
                  backgroundColor={pressed ? '$backgroundPress' : '$background'}
                >
                  <YStack gap="$1" flex={1}>
                    <Text fontSize={16} fontWeight="600" color="$color" numberOfLines={1}>
                      {character.name}
                    </Text>
                    <Text fontSize={11} color="$placeholderColor">
                      {formatModified(character.modified)}
                    </Text>
                  </YStack>
                  <Text fontSize={18} color="$placeholderColor">
                    →
                  </Text>
                </XStack>
              )}
            </Pressable>
          ))}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
