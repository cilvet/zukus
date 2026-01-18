import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '../contexts'
import { characterRepository, type CharacterListItem } from '../services/characterRepository'

export function useCharacterList() {
  const router = useRouter()
  const { session } = useAuth()

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
        const data = await characterRepository.listByUser()
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
  }, [session])

  const navigateToCharacter = (characterId: string) => {
    router.push({
      pathname: '/(tabs)/(character)/[id]',
      params: { id: characterId },
    })
  }

  return {
    characters,
    isLoading,
    error,
    navigateToCharacter,
  }
}

export type { CharacterListItem }
