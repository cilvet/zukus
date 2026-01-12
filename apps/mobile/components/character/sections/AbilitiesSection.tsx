import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { YStack, XStack } from 'tamagui'
import { useCollapsibleHeaderContext } from '../../../contexts'
import { SectionHeader, SectionCard, AbilityCard, SkillItem } from '../CharacterComponents'
import { MOCK_CHARACTER } from '../data'

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)

/**
 * Seccion de ability scores y skills.
 */
export function AbilitiesSection() {
  const router = useRouter()
  const { scrollHandler, headerHeight } = useCollapsibleHeaderContext()

  const handleAbilityPress = (abilityKey: string) => {
    router.push({
      pathname: '/(tabs)/(character)/[id]',
      params: { id: abilityKey, type: 'ability' },
    })
  }

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
          <SectionHeader icon="✨" title="Ability Scores" />
          <YStack gap={12}>
            <XStack justifyContent="space-between">
              <AbilityCard
                abilityKey="strength"
                ability={MOCK_CHARACTER.abilities.strength}
                onPress={() => handleAbilityPress('strength')}
              />
              <AbilityCard
                abilityKey="dexterity"
                ability={MOCK_CHARACTER.abilities.dexterity}
                onPress={() => handleAbilityPress('dexterity')}
              />
              <AbilityCard
                abilityKey="constitution"
                ability={MOCK_CHARACTER.abilities.constitution}
                onPress={() => handleAbilityPress('constitution')}
              />
            </XStack>
            <XStack justifyContent="space-between">
              <AbilityCard
                abilityKey="intelligence"
                ability={MOCK_CHARACTER.abilities.intelligence}
                onPress={() => handleAbilityPress('intelligence')}
              />
              <AbilityCard
                abilityKey="wisdom"
                ability={MOCK_CHARACTER.abilities.wisdom}
                onPress={() => handleAbilityPress('wisdom')}
              />
              <AbilityCard
                abilityKey="charisma"
                ability={MOCK_CHARACTER.abilities.charisma}
                onPress={() => handleAbilityPress('charisma')}
              />
            </XStack>
          </YStack>
        </SectionCard>

        <SectionCard>
          <SectionHeader icon="📚" title="Skills" />
          <YStack>
            {MOCK_CHARACTER.skills.map((skill, index) => (
              <SkillItem key={index} skill={skill} />
            ))}
          </YStack>
        </SectionCard>
      </AnimatedScrollView>
    </View>
  )
}
