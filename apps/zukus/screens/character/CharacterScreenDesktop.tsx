import { useEffect } from 'react'
import { YStack, XStack, Text } from 'tamagui'
import {
  useCharacterStore,
  useCharacterSheet,
  useCharacterAbilities,
  useCharacterLevel,
  useCharacterHitPoints,
  useCharacterArmorClass,
  useCharacterInitiative,
  useCharacterBAB,
  useCharacterBuffs,
  AbilityCard,
  Checkbox,
} from '../../ui'
import { usePanelNavigation } from '../../hooks'
import {
  MOCK_CHARACTER,
  SectionHeader,
  SectionCard,
  StatBox,
  SkillItem,
  ItemCard,
  CharacterHeader,
  HpBar,
  AbilityDetailPanel,
  GenericDetailPanel,
} from '../../components/character'
import type { Ability } from '../../components/character/data'
import type { CalculatedAbility } from '@zukus/core'
import {
  SidePanel,
  SidePanelContainer,
  ColumnsContainer,
  VerticalSection,
} from '../../components/layout'
import { testCharacterSheet, testBaseData } from '../../data/testCharacter'
import { type DetailType, getDetailTitle, isValidDetailType } from '../../navigation'


/**
 * Contenido de la pantalla desktop (usa selectores de Zustand).
 */
function CharacterScreenDesktopContent() {
  const characterSheet = useCharacterSheet()
  const abilities = useCharacterAbilities()
  const level = useCharacterLevel()
  const hitPoints = useCharacterHitPoints()
  const armorClass = useCharacterArmorClass()
  const initiative = useCharacterInitiative()
  const bab = useCharacterBAB()
  const buffs = useCharacterBuffs()
  const toggleBuff = useCharacterStore((state) => state.toggleBuff)

  const {
    currentPanel,
    isPanelOpen,
    canGoBack,
    openPanel,
    closePanel,
    goBack,
  } = usePanelNavigation()

  const handleAbilityPress = (abilityKey: string) => {
    openPanel(abilityKey, 'ability', getDetailTitle('ability', abilityKey))
  }

  const handleItemPress = (itemId: string, itemName: string) => {
    openPanel(itemId, 'item', itemName)
  }

  const getPanelTitle = (): string => {
    if (!currentPanel?.type || !currentPanel?.id) {
      return 'Detail'
    }
    if (!isValidDetailType(currentPanel.type)) {
      return currentPanel.name ?? 'Detail'
    }
    return getDetailTitle(currentPanel.type, currentPanel.id, currentPanel.name)
  }

  // Obtener ability para el panel de detalle
  const getCalculatedAbility = (abilityKey: string): CalculatedAbility | null => {
    if (!abilities) return null
    return abilities[abilityKey] as CalculatedAbility | undefined ?? null
  }

  const getAbilityForPanel = (abilityKey: string): Ability | null => {
    const coreAbility = getCalculatedAbility(abilityKey)
    if (!coreAbility) return null
    return {
      score: coreAbility.totalScore,
      modifier: coreAbility.totalModifier,
    }
  }

  // Si no hay datos aún, mostrar loading
  if (!characterSheet || !abilities) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$color">Cargando personaje...</Text>
      </YStack>
    )
  }

  const levelNumber = level?.level ?? 0
  const className = level?.levelsData[0]?.classUniqueId ?? 'Sin clase'
  const currentHp = hitPoints?.currentHp ?? 0
  const maxHp = hitPoints?.maxHp ?? 0

  return (
    <SidePanelContainer>
      <ColumnsContainer>
        {/* Columna 1: Avatar + HP + Combat Stats */}
        <VerticalSection>
          <YStack width="100%" gap={16}>
            <CharacterHeader
              name={characterSheet.name}
              level={levelNumber}
              race=""
              characterClass={className}
            />
            <HpBar current={currentHp} max={maxHp} />
            <SectionCard>
              <SectionHeader icon="*" title="Combat Stats" />
              <YStack gap={8}>
                <StatBox label="Armor Class" value={armorClass?.totalAc.totalValue ?? 10} icon="AC" />
                <StatBox label="Initiative" value={`+${initiative?.totalValue ?? 0}`} icon="IN" />
                <StatBox label="BAB" value={`+${bab?.totalValue ?? 0}`} icon="BA" />
              </YStack>
            </SectionCard>
          </YStack>
        </VerticalSection>

        {/* Columna 2: Ability Scores */}
        <VerticalSection>
          <YStack width="100%" gap={16}>
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
          </YStack>
        </VerticalSection>

        {/* Columna 3: Buffs/Conjuros Activos */}
        <VerticalSection>
          <YStack width="100%" gap={16}>
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
          </YStack>
        </VerticalSection>

        {/* Columna 4: Skills (mock por ahora) */}
        <VerticalSection>
          <YStack width="100%" gap={16}>
            <SectionCard>
              <SectionHeader icon="#" title="Skills" />
              <YStack>
                {MOCK_CHARACTER.skills.map((skill, index) => (
                  <SkillItem key={index} skill={skill} />
                ))}
              </YStack>
            </SectionCard>
          </YStack>
        </VerticalSection>

        {/* Columna 5: Equipment (mock por ahora) */}
        <VerticalSection>
          <YStack width="100%" gap={16}>
            <SectionCard>
              <SectionHeader icon="E" title="Equipment" />
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
          </YStack>
        </VerticalSection>

        {/* Columna 6: Spells (mock por ahora) */}
        <VerticalSection>
          <YStack width="100%" gap={16}>
            <SectionCard>
              <SectionHeader icon="S" title="Spells" />
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
          </YStack>
        </VerticalSection>
      </ColumnsContainer>

      <SidePanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        onBack={goBack}
        canGoBack={canGoBack}
        title={getPanelTitle()}
      >
        {currentPanel?.type === 'ability' && currentPanel?.id && getAbilityForPanel(currentPanel.id) && (
          <AbilityDetailPanel
            abilityKey={currentPanel.id}
            ability={getAbilityForPanel(currentPanel.id)!}
            sourceValues={getCalculatedAbility(currentPanel.id)?.sourceValues}
          />
        )}
        {currentPanel?.type === 'item' && currentPanel?.name && (
          <GenericDetailPanel title={currentPanel.name} />
        )}
      </SidePanel>
    </SidePanelContainer>
  )
}

/**
 * Pantalla de personaje para desktop web.
 * Layout: columnas horizontales con Side Panel para detalles.
 * Inicializa el store de Zustand con los datos del personaje.
 */
export function CharacterScreenDesktop() {
  const setCharacter = useCharacterStore((state) => state.setCharacter)

  // Inicializar el store con el personaje de prueba
  useEffect(() => {
    setCharacter(testCharacterSheet, testBaseData)
  }, [setCharacter])

  return <CharacterScreenDesktopContent />
}
