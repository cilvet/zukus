import { useEffect, useState } from 'react'
import { Platform, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../contexts'
import { characterRepository, type CharacterListItem } from '../services/characterRepository'

const DESKTOP_BREAKPOINT = 768

export function useCharacterList() {
  const router = useRouter()
  const { session } = useAuth()
  const { width } = useWindowDimensions()
  const isWebDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT

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
    // Usar siempre la ruta unificada
    router.push({
      pathname: '/characters/[id]',
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
