import { useState, useEffect, useCallback } from 'react'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'bookmarkedSkills'

type UseBookmarkedSkillsResult = {
  bookmarkedSkills: string[]
  toggleBookmark: (skillId: string) => void
  isBookmarked: (skillId: string) => boolean
}

/**
 * Hook para gestionar skills marcadas como favoritas.
 * - Web: usa localStorage
 * - Mobile: usa AsyncStorage
 */
export function useBookmarkedSkills(): UseBookmarkedSkillsResult {
  const [bookmarkedSkills, setBookmarkedSkills] = useState<string[]>([])

  // Cargar bookmarks al montar
  useEffect(() => {
    loadBookmarks()
  }, [])

  const loadBookmarks = async () => {
    try {
      if (Platform.OS === 'web') {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          setBookmarkedSkills(JSON.parse(stored))
        }
      } else {
        const stored = await AsyncStorage.getItem(STORAGE_KEY)
        if (stored) {
          setBookmarkedSkills(JSON.parse(stored))
        }
      }
    } catch (error) {
      console.error('Error loading bookmarked skills:', error)
    }
  }

  const saveBookmarks = async (newBookmarks: string[]) => {
    try {
      const jsonValue = JSON.stringify(newBookmarks)
      if (Platform.OS === 'web') {
        localStorage.setItem(STORAGE_KEY, jsonValue)
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, jsonValue)
      }
    } catch (error) {
      console.error('Error saving bookmarked skills:', error)
    }
  }

  const toggleBookmark = useCallback((skillId: string) => {
    setBookmarkedSkills((prev) => {
      const isCurrentlyBookmarked = prev.includes(skillId)
      const updated = isCurrentlyBookmarked
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
      
      saveBookmarks(updated)
      return updated
    })
  }, [])

  const isBookmarked = useCallback(
    (skillId: string) => bookmarkedSkills.includes(skillId),
    [bookmarkedSkills]
  )

  return {
    bookmarkedSkills,
    toggleBookmark,
    isBookmarked,
  }
}
