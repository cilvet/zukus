import { useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, YStack, XStack, ScrollView } from 'tamagui'
import { useLocalSearchParams } from 'expo-router'
import { useTheme, useCharacterSheet, useCharacterStore } from '../../ui'
import { useCharacterSync } from '../../hooks'
import {
  LevelEditor,
  AbilityScoresEditor,
  CharacterInfoSection,
} from '../../ui/components/character/editor'

/**
 * Pantalla de edicion de personaje para web.
 * Muestra las columnas lado a lado en desktop.
 */
export function EditCharacterScreen() {
  const { themeColors } = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const characterId = id ?? ''
  const { isLoading, error } = useCharacterSync(characterId)
  const characterSheet = useCharacterSheet()
  const { updater } = useCharacterStore()

  const handleRequestLevelChange = useCallback((level: number) => {
    if (updater) {
      updater.setCurrentCharacterLevel(level)
    }
  }, [updater])

  if (!characterId) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <Text color="$placeholderColor">Personaje invalido.</Text>
        </View>
      </View>
    )
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <Text color="$placeholderColor">Cargando personaje...</Text>
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <Text color="$colorFocus">{error}</Text>
        </View>
      </View>
    )
  }

  if (!characterSheet) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <Text color="$placeholderColor">Cargando personaje...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView flex={1} contentContainerStyle={styles.scrollContent}>
        <XStack gap="$6" paddingVertical="$4" paddingHorizontal="$4" maxWidth={1000} width="100%" alignSelf="center">
          {/* Columna 1: Info + Abilities */}
          <YStack flex={1} gap="$4">
            <CharacterInfoSection />
            <YStack paddingHorizontal={16}>
              <AbilityScoresEditor />
            </YStack>
          </YStack>

          {/* Columna 2: Niveles */}
          <YStack flex={1} gap="$4">
            <LevelEditor onRequestLevelChange={handleRequestLevelChange} />
          </YStack>
        </XStack>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
