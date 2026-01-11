import { View, StyleSheet } from 'react-native'
import Animated from 'react-native-reanimated'
import { YStack } from 'tamagui'
import { themes } from '@zukus/ui'
import { useCollapsibleHeaderContext } from '../../../contexts'
import { SectionHeader, SectionCard, StatBox } from '../CharacterComponents'
import { MOCK_CHARACTER } from '../data'

const theme = themes.zukus

/**
 * Sección de estadísticas de combate.
 */
export function CombatSection() {
  const { scrollHandler, headerHeight } = useCollapsibleHeaderContext()

  return (
    <View style={styles.page} collapsable={false}>
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: headerHeight }]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <SectionCard>
          <SectionHeader icon="⚔️" title="Combat Stats" />
          <YStack gap={8}>
            <StatBox label="Armor Class" value={MOCK_CHARACTER.ac} icon="🛡️" />
            <StatBox label="Speed" value={`${MOCK_CHARACTER.speed}ft`} icon="👟" />
            <StatBox label="Proficiency" value={`+${MOCK_CHARACTER.proficiencyBonus}`} icon="⭐" />
          </YStack>
        </SectionCard>
      </Animated.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
})
