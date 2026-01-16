import { useRef, useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'
import {
  useTheme,
  useCharacterStore,
  useCharacterName,
  useCharacterLevel,
  useCharacterHitPoints,
} from '../../ui'
import {
  CharacterPager,
  CharacterTabs,
  CombatSection,
  AbilitiesSection,
  BuffsSection,
  EquipmentSection,
  SpellsSection,
  FeaturesSection,
  ActionsSection,
  InventorySection,
  DescriptionSection,
  NotesSection,
} from '../../components/character'
import type { CharacterPagerRef } from '../../components/character'
import { testCharacterSheet, testBaseData } from '../../data/testCharacter'

/**
 * Header fijo con info del personaje.
 * Usa selectores de Zustand para re-renders granulares.
 */
function Header() {
  const { themeColors } = useTheme()
  const name = useCharacterName()
  const level = useCharacterLevel()
  const hitPoints = useCharacterHitPoints()

  const levelNumber = level?.level ?? 0
  const className = level?.levelsData[0]?.classUniqueId ?? 'Sin clase'
  const currentHp = hitPoints?.currentHp ?? 0
  const maxHp = hitPoints?.maxHp ?? 0

  return (
    <View style={[styles.header, { backgroundColor: themeColors.background, borderBottomColor: themeColors.borderColor }]}>
      {/* Izquierda: Nivel + Clase */}
      <YStack alignItems="flex-start" flex={1}>
        <Text fontSize={11} color="$placeholderColor" textTransform="uppercase">
          Nivel {levelNumber}
        </Text>
        <Text fontSize={14} fontWeight="700" color="$color">
          {className}
        </Text>
      </YStack>

      {/* Centro: Avatar + Nombre */}
      <YStack alignItems="center">
        <YStack
          width={48}
          height={48}
          borderRadius={24}
          backgroundColor="$uiBackgroundColor"
          borderWidth={2}
          borderColor="$color"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={16} fontWeight="700" color="$color">
            {name.charAt(0)}
          </Text>
        </YStack>
      </YStack>

      {/* Derecha: HP */}
      <YStack alignItems="flex-end" flex={1}>
        <Text fontSize={11} color="$placeholderColor" textTransform="uppercase">
          HP
        </Text>
        <XStack alignItems="baseline" gap={2}>
          <Text fontSize={16} fontWeight="700" color="$color">
            {currentHp}
          </Text>
          <Text fontSize={12} color="$placeholderColor">
            /{maxHp}
          </Text>
        </XStack>
      </YStack>
    </View>
  )
}

/**
 * Pantalla de personaje para nativo.
 * Header fijo + Tabs + ViewPager swipeable.
 * Inicializa el store de Zustand con los datos del personaje.
 */
export function CharacterScreen() {
  const { themeColors } = useTheme()
  const [currentPage, setCurrentPage] = useState(0)
  const pagerRef = useRef<CharacterPagerRef>(null)
  const setCharacter = useCharacterStore((state) => state.setCharacter)

  // Inicializar el store con el personaje de prueba
  useEffect(() => {
    setCharacter(testCharacterSheet, testBaseData)
  }, [setCharacter])

  function handleTabPress(index: number) {
    pagerRef.current?.setPage(index)
    setCurrentPage(index)
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header />
      <CharacterTabs currentPage={currentPage} onPageChange={handleTabPress} />
      <CharacterPager ref={pagerRef} onPageChange={setCurrentPage}>
        <View key="combat" style={styles.page}>
          <CombatSection />
        </View>
        <View key="abilities" style={styles.page}>
          <AbilitiesSection />
        </View>
        <View key="buffs" style={styles.page}>
          <BuffsSection />
        </View>
        <View key="equipment" style={styles.page}>
          <EquipmentSection />
        </View>
        <View key="spells" style={styles.page}>
          <SpellsSection />
        </View>
        <View key="features" style={styles.page}>
          <FeaturesSection />
        </View>
        <View key="actions" style={styles.page}>
          <ActionsSection />
        </View>
        <View key="inventory" style={styles.page}>
          <InventorySection />
        </View>
        <View key="description" style={styles.page}>
          <DescriptionSection />
        </View>
        <View key="notes" style={styles.page}>
          <NotesSection />
        </View>
      </CharacterPager>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  page: {
    flex: 1,
  },
})
