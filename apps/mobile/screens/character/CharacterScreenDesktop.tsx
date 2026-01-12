import { YStack, XStack } from 'tamagui'
import { usePanelNavigation } from '../../hooks'
import {
  MOCK_CHARACTER,
  ABILITY_INFO,
  SectionHeader,
  SectionCard,
  StatBox,
  AbilityCard,
  SkillItem,
  ItemCard,
  CharacterHeader,
  HpBar,
  AbilityDetailPanel,
  GenericDetailPanel,
} from '../../components/character'
import {
  SidePanel,
  SidePanelContainer,
  ColumnsContainer,
  VerticalSection,
} from '../../components/layout'

/**
 * Pantalla de personaje para desktop web.
 * Layout: columnas horizontales con Side Panel para detalles.
 */
export function CharacterScreenDesktop() {
  const {
    currentPanel,
    isPanelOpen,
    canGoBack,
    openPanel,
    closePanel,
    goBack,
  } = usePanelNavigation()

  const handleAbilityPress = (abilityKey: string) => {
    openPanel(abilityKey, 'ability', ABILITY_INFO[abilityKey]?.name)
  }

  const handleItemPress = (itemId: string, itemName: string) => {
    openPanel(itemId, 'item', itemName)
  }

  const getPanelTitle = (): string => {
    if (currentPanel?.type === 'ability' && currentPanel?.id) {
      return ABILITY_INFO[currentPanel.id]?.name || 'Ability'
    }
    return currentPanel?.name || 'Detail'
  }

  return (
    <SidePanelContainer>
      <ColumnsContainer>
        {/* Columna 1: Avatar + HP + Combat Stats */}
        <VerticalSection>
          <YStack width="100%" gap={16}>
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
          </YStack>
        </VerticalSection>

        {/* Columna 2: Ability Scores */}
        <VerticalSection>
          <YStack width="100%" gap={16}>
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
          </YStack>
        </VerticalSection>

        {/* Columna 3: Skills */}
        <VerticalSection>
          <YStack width="100%" gap={16}>
            <SectionCard>
              <SectionHeader icon="📚" title="Skills" />
              <YStack>
                {MOCK_CHARACTER.skills.map((skill, index) => (
                  <SkillItem key={index} skill={skill} />
                ))}
              </YStack>
            </SectionCard>
          </YStack>
        </VerticalSection>

        {/* Columna 4: Equipment */}
        <VerticalSection>
          <YStack width="100%" gap={16}>
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
          </YStack>
        </VerticalSection>

        {/* Columna 5: Spells */}
        <VerticalSection>
          <YStack width="100%" gap={16}>
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
        {currentPanel?.type === 'ability' && currentPanel?.id && MOCK_CHARACTER.abilities[currentPanel.id as keyof typeof MOCK_CHARACTER.abilities] && (
          <AbilityDetailPanel
            abilityKey={currentPanel.id}
            ability={MOCK_CHARACTER.abilities[currentPanel.id as keyof typeof MOCK_CHARACTER.abilities]}
          />
        )}
        {currentPanel?.type === 'item' && currentPanel?.name && (
          <GenericDetailPanel title={currentPanel.name} />
        )}
      </SidePanel>
    </SidePanelContainer>
  )
}
