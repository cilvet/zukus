import { useRef, useState, useEffect } from 'react'
import { View, StyleSheet, Pressable, Image } from 'react-native'
import { Spinner, Text, XStack, YStack } from 'tamagui'
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
  useCharacterStore,
} from '../../ui'
import { useCharacterSync } from '../../hooks'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faHatWizard } from '@fortawesome/free-solid-svg-icons/faHatWizard'
import {
  CharacterPager,
  BottomTabBar,
  CombatSection,
  AbilitiesSection,
  BuffsSection,
  EquipmentSection,
  InventorySection,
  DescriptionSection,
  NotesSection,
  EntitiesSection,
  CGESummarySection,
  useCharacterPages,
} from '../../components/character'
import type { CharacterPagerRef } from '../../components/character'
import { SafeAreaBottomSpacer } from '../../components/layout'

/**
 * Header fijo con info del personaje.
 * Usa selectores de Zustand para re-renders granulares.
 */
function Header() {
  console.log('[PERF] Header render', Date.now())
  const { themeColors } = useTheme()
  const name = useCharacterName()
  const level = useCharacterLevel()
  const hitPoints = useCharacterHitPoints()
  const imageUrl = useCharacterImageUrl()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const rest = useCharacterStore((state) => state.rest)

  const levelNumber = level?.level ?? 0
  const className = level?.levelsData[0]?.classUniqueId ?? 'Sin clase'
  const currentHp = hitPoints?.currentHp ?? 0
  const maxHp = hitPoints?.maxHp ?? 0

  const handleHitPointsPress = () => {
    router.push('/characters/detail/hitPoints/hitPoints')
  }

  const handleFormulaPlaygroundPress = () => {
    router.push('/characters/formula-playground')
  }

  const handleRestPress = () => {
    const result = rest()
    if (!result.success) {
      console.warn('Failed to rest:', result.error)
    }
  }

  const handleLevelPress = () => {
    if (id) {
      router.push(`/characters/edit/${id}`)
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

      {/* Centro: Avatar + Botones */}
      <XStack alignItems="center" gap={6}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#333',
            }}
          />
        ) : (
          <YStack
            width={44}
            height={44}
            borderRadius={22}
            backgroundColor="$uiBackgroundColor"
            borderWidth={2}
            borderColor="$color"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={14} fontWeight="700" color="$color">
              {name.charAt(0)}
            </Text>
          </YStack>
        )}
        <Pressable onPress={handleRestPress} hitSlop={8}>
          {({ pressed }) => (
            <YStack
              width={28}
              height={28}
              backgroundColor={pressed ? '$backgroundHover' : '$uiBackgroundColor'}
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius={6}
              alignItems="center"
              justifyContent="center"
            >
              <FontAwesome name="fire" size={12} color="#f97316" />
            </YStack>
          )}
        </Pressable>
        <Pressable onPress={handleFormulaPlaygroundPress} hitSlop={8}>
          {({ pressed }) => (
            <YStack
              width={28}
              height={28}
              backgroundColor={pressed ? '$backgroundHover' : '$uiBackgroundColor'}
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius={6}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={12} fontWeight="700" color="$color">
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
/**
 * Maps page keys to their section components.
 */
const PAGE_COMPONENTS: Record<string, React.ComponentType> = {
  combat: CombatSection,
  abilities: AbilitiesSection,
  cge: CGESummarySection,
  buffs: BuffsSection,
  equipment: EquipmentSection,
  inventory: InventorySection,
  description: DescriptionSection,
  notes: NotesSection,
  entities: EntitiesSection,
}

export function CharacterScreenMobile() {
  console.log('[PERF] CharacterScreenMobile render', Date.now())
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
  const pages = useCharacterPages()

  // Inicializar visiblePage en el mount
  useEffect(() => {
    setVisiblePage(pages[0]?.key ?? null)
    return () => setVisiblePage(null)
  }, [setVisiblePage, pages])

  // Cuando la página está completamente visible (offset = 0), actualizar el store
  function handlePageSettled(index: number) {
    const pageKey = pages[index]?.key ?? null
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
        <SafeAreaBottomSpacer />
      </View>
    )
  }

  if (isLoading || error || !characterSheet) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <Spinner size="large" color="$accentColor" />
        </View>
        <SafeAreaBottomSpacer />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header />
      <CharacterPager ref={pagerRef} onPageChange={setCurrentPage} onPageSettled={handlePageSettled}>
        {pages.map((page) => {
          const PageComponent = PAGE_COMPONENTS[page.key]
          if (!PageComponent) return null
          return (
            <View key={page.key} style={styles.page}>
              <PageComponent />
            </View>
          )
        })}
      </CharacterPager>

      <BottomTabBar
        pages={pages}
        currentPage={currentPage}
        onPageChange={handleTabPress}
      />

      {/* Boton flotante de chat */}
      <Pressable
        onPress={handleChatPress}
        style={[
          styles.fab,
          {
            bottom: insets.bottom + 56 + 16,
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
