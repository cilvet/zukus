import { ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { YStack, XStack } from 'tamagui'
import { themes } from '@zukus/ui'
import {
  MOCK_CHARACTER,
  SectionHeader,
  SectionCard,
  StatBox,
  AbilityCard,
  SkillItem,
  ItemCard,
  CharacterHeader,
  HpBar,
} from '../../components/character'

const CURRENT_THEME = 'zukus' as keyof typeof themes
const theme = themes[CURRENT_THEME]

/**
 * Pantalla de personaje para mobile (nativo y web mobile).
 * Layout: scroll vertical con navegación stack para detalles.
 */
export function CharacterScreen() {
  const router = useRouter()

  const handleAbilityPress = (abilityKey: string) => {
    router.push({
      pathname: '/(tabs)/(character)/[id]',
      params: { id: abilityKey, type: 'ability' },
    })
  }

  const handleItemPress = (itemId: string, itemName: string) => {
    router.push({
      pathname: '/(tabs)/(character)/[id]',
      params: { id: itemId, type: 'item', name: itemName },
    })
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 16, gap: 16 }}
    >
      <CharacterHeader
        name={MOCK_CHARACTER.name}
        level={MOCK_CHARACTER.level}
        race={MOCK_CHARACTER.race}
        characterClass={MOCK_CHARACTER.class}
      />
      <HpBar current={MOCK_CHARACTER.hp.current} max={MOCK_CHARACTER.hp.max} />
      <SectionCard>
        <SectionHeader icon="⚔️" title="Combat Stats" />
        <YStack gap={8}>
          <StatBox label="Armor Class" value={MOCK_CHARACTER.ac} icon="🛡️" />
          <StatBox label="Speed" value={`${MOCK_CHARACTER.speed}ft`} icon="👟" />
          <StatBox label="Proficiency" value={`+${MOCK_CHARACTER.proficiencyBonus}`} icon="⭐" />
        </YStack>
      </SectionCard>
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
      <SectionCard>
        <SectionHeader icon="🎒" title="Equipment" />
        <YStack gap={8}>
          {MOCK_CHARACTER.equipment.map((item, idx) => (
            <ItemCard
              key={idx}
              name={item.name}
              subtitle={item.type}
              onPress={() => handleItemPress(`equipment-${idx}`, item.name)}
            />
          ))}
        </YStack>
      </SectionCard>
      <SectionCard>
        <SectionHeader icon="📜" title="Spells" />
        <YStack gap={8}>
          {MOCK_CHARACTER.spells.map((spell, idx) => (
            <ItemCard
              key={idx}
              name={spell.name}
              subtitle={`Level ${spell.level}`}
              onPress={() => handleItemPress(`spell-${idx}`, spell.name)}
            />
          ))}
        </YStack>
      </SectionCard>
    </ScrollView>
  )
}
