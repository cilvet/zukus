import { useState } from 'react'
import { View, Pressable } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, XStack, Text } from 'tamagui'
import { useCharacterAbilities, AbilityCard, AbilityCardCompact } from '../../../ui'
import { SectionHeader, SectionCard } from '../CharacterComponents'
import { SkillsSection } from '../../../ui/components/character/SkillsSection'
import { useNavigateToDetail } from '../../../navigation'

const ABILITY_ORDER = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
const ABILITY_COLUMNS = [
  ['strength', 'dexterity', 'constitution'],
  ['intelligence', 'wisdom', 'charisma'],
]

/**
 * Icono simple de grid (3x2)
 */
function GridIcon({ size = 16, color = '#888' }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, flexDirection: 'row', gap: 2 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flex: 1, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ flex: 1, backgroundColor: color, borderRadius: 1 }} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flex: 1, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ flex: 1, backgroundColor: color, borderRadius: 1 }} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flex: 1, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ flex: 1, backgroundColor: color, borderRadius: 1 }} />
      </View>
    </View>
  )
}

/**
 * Icono simple de lista (líneas horizontales)
 */
function ListIcon({ size = 16, color = '#888' }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, gap: 3, justifyContent: 'center' }}>
      <View style={{ height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ height: 2, backgroundColor: color, borderRadius: 1 }} />
    </View>
  )
}

/**
 * Seccion de ability scores y skills.
 * Usa selector de Zustand para abilities (re-render granular).
 * El AbilityCard detecta cambios en su score y hace glow automáticamente.
 */
export function AbilitiesSection() {
  const navigateToDetail = useNavigateToDetail()
  const abilities = useCharacterAbilities()
  const [isCompactView, setIsCompactView] = useState(false)

  const handleAbilityPress = (abilityKey: string) => {
    navigateToDetail('ability', abilityKey)
  }

  const toggleView = () => {
    setIsCompactView(!isCompactView)
  }

  // Si no hay datos aún, mostrar placeholder
  if (!abilities) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <YStack padding={16}>
          <SectionCard>
            <SectionHeader icon="*" title="Cargando..." />
          </SectionCard>
        </YStack>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }} collapsable={false}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <YStack gap={12}>
          <SectionHeader
            icon="*"
            title="Ability Scores"
            action={
              <Pressable onPress={toggleView}>
                {({ pressed }) => (
                  <View
                    style={{
                      padding: 6,
                      borderRadius: 4,
                      opacity: pressed ? 0.5 : 1,
                    }}
                  >
                    {isCompactView ? <GridIcon size={16} color="#888" /> : <ListIcon size={16} color="#888" />}
                  </View>
                )}
              </Pressable>
            }
          />
          {isCompactView ? (
            <XStack gap={8}>
              {ABILITY_COLUMNS.map((column, colIndex) => (
                <YStack key={colIndex} flex={1} gap={6}>
                  {column.map((key) => {
                    const ability = abilities[key as keyof typeof abilities]
                    return (
                      <AbilityCardCompact
                        key={key}
                        abilityKey={key}
                        score={ability.totalScore}
                        modifier={ability.totalModifier}
                        onPress={() => handleAbilityPress(key)}
                      />
                    )
                  })}
                </YStack>
              ))}
            </XStack>
          ) : (
            <YStack gap={12}>
              <XStack justifyContent="space-between">
                <AbilityCard
                  abilityKey="strength"
                  score={abilities.strength.totalScore}
                  modifier={abilities.strength.totalModifier}
                  onPress={() => handleAbilityPress('strength')}
                />
                <AbilityCard
                  abilityKey="dexterity"
                  score={abilities.dexterity.totalScore}
                  modifier={abilities.dexterity.totalModifier}
                  onPress={() => handleAbilityPress('dexterity')}
                />
                <AbilityCard
                  abilityKey="constitution"
                  score={abilities.constitution.totalScore}
                  modifier={abilities.constitution.totalModifier}
                  onPress={() => handleAbilityPress('constitution')}
                />
              </XStack>
              <XStack justifyContent="space-between">
                <AbilityCard
                  abilityKey="intelligence"
                  score={abilities.intelligence.totalScore}
                  modifier={abilities.intelligence.totalModifier}
                  onPress={() => handleAbilityPress('intelligence')}
                />
                <AbilityCard
                  abilityKey="wisdom"
                  score={abilities.wisdom.totalScore}
                  modifier={abilities.wisdom.totalModifier}
                  onPress={() => handleAbilityPress('wisdom')}
                />
                <AbilityCard
                  abilityKey="charisma"
                  score={abilities.charisma.totalScore}
                  modifier={abilities.charisma.totalModifier}
                  onPress={() => handleAbilityPress('charisma')}
                />
              </XStack>
            </YStack>
          )}
        </YStack>

        <YStack gap={12}>
          <SectionHeader icon="#" title="Skills" />
          <SkillsSection />
        </YStack>
      </ScrollView>
    </View>
  )
}
