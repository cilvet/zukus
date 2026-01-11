import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'
import { themes } from '@zukus/ui'
import {
  MOCK_CHARACTER,
  CharacterPager,
} from '../../components/character'

const theme = themes.zukus

// Versiones simples de las secciones para web (sin contexto de collapsible)
import { useRouter } from 'expo-router'
import { SectionHeader, SectionCard, StatBox, AbilityCard, SkillItem, ItemCard } from '../../components/character'

function WebCombatSection() {
  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard>
          <SectionHeader icon="⚔️" title="Combat Stats" />
          <YStack gap={8}>
            <StatBox label="Armor Class" value={MOCK_CHARACTER.ac} icon="🛡️" />
            <StatBox label="Speed" value={`${MOCK_CHARACTER.speed}ft`} icon="👟" />
            <StatBox label="Proficiency" value={`+${MOCK_CHARACTER.proficiencyBonus}`} icon="⭐" />
          </YStack>
        </SectionCard>
      </ScrollView>
    </View>
  )
}

function WebAbilitiesSection() {
  const router = useRouter()
  const handleAbilityPress = (abilityKey: string) => {
    router.push({
      pathname: '/(tabs)/(character)/[id]',
      params: { id: abilityKey, type: 'ability' },
    })
  }

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard>
          <SectionHeader icon="✨" title="Ability Scores" />
          <YStack gap={12}>
            <XStack justifyContent="space-between">
              <AbilityCard abilityKey="strength" ability={MOCK_CHARACTER.abilities.strength} onPress={() => handleAbilityPress('strength')} />
              <AbilityCard abilityKey="dexterity" ability={MOCK_CHARACTER.abilities.dexterity} onPress={() => handleAbilityPress('dexterity')} />
              <AbilityCard abilityKey="constitution" ability={MOCK_CHARACTER.abilities.constitution} onPress={() => handleAbilityPress('constitution')} />
            </XStack>
            <XStack justifyContent="space-between">
              <AbilityCard abilityKey="intelligence" ability={MOCK_CHARACTER.abilities.intelligence} onPress={() => handleAbilityPress('intelligence')} />
              <AbilityCard abilityKey="wisdom" ability={MOCK_CHARACTER.abilities.wisdom} onPress={() => handleAbilityPress('wisdom')} />
              <AbilityCard abilityKey="charisma" ability={MOCK_CHARACTER.abilities.charisma} onPress={() => handleAbilityPress('charisma')} />
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
      </ScrollView>
    </View>
  )
}

function WebEquipmentSection() {
  const router = useRouter()
  const handleItemPress = (itemId: string, itemName: string) => {
    router.push({
      pathname: '/(tabs)/(character)/[id]',
      params: { id: itemId, type: 'item', name: itemName },
    })
  }

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard>
          <SectionHeader icon="🎒" title="Equipment" />
          <YStack gap={8}>
            {MOCK_CHARACTER.equipment.map((item, idx) => (
              <ItemCard key={idx} name={item.name} subtitle={item.type} onPress={() => handleItemPress(`equipment-${idx}`, item.name)} />
            ))}
          </YStack>
        </SectionCard>
      </ScrollView>
    </View>
  )
}

function WebSpellsSection() {
  const router = useRouter()
  const handleSpellPress = (spellId: string, spellName: string) => {
    router.push({
      pathname: '/(tabs)/(character)/[id]',
      params: { id: spellId, type: 'item', name: spellName },
    })
  }

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard>
          <SectionHeader icon="📜" title="Spells" />
          <YStack gap={8}>
            {MOCK_CHARACTER.spells.map((spell, idx) => (
              <ItemCard key={idx} name={spell.name} subtitle={`Level ${spell.level}`} onPress={() => handleSpellPress(`spell-${idx}`, spell.name)} />
            ))}
          </YStack>
        </SectionCard>
      </ScrollView>
    </View>
  )
}

/**
 * Pantalla de personaje para web mobile.
 * Header fijo (no colapsable) + swipe views.
 */
export function CharacterScreen() {
  return (
    <YStack flex={1} backgroundColor={theme.background}>
      {/* Header fijo */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingVertical={12}
        paddingHorizontal={16}
        backgroundColor={theme.background}
        borderBottomWidth={1}
        borderBottomColor={theme.borderColor}
      >
        <YStack alignItems="flex-start" flex={1}>
          <Text fontSize={11} color={theme.placeholderColor} textTransform="uppercase">
            Nivel {MOCK_CHARACTER.level}
          </Text>
          <Text fontSize={14} fontWeight="700" color={theme.color}>
            {MOCK_CHARACTER.class}
          </Text>
        </YStack>

        <YStack
          width={48}
          height={48}
          borderRadius={24}
          backgroundColor={theme.uiBackgroundColor}
          borderWidth={2}
          borderColor={theme.color}
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={20}>🧙</Text>
        </YStack>

        <YStack alignItems="flex-end" flex={1}>
          <Text fontSize={11} color={theme.placeholderColor} textTransform="uppercase">
            HP
          </Text>
          <XStack alignItems="baseline" gap={2}>
            <Text fontSize={16} fontWeight="700" color={theme.color}>
              {MOCK_CHARACTER.hp.current}
            </Text>
            <Text fontSize={12} color={theme.placeholderColor}>
              /{MOCK_CHARACTER.hp.max}
            </Text>
          </XStack>
        </YStack>
      </XStack>

      {/* Contenido swipeable */}
      <CharacterPager>
        <WebCombatSection />
        <WebAbilitiesSection />
        <WebEquipmentSection />
        <WebSpellsSection />
      </CharacterPager>
    </YStack>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    height: '100%',
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
