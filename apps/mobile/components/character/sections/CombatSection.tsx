import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { YStack } from 'tamagui'
import { useCollapsibleHeaderContext } from '../../../contexts'
import { SectionHeader, SectionCard, StatBox } from '../CharacterComponents'
import { MOCK_CHARACTER } from '../data'

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)

/**
 * Seccion de estadisticas de combate.
 */
export function CombatSection() {
  const { scrollHandler, headerHeight } = useCollapsibleHeaderContext()

  return (
    <View style={{ flex: 1 }} collapsable={false}>
      <AnimatedScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, paddingTop: headerHeight, gap: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        nestedScrollEnabled
      >
        <SectionCard>
          <SectionHeader icon="⚔️" title="Combat Stats" />
          <YStack gap={8}>
            <StatBox label="Armor Class" value={MOCK_CHARACTER.ac} icon="🛡️" />
            <StatBox label="Speed" value={`${MOCK_CHARACTER.speed}ft`} icon="👟" />
            <StatBox label="Proficiency" value={`+${MOCK_CHARACTER.proficiencyBonus}`} icon="⭐" />
          </YStack>
        </SectionCard>
      </AnimatedScrollView>
    </View>
  )
}
