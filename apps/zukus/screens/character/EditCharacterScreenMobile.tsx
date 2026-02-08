import { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, YStack, XStack } from 'tamagui'
import { useTheme, useCharacterSheet, useCharacterStore } from '../../ui'
import { SafeAreaBottomSpacer } from '../../components/layout'
import {
  LevelEditor,
  AbilityScoresEditor,
  CharacterInfoSection,
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
export function EditCharacterScreenMobile() {
  const { themeColors } = useTheme()
  const characterSheet = useCharacterSheet()
  const { updater } = useCharacterStore()

  const [currentPage, setCurrentPage] = useState(0)

  // Level change from dot press - direct change (no confirmation needed)
  const handleRequestLevelChange = (level: number) => {
    if (updater) {
      updater.setCurrentCharacterLevel(level)
    }
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
      <EditorTabs currentPage={currentPage} onPageChange={setCurrentPage} />
      <View style={styles.page}>
        {currentPage === 0 && <InfoColumn />}
        {currentPage === 1 && <AbilitiesColumn />}
        {currentPage === 2 && <LevelsColumn onRequestLevelChange={handleRequestLevelChange} />}
      </View>
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
