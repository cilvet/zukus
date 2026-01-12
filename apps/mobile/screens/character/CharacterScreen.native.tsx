import { View } from 'react-native'
import Animated from 'react-native-reanimated'
import { Text, XStack, YStack } from 'tamagui'
import { useTheme } from '@zukus/ui'
import { CollapsibleHeaderProvider, useCollapsibleHeaderContext } from '../../contexts'
import {
  MOCK_CHARACTER,
  CharacterPager,
  CombatSection,
  AbilitiesSection,
  EquipmentSection,
  SpellsSection,
} from '../../components/character'

const HEADER_HEIGHT = 72

/**
 * Header animado que se colapsa al scrollear.
 */
function AnimatedHeader() {
  const { headerAnimatedStyle } = useCollapsibleHeaderContext()
  const { themeColors } = useTheme()

  const headerBaseStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 100,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: themeColors.background,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderColor,
  }

  return (
    // @ts-expect-error - Reanimated style types conflict with RN ViewStyle
    <Animated.View style={[headerBaseStyle, headerAnimatedStyle]}>
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
    </Animated.View>
  )
}

/**
 * Contenido principal con el pager.
 */
function CharacterContent() {
  return (
    <CharacterPager>
      <View key="combat" style={{ flex: 1 }}>
        <CombatSection />
      </View>
      <View key="abilities" style={{ flex: 1 }}>
        <AbilitiesSection />
      </View>
      <View key="equipment" style={{ flex: 1 }}>
        <EquipmentSection />
      </View>
      <View key="spells" style={{ flex: 1 }}>
        <SpellsSection />
      </View>
    </CharacterPager>
  )
}

/**
 * Pantalla de personaje para nativo.
 * Header colapsable + ViewPager swipeable.
 */
export function CharacterScreen() {
  const { themeColors } = useTheme()

  return (
    <CollapsibleHeaderProvider headerHeight={HEADER_HEIGHT}>
      <View style={{ flex: 1, backgroundColor: themeColors.background }}>
        <AnimatedHeader />
        <CharacterContent />
      </View>
    </CollapsibleHeaderProvider>
  )
}
