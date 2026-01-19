import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { Button, ScrollView, Separator, Text, YStack } from 'tamagui'
import { useAuth } from '../../contexts'
import { listCharactersFromServer } from '../../services/characterServerRepository'
import type { CharacterListItem } from '../../services/characterRepository'

export function CharacterServerListScreen() {
  const router = useRouter()
  const { session } = useAuth()

  const [characters, setCharacters] = useState<CharacterListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const accessToken = session?.access_token

    if (!accessToken) {
      setCharacters([])
      setError('Debes iniciar sesion para ver la lista.')
      setIsLoading(false)
      return () => {
        isMounted = false
      }
    }

    const loadCharacters = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await listCharactersFromServer(accessToken)
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
  }, [session?.access_token])

  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack padding="$4" gap="$3">
        <Button onPress={() => router.back()} alignSelf="flex-start">
          Volver
        </Button>
        <Text fontSize={20} fontWeight="700" color="$color">
          Personajes desde el server
        </Text>

        {isLoading ? <Text color="$placeholderColor">Cargando personajes...</Text> : null}

        {error ? <Text color="$colorFocus">{error}</Text> : null}

        {!isLoading && !error && characters.length === 0 ? (
          <Text color="$placeholderColor">No hay personajes disponibles.</Text>
        ) : null}
      </YStack>

      <YStack>
        {characters.map((character, index) => (
          <YStack key={character.id} padding="$4" gap="$1">
            <Text fontSize={16} fontWeight="600" color="$color">
              {character.name}
            </Text>
            {index < characters.length - 1 ? <Separator borderColor="$borderColor" /> : null}
          </YStack>
        ))}
      </YStack>
    </ScrollView>
  )
}
