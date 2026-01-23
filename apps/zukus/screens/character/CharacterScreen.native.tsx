import { useRef, useState, useEffect } from 'react'
import { View, StyleSheet, Pressable, Image } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  useTheme,
  useCharacterName,
  useCharacterLevel,
  useCharacterHitPoints,
  useCharacterSheet,
  useCharacterImageUrl,
  useVisiblePageStore,
} from '../../ui'
import { useCharacterSync } from '../../hooks'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faHatWizard } from '@fortawesome/free-solid-svg-icons/faHatWizard'
import {
  CharacterPager,
  CharacterTabs,
  CombatSection,
  AbilitiesSection,
  BuffsSection,
  EquipmentSection,
  DescriptionSection,
  NotesSection,
  EntitiesSection,
  CHARACTER_PAGES,
} from '../../components/character'
import type { CharacterPagerRef } from '../../components/character'

/**
 * Header fijo con info del personaje.
 * Usa selectores de Zustand para re-renders granulares.
 */
function Header() {
  const { themeColors } = useTheme()
  const name = useCharacterName()
  const level = useCharacterLevel()
  const hitPoints = useCharacterHitPoints()
  const imageUrl = useCharacterImageUrl()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()

  const levelNumber = level?.level ?? 0
  const className = level?.levelsData[0]?.classUniqueId ?? 'Sin clase'
  const currentHp = hitPoints?.currentHp ?? 0
  const maxHp = hitPoints?.maxHp ?? 0

  const handleHitPointsPress = () => {
    router.push('/(tabs)/(character)/detail/hitPoints/hitPoints')
  }

  const handleFormulaPlaygroundPress = () => {
    router.push('/(tabs)/(character)/formula-playground')
  }

  const handleLevelPress = () => {
    if (id) {
      router.push(`/(tabs)/(character)/edit/${id}`)
    }
  }

  return (
    <View style={[styles.header, { backgroundColor: themeColors.background, borderBottomColor: themeColors.borderColor }]}>
      {/* Izquierda: Nivel + Clase (clickable para editar) */}
      <Pressable onPress={handleLevelPress} hitSlop={8} style={{ flex: 1 }}>
        {({ pressed }) => (
          <YStack alignItems="flex-start" flex={1} opacity={pressed ? 0.7 : 1}>
            <Text fontSize={11} color="$placeholderColor" textTransform="uppercase">
              Nivel {levelNumber}
            </Text>
            <Text fontSize={14} fontWeight="700" color="$color">
              {className}
            </Text>
          </YStack>
        )}
      </Pressable>

      {/* Centro: Avatar + Mini caja de fórmulas */}
      <XStack alignItems="center" gap={8}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#333',
            }}
          />
        ) : (
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
        )}
        <Pressable onPress={handleFormulaPlaygroundPress} hitSlop={8}>
          {({ pressed }) => (
            <YStack
              width={32}
              height={32}
              backgroundColor={pressed ? '$backgroundHover' : '$uiBackgroundColor'}
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius={6}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={14} fontWeight="700" color="$color">
                f
              </Text>
            </YStack>
          )}
        </Pressable>
      </XStack>

      {/* Derecha: HP */}
      <Pressable onPress={handleHitPointsPress} hitSlop={8} style={{ flex: 1 }}>
        {({ pressed }) => (
          <YStack alignItems="flex-end" flex={1} opacity={pressed ? 0.7 : 1}>
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
        )}
      </Pressable>
    </View>
  )
}

/**
 * Pantalla de personaje para nativo.
 * Header fijo + Tabs + ViewPager swipeable.
 * Consume el personaje cargado en el store.
 */
export function CharacterScreen() {
  const { themeColors } = useTheme()
  const [currentPage, setCurrentPage] = useState(0)
  const pagerRef = useRef<CharacterPagerRef>(null)
  const { id } = useLocalSearchParams<{ id: string }>()
  const characterId = id ?? ''
  const { isLoading, error } = useCharacterSync(characterId)
  const characterSheet = useCharacterSheet()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const setVisiblePage = useVisiblePageStore((state) => state.setVisiblePage)

  // Inicializar visiblePage en el mount
  useEffect(() => {
    setVisiblePage(CHARACTER_PAGES[0]?.key ?? null)
    return () => setVisiblePage(null)
  }, [setVisiblePage])

  // Cuando la página está completamente visible (offset = 0), actualizar el store
  function handlePageSettled(index: number) {
    const pageKey = CHARACTER_PAGES[index]?.key ?? null
    setVisiblePage(pageKey)
  }

  function handleTabPress(index: number) {
    pagerRef.current?.setPage(index)
    setCurrentPage(index)
  }

  function handleChatPress() {
    router.push('/chat')
  }

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
      <Header />
      <CharacterTabs currentPage={currentPage} onPageChange={handleTabPress} />
      <CharacterPager ref={pagerRef} onPageChange={setCurrentPage} onPageSettled={handlePageSettled}>
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
        <View key="description" style={styles.page}>
          <DescriptionSection />
        </View>
        <View key="notes" style={styles.page}>
          <NotesSection />
        </View>
        <View key="entities" style={styles.page}>
          <EntitiesSection />
        </View>
      </CharacterPager>

      {/* Botón flotante de chat */}
      <Pressable
        onPress={handleChatPress}
        style={[
          styles.fab,
          {
            bottom: 16,
            backgroundColor: themeColors.actionButton,
          },
        ]}
        hitSlop={8}
      >
        {({ pressed }) => (
          <View style={[styles.fabContent, { opacity: pressed ? 0.8 : 1 }]}>
            <FontAwesomeIcon icon={faHatWizard as any} size={24} color={themeColors.accentContrastText} />
          </View>
        )}
      </Pressable>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
