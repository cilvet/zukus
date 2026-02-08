import { useState } from 'react'
import { View, StyleSheet, ScrollView, Pressable } from 'react-native'
import { Text, YStack, XStack } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { useTheme, useCharacterSheet, useCharacterStore, useCharacterBaseData } from '../../ui'
import { SafeAreaBottomSpacer } from '../../components/layout'
import {
  LevelEditor,
  AbilityScoresEditor,
  CharacterInfoSection,
  RaceSelectorDetail,
} from '../../ui/components/character/editor'
import { useCompendiumContext } from '../../ui/components/EntityProvider'
import { changeRace } from '@zukus/core'
import type { CompendiumContext as RaceCompendiumContext } from '@zukus/core'

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
 * Header con boton de volver para subpaneles mobile.
 */
function MobileSubpanelHeader({
  title,
  onBack,
}: {
  title: string
  onBack: () => void
}) {
  const { themeColors } = useTheme()
  return (
    <XStack
      height={44}
      alignItems="center"
      paddingHorizontal={12}
      gap={8}
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      backgroundColor="$background"
    >
      <Pressable onPress={onBack} hitSlop={8}>
        <FontAwesome6 name="arrow-left" size={16} color={themeColors.color} />
      </Pressable>
      <Text fontSize={16} fontWeight="600" color="$color" flex={1}>
        {title}
      </Text>
    </XStack>
  )
}

/**
 * Columna 1: Info basica
 */
function InfoColumn({ onRacePress }: { onRacePress: () => void }) {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <CharacterInfoSection onRacePress={onRacePress} />
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
 * Usa tabs para navegacion entre columnas.
 */
export function EditCharacterScreenMobile() {
  const { themeColors } = useTheme()
  const characterSheet = useCharacterSheet()
  const baseData = useCharacterBaseData()
  const { updater } = useCharacterStore()
  const { getAllEntities, getEntity } = useCompendiumContext()

  const [currentPage, setCurrentPage] = useState(0)
  const [showRaceSelector, setShowRaceSelector] = useState(false)

  // Level change from dot press - direct change (no confirmation needed)
  const handleRequestLevelChange = (level: number) => {
    if (updater) {
      updater.setCurrentCharacterLevel(level)
    }
  }

  const handleRacePress = () => {
    setShowRaceSelector(true)
  }

  const handleSelectRace = (raceId: string) => {
    if (!baseData || !updater) return

    const compendiumContext: RaceCompendiumContext = {
      getClass: () => undefined,
      getSystemLevels: () => undefined,
      getRace: (id: string) => {
        const entity = getEntity('race', id)
        return entity as any
      },
      getEntity: (entityType: string, entityId: string) => getEntity(entityType, entityId),
      getAllEntities: (entityType: string) => getAllEntities(entityType),
    }

    const result = changeRace(baseData, raceId, compendiumContext)
    updater.updateCharacterBaseData(result.character)
    setShowRaceSelector(false)
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

  // Race selector subpanel (replaces main content)
  if (showRaceSelector) {
    const currentRaceId = baseData?.raceEntity?.id ?? null
    const availableRaces = getAllEntities('race')

    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <MobileSubpanelHeader
          title="Seleccionar Raza"
          onBack={() => setShowRaceSelector(false)}
        />
        <View style={styles.page}>
          <RaceSelectorDetail
            currentRaceId={currentRaceId}
            availableRaces={availableRaces}
            onSelectRace={handleSelectRace}
          />
        </View>
        <SafeAreaBottomSpacer />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <EditorTabs currentPage={currentPage} onPageChange={setCurrentPage} />
      <View style={styles.page}>
        {currentPage === 0 && <InfoColumn onRacePress={handleRacePress} />}
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
