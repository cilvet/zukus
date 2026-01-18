import { View, StyleSheet } from 'react-native'
import { Text, YStack, ScrollView } from 'tamagui'
import { useLocalSearchParams } from 'expo-router'
import { useTheme, useCharacterSheet } from '../../ui'
import { useCharacterSync } from '../../hooks'
import { LevelEditor, AbilityScoresEditor } from '../../ui/components/character/editor'

/**
 * Pantalla de edicion de personaje para web.
 * Permite editar niveles, clases y ability scores.
 */
export function EditCharacterScreen() {
  const { themeColors } = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const characterId = id ?? ''
  const { isLoading, error } = useCharacterSync(characterId)
  const characterSheet = useCharacterSheet()

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
        <YStack gap="$6" paddingVertical="$4" paddingHorizontal="$4" maxWidth={600} width="100%" alignSelf="center">
          <LevelEditor />
          <AbilityScoresEditor />
        </YStack>
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
