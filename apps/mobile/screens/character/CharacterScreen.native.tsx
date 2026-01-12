import { useRef, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'
import { useTheme } from '@zukus/ui'
import {
  MOCK_CHARACTER,
  CharacterPager,
  CharacterTabs,
  CombatSection,
  AbilitiesSection,
  EquipmentSection,
  SpellsSection,
} from '../../components/character'
import type { CharacterPagerRef } from '../../components/character'

/**
 * Header fijo con info del personaje.
 */
function Header() {
  const { themeColors } = useTheme()

  return (
    <View style={[styles.header, { backgroundColor: themeColors.background, borderBottomColor: themeColors.borderColor }]}>
      {/* Izquierda: Nivel + Clase */}
      <YStack alignItems="flex-start" flex={1}>
        <Text fontSize={11} color="$placeholderColor" textTransform="uppercase">
          Nivel {MOCK_CHARACTER.level}
        </Text>
        <Text fontSize={14} fontWeight="700" color="$color">
          {MOCK_CHARACTER.class}
        </Text>
      </YStack>

      {/* Centro: Avatar */}
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
        <Text fontSize={20}>🧙</Text>
      </YStack>

      {/* Derecha: HP */}
      <YStack alignItems="flex-end" flex={1}>
        <Text fontSize={11} color="$placeholderColor" textTransform="uppercase">
          HP
        </Text>
        <XStack alignItems="baseline" gap={2}>
          <Text fontSize={16} fontWeight="700" color="$color">
            {MOCK_CHARACTER.hp.current}
          </Text>
          <Text fontSize={12} color="$placeholderColor">
            /{MOCK_CHARACTER.hp.max}
          </Text>
        </XStack>
      </YStack>
    </View>
  )
}

/**
 * Pantalla de personaje para nativo.
 * Header fijo + Tabs + ViewPager swipeable.
 */
export function CharacterScreen() {
  const { themeColors } = useTheme()
  const [currentPage, setCurrentPage] = useState(0)
  const pagerRef = useRef<CharacterPagerRef>(null)

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
        <View key="equipment" style={styles.page}>
          <EquipmentSection />
        </View>
        <View key="spells" style={styles.page}>
          <SpellsSection />
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
