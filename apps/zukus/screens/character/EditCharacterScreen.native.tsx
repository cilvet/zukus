import { useRef, useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, YStack, XStack } from 'tamagui'
import { useLocalSearchParams } from 'expo-router'
import { useTheme, useCharacterSheet, useCharacterStore } from '../../ui'
import { SafeAreaBottomSpacer } from '../../components/layout'
import { useCharacterSync } from '../../hooks'
import {
  LevelEditor,
  AbilityScoresEditor,
  CharacterInfoSection,
  EditorPager,
  type EditorPagerRef,
} from '../../ui/components/character/editor'

const EDITOR_PAGES = [
  { key: 'info', label: 'Info' },
  { key: 'abilities', label: 'Abilities' },
  { key: 'levels', label: 'Niveles' },
]

/**
 * Tabs para navegacion entre columnas del editor.
 */
function EditorTabs({
  currentPage,
  onPageChange,
}: {
  currentPage: number
  onPageChange: (index: number) => void
}) {
  return (
    <XStack
      height={44}
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      backgroundColor="$background"
    >
      {EDITOR_PAGES.map((page, index) => {
        const isActive = currentPage === index
        return (
          <YStack
            key={page.key}
            flex={1}
            alignItems="center"
            justifyContent="center"
            onPress={() => onPageChange(index)}
            pressStyle={{ opacity: 0.7 }}
            cursor="pointer"
          >
            <Text
              fontSize={14}
              fontWeight={isActive ? '600' : '400'}
              color={isActive ? '$color' : '$placeholderColor'}
            >
              {page.label}
            </Text>
            {isActive && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '20%',
                  right: '20%',
                  height: 2,
                  backgroundColor: '#fff',
                  borderRadius: 1,
                }}
              />
            )}
          </YStack>
        )
      })}
    </XStack>
  )
}

/**
 * Columna 1: Info basica
 */
function InfoColumn() {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <CharacterInfoSection />
    </ScrollView>
  )
}

/**
 * Columna 2: Ability Scores
 */
function AbilitiesColumn() {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <YStack paddingHorizontal={16}>
        <AbilityScoresEditor />
      </YStack>
    </ScrollView>
  )
}

/**
 * Columna 3: Niveles
 */
function LevelsColumn({
  onRequestLevelChange,
}: {
  onRequestLevelChange: (level: number) => void
}) {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <LevelEditor onRequestLevelChange={onRequestLevelChange} />
    </ScrollView>
  )
}

/**
 * Pantalla de edicion de personaje para mobile.
 * Usa ViewPager para swipe entre columnas.
 */
export function EditCharacterScreen() {
  const { themeColors } = useTheme()
  const { id } = useLocalSearchParams<{ id: string }>()
  const characterId = id ?? ''
  const { isLoading, error } = useCharacterSync(characterId)
  const characterSheet = useCharacterSheet()
  const { updater } = useCharacterStore()

  const [currentPage, setCurrentPage] = useState(0)
  const pagerRef = useRef<EditorPagerRef>(null)

  const handleTabPress = (index: number) => {
    pagerRef.current?.setPage(index)
    setCurrentPage(index)
  }

  // Level change from dot press - direct change (no confirmation needed)
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
        <SafeAreaBottomSpacer />
      </View>
    )
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <Text color="$placeholderColor">Cargando personaje...</Text>
        </View>
        <SafeAreaBottomSpacer />
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <Text color="$colorFocus">{error}</Text>
        </View>
        <SafeAreaBottomSpacer />
      </View>
    )
  }

  if (!characterSheet) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <Text color="$placeholderColor">Cargando personaje...</Text>
        </View>
        <SafeAreaBottomSpacer />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <EditorTabs currentPage={currentPage} onPageChange={handleTabPress} />
      <EditorPager ref={pagerRef} onPageChange={setCurrentPage}>
        <View key="info" style={styles.page}>
          <InfoColumn />
        </View>
        <View key="abilities" style={styles.page}>
          <AbilitiesColumn />
        </View>
        <View key="levels" style={styles.page}>
          <LevelsColumn onRequestLevelChange={handleRequestLevelChange} />
        </View>
      </EditorPager>
      <SafeAreaBottomSpacer />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  scrollView: {
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
