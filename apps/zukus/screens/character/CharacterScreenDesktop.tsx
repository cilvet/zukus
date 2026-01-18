import { useState, useEffect } from 'react'
import { YStack, XStack, Text } from 'tamagui'
import { View, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCharacterSync } from '../../hooks'
import {
  useCharacterStore,
  useCharacterSheet,
  useCharacterAbilities,
  useCharacterSavingThrows,
  useCharacterSkills,
  useCharacterLevel,
  useCharacterHitPoints,
  useCharacterArmorClass,
  useCharacterInitiative,
  useCharacterBAB,
  useCharacterBuffs,
  useCharacterImageUrl,
  AbilityCard,
  AbilityCardCompact,
  Checkbox,
  SavingThrowCard,
  ArmorClassCard,
  InitiativeCard,
  InitiativeDetailPanel,
  HitPointsDetailPanel,
  BABCard,
  BABDetailPanel,
  SkillDetailPanel,
} from '../../ui'
import { usePanelNavigation } from '../../hooks'
import {
  MOCK_CHARACTER,
  SectionHeader,
  SectionCard,
  StatBox,
  ItemCard,
  CharacterHeader,
  HpBar,
  AbilityDetailPanel,
  GenericDetailPanel,
  ArmorClassDetailPanel,
} from '../../components/character'
import { SavingThrowDetailPanel } from '../../ui'
import { SkillsSection } from '../../ui/components/character/SkillsSection'
import type { Ability } from '../../components/character/data'
import type { CalculatedAbility, CalculatedAbilities, CalculatedSavingThrow, CalculatedSingleSkill } from '@zukus/core'
import {
  SidePanel,
  SidePanelContainer,
  ColumnsContainer,
  VerticalSection,
} from '../../components/layout'
import { FormulaPlaygroundSection } from '../../components/character'
import { type DetailType, getDetailTitle, isValidDetailType, useNavigateToDetail } from '../../navigation'

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
 * Card de Ability Scores con toggle para desktop
 */
function DesktopAbilitiesCard({
  abilities,
  onAbilityPress,
}: {
  abilities: CalculatedAbilities
  onAbilityPress: (abilityKey: string) => void
}) {
  const [isCompactView, setIsCompactView] = useState(false)

  const toggleView = () => {
    setIsCompactView(!isCompactView)
  }

  return (
    <SectionCard>
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
                    onPress={() => onAbilityPress(key)}
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
              onPress={() => onAbilityPress('strength')}
            />
            <AbilityCard
              abilityKey="dexterity"
              score={abilities.dexterity.totalScore}
              modifier={abilities.dexterity.totalModifier}
              onPress={() => onAbilityPress('dexterity')}
            />
            <AbilityCard
              abilityKey="constitution"
              score={abilities.constitution.totalScore}
              modifier={abilities.constitution.totalModifier}
              onPress={() => onAbilityPress('constitution')}
            />
          </XStack>
          <XStack justifyContent="space-between">
            <AbilityCard
              abilityKey="intelligence"
              score={abilities.intelligence.totalScore}
              modifier={abilities.intelligence.totalModifier}
              onPress={() => onAbilityPress('intelligence')}
            />
            <AbilityCard
              abilityKey="wisdom"
              score={abilities.wisdom.totalScore}
              modifier={abilities.wisdom.totalModifier}
              onPress={() => onAbilityPress('wisdom')}
            />
            <AbilityCard
              abilityKey="charisma"
              score={abilities.charisma.totalScore}
              modifier={abilities.charisma.totalModifier}
              onPress={() => onAbilityPress('charisma')}
            />
          </XStack>
        </YStack>
      )}
    </SectionCard>
  )
}

function HitPointsDetailPanelContainer() {
  const hitPoints = useCharacterHitPoints()
  const abilities = useCharacterAbilities()
  const updateHp = useCharacterStore((state) => state.updateHp)
  const rest = useCharacterStore((state) => state.rest)
  const [hpChange, setHpChange] = useState('')
  const [currentHpInput, setCurrentHpInput] = useState('')
  const [isEditingCurrentHp, setIsEditingCurrentHp] = useState(false)

  useEffect(() => {
    if (!hitPoints) {
      return
    }
    if (!isEditingCurrentHp) {
      setCurrentHpInput(String(hitPoints.currentHp))
    }
  }, [hitPoints, isEditingCurrentHp])

  if (!hitPoints || !abilities) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  const handleHpChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setHpChange(value)
    }
  }

  const handleCurrentHpChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setCurrentHpInput(value)
    }
  }

  const handleCurrentHpFocus = () => {
    setIsEditingCurrentHp(true)
  }

  const handleCurrentHpBlur = () => {
    setIsEditingCurrentHp(false)
    if (currentHpInput === '') {
      setCurrentHpInput(String(hitPoints.currentHp))
      return
    }
    const nextValue = Number.parseInt(currentHpInput, 10)
    if (Number.isNaN(nextValue)) {
      setCurrentHpInput(String(hitPoints.currentHp))
      return
    }
    updateHp(nextValue - hitPoints.currentHp)
    setCurrentHpInput(String(nextValue))
  }

  const getChangeValue = () => {
    if (hpChange === '') {
      return 0
    }
    return Number.parseInt(hpChange, 10)
  }

  const handleHeal = () => {
    updateHp(getChangeValue())
    setHpChange('')
  }

  const handleDamage = () => {
    updateHp(-getChangeValue())
    setHpChange('')
  }

  const handleRest = () => {
    const result = rest()
    if (!result.success) {
      console.warn('Failed to rest:', result.error)
    }
  }

  return (
    <HitPointsDetailPanel
      currentHp={hitPoints.currentHp}
      maxHp={hitPoints.maxHp}
      constitutionScore={abilities.constitution.totalScore}
      constitutionModifier={abilities.constitution.totalModifier}
      currentHpInput={currentHpInput}
      onCurrentHpChange={handleCurrentHpChange}
      onCurrentHpFocus={handleCurrentHpFocus}
      onCurrentHpBlur={handleCurrentHpBlur}
      hpChange={hpChange}
      onHpChange={handleHpChange}
      onHeal={handleHeal}
      onDamage={handleDamage}
      onRest={handleRest}
    />
  )
}


/**
 * Contenido de la pantalla desktop (usa selectores de Zustand).
 */
function CharacterScreenDesktopContent() {
  const characterSheet = useCharacterSheet()
  const abilities = useCharacterAbilities()
  const savingThrows = useCharacterSavingThrows()
  const skills = useCharacterSkills()
  const level = useCharacterLevel()
  const hitPoints = useCharacterHitPoints()
  const armorClass = useCharacterArmorClass()
  const initiative = useCharacterInitiative()
  const bab = useCharacterBAB()
  const buffs = useCharacterBuffs()
  const imageUrl = useCharacterImageUrl()
  const toggleBuff = useCharacterStore((state) => state.toggleBuff)
  const navigateToDetail = useNavigateToDetail()
  const router = useRouter()

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

  const handleSavingThrowPress = (savingThrowKey: string) => {
    openPanel(savingThrowKey, 'savingThrow', getDetailTitle('savingThrow', savingThrowKey))
  }

  const handleArmorClassPress = () => {
    openPanel('armorClass', 'armorClass', getDetailTitle('armorClass', 'armorClass'))
  }

  const handleInitiativePress = () => {
    openPanel('initiative', 'initiative', getDetailTitle('initiative', 'initiative'))
  }

  const handleBABPress = () => {
    openPanel('bab', 'bab', getDetailTitle('bab', 'bab'))
  }

  const handleItemPress = (itemId: string, itemName: string) => {
    openPanel(itemId, 'item', itemName)
  }

  const handleHitPointsPress = () => {
    navigateToDetail('hitPoints', 'hitPoints')
  }

  const handleFormulaPlaygroundPress = () => {
    router.push('/(tabs)/(character)/formula-playground')
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

  const getSavingThrowForPanel = (savingThrowKey: string): CalculatedSavingThrow | null => {
    if (!savingThrows) return null
    return savingThrows[savingThrowKey as keyof typeof savingThrows] ?? null
  }

  const getSkillForPanel = (skillId: string): CalculatedSingleSkill | null => {
    if (!skills) return null
    
    // Buscar en skills directas
    let skill = skills[skillId]
    
    // Si no se encuentra, buscar en sub-skills
    if (!skill) {
      for (const parentSkill of Object.values(skills)) {
        if (parentSkill.type === 'parent') {
          const subSkill = parentSkill.subSkills.find(s => s.uniqueId === skillId)
          if (subSkill) {
            return subSkill
          }
        }
      }
      return null
    }
    
    // Si es parent skill, no mostrarlo
    if (skill.type === 'parent') {
      return null
    }
    
    return skill
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
              imageUrl={imageUrl}
              onFormulaPlaygroundPress={handleFormulaPlaygroundPress}
            />
            <HpBar current={currentHp} max={maxHp} onPress={handleHitPointsPress} />
            {armorClass && (
              <SectionCard>
                <SectionHeader icon="*" title="Armor Class" />
                <ArmorClassCard
                  totalAC={armorClass.totalAc.totalValue}
                  touchAC={armorClass.touchAc.totalValue}
                  flatFootedAC={armorClass.flatFootedAc.totalValue}
                  onPress={handleArmorClassPress}
                />
              </SectionCard>
            )}
            <SectionCard>
              <SectionHeader icon="*" title="Combat Stats" />
              <YStack gap={8}>
                {initiative && (
                  <InitiativeCard
                    totalValue={initiative.totalValue}
                    onPress={handleInitiativePress}
                  />
                )}
                {bab && (
                  <BABCard
                    totalValue={bab.totalValue}
                    multipleAttacks={bab.multipleBaseAttackBonuses}
                    onPress={handleBABPress}
                  />
                )}
              </YStack>
            </SectionCard>
            {savingThrows && (
              <SectionCard>
                <SectionHeader icon="*" title="Saving Throws" />
                <XStack gap={8}>
                  <SavingThrowCard
                    savingThrowKey="fortitude"
                    totalValue={savingThrows.fortitude.totalValue}
                    onPress={() => handleSavingThrowPress('fortitude')}
                  />
                  <SavingThrowCard
                    savingThrowKey="reflex"
                    totalValue={savingThrows.reflex.totalValue}
                    onPress={() => handleSavingThrowPress('reflex')}
                  />
                  <SavingThrowCard
                    savingThrowKey="will"
                    totalValue={savingThrows.will.totalValue}
                    onPress={() => handleSavingThrowPress('will')}
                  />
                </XStack>
              </SectionCard>
            )}
          </YStack>
        </VerticalSection>

        {/* Columna 2: Ability Scores + Skills */}
        <VerticalSection>
          <YStack width="100%" gap={16}>
            <DesktopAbilitiesCard abilities={abilities} onAbilityPress={handleAbilityPress} />
            <SectionCard>
              <SectionHeader icon="#" title="Skills" />
              <SkillsSection />
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

        {/* Columna 4: Equipment (mock por ahora) */}
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

        {/* Columna 5: Spells (mock por ahora) */}
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
        {currentPanel?.type === 'savingThrow' && currentPanel?.id && getSavingThrowForPanel(currentPanel.id) && (
          <SavingThrowDetailPanel
            savingThrowKey={currentPanel.id}
            totalValue={getSavingThrowForPanel(currentPanel.id)!.totalValue}
            sourceValues={getSavingThrowForPanel(currentPanel.id)?.sourceValues}
          />
        )}
        {currentPanel?.type === 'armorClass' && armorClass && (
          <ArmorClassDetailPanel
            totalValue={armorClass.totalAc.totalValue}
            totalSourceValues={armorClass.totalAc.sourceValues}
            touchValue={armorClass.touchAc.totalValue}
            touchSourceValues={armorClass.touchAc.sourceValues}
            flatFootedValue={armorClass.flatFootedAc.totalValue}
            flatFootedSourceValues={armorClass.flatFootedAc.sourceValues}
          />
        )}
        {currentPanel?.type === 'initiative' && initiative && (
          <InitiativeDetailPanel
            totalValue={initiative.totalValue}
            sourceValues={initiative.sourceValues}
          />
        )}
        {currentPanel?.type === 'bab' && bab && (
          <BABDetailPanel
            totalValue={bab.totalValue}
            multipleAttacks={bab.multipleBaseAttackBonuses}
            sourceValues={bab.sourceValues}
          />
        )}
        {currentPanel?.type === 'hitPoints' && (
          <HitPointsDetailPanelContainer />
        )}
        {currentPanel?.type === 'skill' && currentPanel?.id && getSkillForPanel(currentPanel.id) && (
          <SkillDetailPanel
            skillName={getSkillForPanel(currentPanel.id)!.name}
            abilityKey={getSkillForPanel(currentPanel.id)!.abilityModifierUniqueId}
            totalBonus={getSkillForPanel(currentPanel.id)!.totalBonus}
            isClassSkill={getSkillForPanel(currentPanel.id)!.isClassSkill}
            sourceValues={getSkillForPanel(currentPanel.id)!.sourceValues}
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
 * Consume el personaje cargado en el store.
 */
export function CharacterScreenDesktop() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const characterId = id ?? ''
  const { isLoading, error } = useCharacterSync(characterId)

  if (!characterId) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Text color="$placeholderColor">Personaje invalido.</Text>
      </YStack>
    )
  }

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Text color="$placeholderColor">Cargando personaje...</Text>
      </YStack>
    )
  }

  if (error) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Text color="$colorFocus">{error}</Text>
      </YStack>
    )
  }

  return <CharacterScreenDesktopContent />
}
