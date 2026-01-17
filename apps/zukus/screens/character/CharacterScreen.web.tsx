import { useEffect } from 'react'
import { View, ScrollView } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'
import {
  useCharacterStore,
  useCharacterAbilities,
  useCharacterBuffs,
  AbilityCard,
  Checkbox,
} from '../../ui'
import { testCharacterSheet, testBaseData } from '../../data/testCharacter'
import {
  MOCK_CHARACTER,
  CharacterPager,
  SectionHeader,
  SectionCard,
  StatBox,
  SkillItem,
  ItemCard,
} from '../../components/character'
import { useNavigateToDetail } from '../../navigation'

// Versiones simples de las secciones para web (sin contexto de collapsible)

function WebCombatSection() {
  return (
    <View style={{ flex: 1, height: '100%' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
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
  const navigateToDetail = useNavigateToDetail()
  const abilities = useCharacterAbilities()

  const handleAbilityPress = (abilityKey: string) => {
    navigateToDetail('ability', abilityKey)
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
    <View style={{ flex: 1, height: '100%' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard>
          <SectionHeader icon="*" title="Ability Scores" />
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
        </SectionCard>
        <SectionCard>
          <SectionHeader icon="#" title="Skills" />
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
  const navigateToDetail = useNavigateToDetail()
  
  const handleItemPress = (itemId: string, itemName: string) => {
    navigateToDetail('equipment', itemId, itemName)
  }

  return (
    <View style={{ flex: 1, height: '100%' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
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

function WebBuffsSection() {
  const buffs = useCharacterBuffs()
  const toggleBuff = useCharacterStore((state) => state.toggleBuff)

  if (buffs.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <YStack padding={16}>
          <SectionCard>
            <SectionHeader icon="*" title="Sin buffs disponibles" />
          </SectionCard>
        </YStack>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, height: '100%' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard>
          <SectionHeader icon="*" title="Conjuros Activos" />
          <YStack gap={0}>
            {buffs.map((buff) => {
              return (
                <Checkbox
                  key={buff.uniqueId}
                  checked={buff.active}
                  onCheckedChange={() => toggleBuff(buff.uniqueId)}
                  label={buff.name}
                  size="small"
                  variant="diamond"
                />
              )
            })}
          </YStack>
        </SectionCard>

        <SectionCard>
          <SectionHeader icon="?" title="Info" />
          <Text fontSize={12} color="$placeholderColor" lineHeight={18}>
            Los conjuros de mejora otorgan +4 al atributo correspondiente mientras estén activos.
            {'\n\n'}
            Esta sección es de prueba para verificar el funcionamiento del sistema de buffs.
          </Text>
        </SectionCard>
      </ScrollView>
    </View>
  )
}

function WebSpellsSection() {
  const navigateToDetail = useNavigateToDetail()
  
  const handleSpellPress = (spellId: string, spellName: string) => {
    navigateToDetail('spell', spellId, spellName)
  }

  return (
    <View style={{ flex: 1, height: '100%' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
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
 * Inicializa el store de Zustand con los datos del personaje.
 */
export function CharacterScreen() {
  const setCharacter = useCharacterStore((state) => state.setCharacter)

  // Inicializar el store con el personaje de prueba
  useEffect(() => {
    setCharacter(testCharacterSheet, testBaseData)
  }, [setCharacter])

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header fijo */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingVertical={12}
        paddingHorizontal={16}
        backgroundColor="$background"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <YStack alignItems="flex-start" flex={1}>
          <Text fontSize={11} color="$placeholderColor" textTransform="uppercase">
            Nivel {MOCK_CHARACTER.level}
          </Text>
          <Text fontSize={14} fontWeight="700" color="$color">
            {MOCK_CHARACTER.class}
          </Text>
        </YStack>

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
      </XStack>

      {/* Contenido swipeable */}
      <CharacterPager>
        <WebCombatSection />
        <WebAbilitiesSection />
        <WebBuffsSection />
        <WebEquipmentSection />
        <WebSpellsSection />
      </CharacterPager>
    </YStack>
  )
}
