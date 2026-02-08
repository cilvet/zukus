import { useState, useEffect } from 'react'
import { YStack, XStack, Text, Spinner } from 'tamagui'
import { View, Pressable } from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getBuildString } from '@zukus/core'
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
  useCharacterAttacks,
  useCharacterBaseData,
  useComputedEntities,
  usePrimaryCGE,
  useDraftBuff,
  useBuffEditActions,
  AbilityCard,
  AbilityCardCompact,
  Checkbox,
  EquipmentList,
  EquipmentLayoutToggle,
  EquipmentDetailPanel,
  type EquipmentLayout,
  InventoryList,
  InventoryHeader,
  useInventoryState,
  SavingThrowCard,
  ArmorClassCard,
  InitiativeCard,
  InitiativeDetailPanel,
  HitPointsDetailPanel,
  BABCard,
  BABDetailPanel,
  SkillDetailPanel,
  AttacksSection,
  AttackDetailPanel,
  EntityTypeGroup,
  GenericEntityDetailPanel,
  BuffDetailPanel,
  BuffEditScreen,
  ChangeEditScreen,
  BuffsCompact,
  AllBuffsDetailPanel,
  useTheme,
} from '../../ui'
import { LevelDetail, ClassSelectorDetail, updateLevelHp, updateLevelClass, getAvailableClasses, type ProviderWithResolution } from '../../ui/components/character/editor'
import { usePanelNavigation } from '../../hooks'
import {
  SectionHeader,
  SectionCard,
  CharacterHeader,
  HpBar,
  AbilityDetailPanel,
  GenericDetailPanel,
  ArmorClassDetailPanel,
  CGEManagementPanel,
  CGEEntitySelectPanel,
  CGETabView,
  ItemBrowserPanel,
  CurrencyEditPanel,
} from '../../components/character'
import { ChatScreenWeb } from '../chat/ChatScreenWeb'
import { CompendiumEntityDetail } from '../../components/compendiums'
import { SavingThrowDetailPanel } from '../../ui'
import { SkillsSection } from '../../ui/components/character/SkillsSection'
import type { Ability } from '../../components/character/data'
import type { CalculatedAbility, CalculatedAbilities, CalculatedSavingThrow, CalculatedSingleSkill, ComputedEntity, ProviderLocation, StandardEntity, EntityInstance } from '@zukus/core'
import { resolveProvider, getSelectedEntityInstances } from '@zukus/core'
import { useCompendiumContext, EntitySelectorDetail } from '../../ui/components/EntityProvider'
import {
  Breadcrumb,
  SidePanel,
  SidePanelContainer,
  ColumnsContainer,
  VerticalSection,
} from '../../components/layout'
import { getDetailTitle, isValidDetailType, useNavigateToDetail } from '../../navigation'

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
 * Returns a label for CGE entity type (localized).
 */
function getCGELabel(entityType: string): string {
  const labels: Record<string, string> = {
    spell: 'Conjuros',
    power: 'Poderes',
    maneuver: 'Maniobras',
    invocation: 'Invocaciones',
  }
  return labels[entityType] ?? 'Habilidades'
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
  const { id: characterId } = useLocalSearchParams<{ id: string }>()
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
  const attackData = useCharacterAttacks()
  const imageUrl = useCharacterImageUrl()
  const computedEntities = useComputedEntities()
  const primaryCGE = usePrimaryCGE()
  const toggleBuff = useCharacterStore((state) => state.toggleBuff)
  const editBuff = useCharacterStore((state) => state.editBuff)
  const deleteBuff = useCharacterStore((state) => state.deleteBuff)
  const toggleItemEquipped = useCharacterStore((state) => state.toggleItemEquipped)
  const toggleInventoryEquipped = useCharacterStore((state) => state.toggleInventoryEquipped)
  const rest = useCharacterStore((state) => state.rest)
  const navigateToDetail = useNavigateToDetail()
  const router = useRouter()
  const inventoryState = useInventoryState()
  const baseData = useCharacterBaseData()
  const { themeInfo } = useTheme()
  const [equipmentLayout, setEquipmentLayout] = useState<EquipmentLayout>('balanced')

  const entitiesByType = (() => {
    const groups: Record<string, ComputedEntity[]> = {}
    for (const entity of computedEntities) {
      const type = entity.entityType
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(entity)
    }
    return groups
  })()

  const entityTypes = Object.keys(entitiesByType).sort()

  // CGE labels
  const cgeLabel = primaryCGE ? getCGELabel(primaryCGE.entityType) : ''

  const {
    currentPanel,
    isPanelOpen,
    canGoBack,
    openPanel,
    closePanel,
    goBack,
  } = usePanelNavigation('character')

  // Helper para parsear el path del panel: "type/id"
  const parsePanelPath = (path: string | undefined): { type: string; id: string } | null => {
    if (!path) return null
    const [type, ...rest] = path.split('/')
    const id = rest.join('/')
    if (!type || !id) return null
    return { type, id }
  }

  const panelInfo = parsePanelPath(currentPanel?.path)

  const handleAbilityPress = (abilityKey: string) => {
    openPanel(`ability/${abilityKey}`, getDetailTitle('ability', abilityKey))
  }

  const handleSavingThrowPress = (savingThrowKey: string) => {
    openPanel(`savingThrow/${savingThrowKey}`, getDetailTitle('savingThrow', savingThrowKey))
  }

  const handleArmorClassPress = () => {
    openPanel('armorClass/armorClass', getDetailTitle('armorClass', 'armorClass'))
  }

  const handleInitiativePress = () => {
    openPanel('initiative/initiative', getDetailTitle('initiative', 'initiative'))
  }

  const handleBABPress = () => {
    openPanel('bab/bab', getDetailTitle('bab', 'bab'))
  }

  const handleEquipmentPress = (itemId: string, itemName: string) => {
    openPanel(`equipment/${itemId}`, itemName)
  }

  const handleInventoryItemPress = (instanceId: string, itemName: string) => {
    openPanel(`inventoryItem/${instanceId}`, itemName)
  }

  const handleAttackPress = (attack: { weaponUniqueId?: string; name: string }) => {
    const id = attack.weaponUniqueId ?? attack.name
    openPanel(`attack/${id}`, attack.name)
  }

  const handleEntityPress = (entity: ComputedEntity) => {
    openPanel(`computedEntity/${entity.id}`, entity.name)
  }

  const attackForPanel =
    panelInfo?.type === 'attack' && panelInfo?.id && attackData
      ? attackData.attacks.find(
          (a) => a.weaponUniqueId === panelInfo.id || a.name === panelInfo.id
        )
      : null

  const entityForPanel =
    panelInfo?.type === 'computedEntity' && panelInfo?.id
      ? computedEntities.find((e) => e.id === panelInfo.id) ?? null
      : null

  const handleHitPointsPress = () => {
    navigateToDetail('hitPoints', 'hitPoints')
  }

  const handleFormulaPlaygroundPress = () => {
    router.push('/characters/formula-playground')
  }

  const handleChatPress = () => {
    navigateToDetail('chat', 'chat')
  }

  const handleEditPress = () => {
    if (characterId) {
      router.push(`/characters/edit/${characterId}`)
    }
  }

  const handleRestPress = () => {
    const result = rest()
    if (!result.success) {
      console.warn('Failed to rest:', result.error)
    }
  }

  const getPanelTitle = (): string => {
    if (!panelInfo) {
      return currentPanel?.title ?? 'Detail'
    }
    if (!isValidDetailType(panelInfo.type)) {
      return currentPanel?.title ?? 'Detail'
    }
    return getDetailTitle(panelInfo.type, panelInfo.id, currentPanel?.title)
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

  const getEquipmentItemForPanel = (itemId: string) => {
    if (!characterSheet) return null
    return characterSheet.equipment.items.find((item) => item.uniqueId === itemId) ?? null
  }

  const getBuffForPanel = (buffId: string) => {
    return buffs.find((buff) => buff.uniqueId === buffId) ?? null
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
  const buildString = baseData ? getBuildString(baseData) : null
  const currentHp = hitPoints?.currentHp ?? 0
  const maxHp = hitPoints?.maxHp ?? 0

  return (
    <SidePanelContainer>
      <XStack paddingHorizontal={24} paddingVertical={10}>
        <Breadcrumb
          segments={[
            { label: 'Mis Personajes', onPress: () => router.push('/characters') },
            { label: characterSheet.name || 'Personaje' },
          ]}
        />
      </XStack>
      <ColumnsContainer>
        {/* Columna 1: Avatar + HP + Combat Stats */}
        <VerticalSection>
          <YStack width="100%" gap={16}>
            <CharacterHeader
              name={characterSheet.name}
              build={buildString}
              imageUrl={imageUrl}
              onRestPress={handleRestPress}
              onFormulaPlaygroundPress={handleFormulaPlaygroundPress}
              onChatPress={handleChatPress}
              onEditPress={handleEditPress}
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
            <SectionCard>
              <SectionHeader icon="*" title="Buffs" />
              <BuffsCompact />
            </SectionCard>
            {attackData && attackData.attacks.length > 0 && (
              <SectionCard>
                <SectionHeader icon="*" title="Attacks" />
                <AttacksSection
                  attacks={attackData.attacks}
                  onAttackPress={handleAttackPress}
                />
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

        {/* Columna 3: Inventory (new entity-based system) */}
        <VerticalSection>
          <YStack width="100%" gap={16}>
            <SectionCard>
              <SectionHeader
                icon="I"
                title="Inventario"
                action={
                  <Pressable onPress={() => openPanel('itemBrowser/browse', 'Buscar Items')} hitSlop={8}>
                    {({ pressed }) => (
                      <XStack
                        backgroundColor={themeInfo.colors.accent}
                        paddingHorizontal={10}
                        paddingVertical={6}
                        borderRadius={6}
                        alignItems="center"
                        gap={4}
                        opacity={pressed ? 0.7 : 1}
                      >
                        <FontAwesome6 name="plus" size={12} color="#FFFFFF" />
                        <Text fontSize={12} fontWeight="600" color="#FFFFFF">
                          Anadir
                        </Text>
                      </XStack>
                    )}
                  </Pressable>
                }
              />
              <InventoryHeader
                currentWeight={inventoryState.items.reduce((total, item) => {
                  const weight = item.entity?.weight
                  if (typeof weight === 'number') {
                    return total + weight * item.quantity
                  }
                  return total
                }, 0)}
                maxWeight={100}
                currencies={inventoryState.currencies}
                onCurrenciesPress={() => openPanel('currencyEdit/edit', 'Monedas')}
              />
              {inventoryState.items.length === 0 ? (
                <Text color="$placeholderColor">Sin items en el inventario.</Text>
              ) : (
                <InventoryList
                  items={inventoryState.items}
                  onItemPress={(item) => {
                    const name = item.customName ?? item.entity?.name ?? item.itemId
                    handleInventoryItemPress(item.instanceId, name)
                  }}
                  onToggleEquipped={(item) => toggleInventoryEquipped(item.instanceId)}
                />
              )}
            </SectionCard>
            {/* Legacy equipment for reference (can be removed later) */}
            {characterSheet && characterSheet.equipment.items.length > 0 && (
              <SectionCard>
                <SectionHeader
                  icon="E"
                  title="Equipment (Legacy)"
                  action={<EquipmentLayoutToggle layout={equipmentLayout} onChange={setEquipmentLayout} />}
                />
                <EquipmentList
                  items={characterSheet.equipment.items}
                  layout={equipmentLayout}
                  onItemPress={(item) => handleEquipmentPress(item.uniqueId, item.name)}
                  onToggleEquipped={(item) => toggleItemEquipped(item.uniqueId)}
                />
              </SectionCard>
            )}
          </YStack>
        </VerticalSection>

        {/* Columna 4: CGE (Spells/Abilities) */}
        {primaryCGE && (
          <VerticalSection>
            <YStack width="100%" gap={16}>
              <SectionCard>
                <SectionHeader icon="*" title={cgeLabel} />
                <CGETabView cge={primaryCGE} />
              </SectionCard>
            </YStack>
          </VerticalSection>
        )}

        {/* Columna 5: Entities */}
        {computedEntities.length > 0 && (
          <VerticalSection>
            <YStack width="100%" gap={16}>
              <SectionCard>
                <SectionHeader icon="E" title="Entities" />
                <YStack gap={16}>
                  {entityTypes.map((entityType) => (
                    <EntityTypeGroup
                      key={entityType}
                      entityType={entityType}
                      entities={entitiesByType[entityType]}
                      onEntityPress={handleEntityPress}
                    />
                  ))}
                </YStack>
              </SectionCard>
            </YStack>
          </VerticalSection>
        )}
      </ColumnsContainer>

      <SidePanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        onBack={goBack}
        canGoBack={canGoBack}
        title={getPanelTitle()}
        disableScroll={panelInfo?.type === 'chat' || panelInfo?.type === 'cgeEntitySelect' || panelInfo?.type === 'compendiumEntity' || panelInfo?.type === 'itemBrowser'}
      >
        {panelInfo?.type === 'ability' && panelInfo?.id && getAbilityForPanel(panelInfo.id) && (
          <AbilityDetailPanel
            abilityKey={panelInfo.id}
            ability={getAbilityForPanel(panelInfo.id)!}
            sourceValues={getCalculatedAbility(panelInfo.id)?.sourceValues}
          />
        )}
        {panelInfo?.type === 'savingThrow' && panelInfo?.id && getSavingThrowForPanel(panelInfo.id) && (
          <SavingThrowDetailPanel
            savingThrowKey={panelInfo.id}
            totalValue={getSavingThrowForPanel(panelInfo.id)!.totalValue}
            sourceValues={getSavingThrowForPanel(panelInfo.id)?.sourceValues}
          />
        )}
        {panelInfo?.type === 'armorClass' && armorClass && (
          <ArmorClassDetailPanel
            totalValue={armorClass.totalAc.totalValue}
            totalSourceValues={armorClass.totalAc.sourceValues}
            touchValue={armorClass.touchAc.totalValue}
            touchSourceValues={armorClass.touchAc.sourceValues}
            flatFootedValue={armorClass.flatFootedAc.totalValue}
            flatFootedSourceValues={armorClass.flatFootedAc.sourceValues}
          />
        )}
        {panelInfo?.type === 'initiative' && initiative && (
          <InitiativeDetailPanel
            totalValue={initiative.totalValue}
            sourceValues={initiative.sourceValues}
          />
        )}
        {panelInfo?.type === 'bab' && bab && (
          <BABDetailPanel
            totalValue={bab.totalValue}
            multipleAttacks={bab.multipleBaseAttackBonuses}
            sourceValues={bab.sourceValues}
          />
        )}
        {panelInfo?.type === 'hitPoints' && (
          <HitPointsDetailPanelContainer />
        )}
        {panelInfo?.type === 'skill' && panelInfo?.id && getSkillForPanel(panelInfo.id) && (
          <SkillDetailPanel
            skillName={getSkillForPanel(panelInfo.id)!.name}
            abilityKey={getSkillForPanel(panelInfo.id)!.abilityModifierUniqueId}
            totalBonus={getSkillForPanel(panelInfo.id)!.totalBonus}
            isClassSkill={getSkillForPanel(panelInfo.id)!.isClassSkill}
            sourceValues={getSkillForPanel(panelInfo.id)!.sourceValues}
          />
        )}
        {attackForPanel && attackData && (
          <AttackDetailPanel attack={attackForPanel} attackData={attackData} />
        )}
        {panelInfo?.type === 'equipment' && panelInfo?.id && getEquipmentItemForPanel(panelInfo.id) && (
          <EquipmentDetailPanel
            item={getEquipmentItemForPanel(panelInfo.id)!}
            onToggleEquipped={() => toggleItemEquipped(panelInfo.id)}
          />
        )}
        {panelInfo?.type === 'inventoryItem' && panelInfo?.id && (
          <InventoryItemDetailPanelContainer instanceId={panelInfo.id} />
        )}
        {panelInfo?.type === 'itemBrowser' && (
          <ItemBrowserPanel />
        )}
        {panelInfo?.type === 'currencyEdit' && (
          <CurrencyEditPanel />
        )}
        {panelInfo?.type === 'buff' && panelInfo?.id && getBuffForPanel(panelInfo.id) && (
          <BuffDetailPanel
            buff={getBuffForPanel(panelInfo.id)!}
            onToggleActive={() => toggleBuff(panelInfo.id)}
            onEdit={() => navigateToDetail('buffEdit', panelInfo.id, `Edit: ${getBuffForPanel(panelInfo.id)!.name}`)}
            onDelete={() => {
              deleteBuff(panelInfo.id)
              closePanel()
            }}
          />
        )}
        {panelInfo?.type === 'buffEdit' && panelInfo?.id && (
          <BuffEditPanelContainer buffId={panelInfo.id} />
        )}
        {panelInfo?.type === 'changeEdit' && panelInfo?.id && (
          <ChangeEditPanelContainer changeId={panelInfo.id} />
        )}
        {panelInfo?.type === 'allBuffs' && (
          <AllBuffsDetailPanel />
        )}
        {panelInfo?.type === 'item' && currentPanel?.title && (
          <GenericDetailPanel title={currentPanel.title} />
        )}
        {panelInfo?.type === 'chat' && (
          <ChatScreenWeb />
        )}
        {panelInfo?.type === 'levelDetail' && panelInfo?.id && (
          <LevelDetailPanelContainer levelIndex={parseInt(panelInfo.id)} />
        )}
        {panelInfo?.type === 'classSelectorDetail' && panelInfo?.id && (
          <ClassSelectorDetailPanelContainer levelIndex={parseInt(panelInfo.id)} />
        )}
        {panelInfo?.type === 'entitySelectorDetail' && panelInfo?.id && (
          <EntitySelectorDetailPanelContainer locationJson={panelInfo.id} />
        )}
        {entityForPanel && (
          <GenericEntityDetailPanel entity={entityForPanel} />
        )}
        {panelInfo?.type === 'cgeManagement' && (
          <CGEManagementPanel />
        )}
        {panelInfo?.type === 'cgeEntitySelect' && panelInfo?.id && (
          <CGEEntitySelectPanel selectionId={panelInfo.id} />
        )}
        {panelInfo?.type === 'compendiumEntity' && panelInfo?.id && (
          <CompendiumEntityDetail entityId={panelInfo.id} />
        )}
      </SidePanel>
    </SidePanelContainer>
  )
}

function LevelDetailPanelContainer({ levelIndex }: { levelIndex: number }) {
  const baseData = useCharacterBaseData()
  const { updater } = useCharacterStore()
  const { openPanel } = usePanelNavigation('character')
  const navigateToDetail = useNavigateToDetail('character')
  const { getEntity, getEntityById, getAllEntities, getAllEntitiesFromAllTypes } = useCompendiumContext()

  if (!baseData || !updater) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  const levelNumber = levelIndex + 1
  const levelSlot = baseData.levelSlots?.[levelIndex] ?? { classId: null, hpRoll: null }
  const classEntity = levelSlot.classId ? baseData.classEntities?.[levelSlot.classId] : null
  const className = classEntity?.name ?? null
  const hitDie = classEntity?.hitDie ?? null

  // Calculate class level for this specific slot
  function getClassLevelAtSlot(levelSlots: typeof baseData.levelSlots, index: number): number {
    if (!levelSlots) return 0
    const currentSlot = levelSlots[index]
    if (!currentSlot?.classId) return 0
    let count = 0
    for (let i = 0; i <= index; i++) {
      if (levelSlots[i]?.classId === currentSlot.classId) {
        count++
      }
    }
    return count
  }

  const classLevel = getClassLevelAtSlot(baseData.levelSlots, levelIndex)

  // Get class providers for this level
  const classProviders: ProviderWithResolution[] = []
  if (classEntity && classLevel) {
    const levelRow = classEntity.levels?.[String(classLevel)]
    const providers = levelRow?.providers || []
    providers.forEach((provider, providerIndex) => {
      const providerLocation: ProviderLocation = {
        type: 'classLevel',
        classId: levelSlot.classId!,
        classLevel,
        providerIndex,
      }
      const entityType = provider.selector?.entityType
      const allEntities = entityType ? getAllEntities(entityType) : getAllEntitiesFromAllTypes()
      const getEntityFn = (id: string) => entityType ? getEntity(entityType, id) : getEntityById(id)
      const resolution = resolveProvider(provider, allEntities, getEntityFn, { '@characterLevel': levelNumber })
      const grantedEntities = resolution.granted?.entities || []
      const selectedEntities = getSelectedEntityInstances(baseData, providerLocation)
      classProviders.push({ provider, providerLocation, grantedEntities, selectedEntities })
    })
  }

  // Get system-level providers (feats, ability increases)
  const systemProviders: ProviderWithResolution[] = []
  const systemLevels = baseData.systemLevelsEntity
  if (systemLevels) {
    const levelRow = systemLevels.levels?.[String(levelNumber)]
    const providers = levelRow?.providers || []
    providers.forEach((provider, providerIndex) => {
      const providerLocation: ProviderLocation = {
        type: 'systemLevel',
        characterLevel: levelNumber,
        providerIndex,
      }
      const entityType = provider.selector?.entityType
      const allEntities = entityType ? getAllEntities(entityType) : getAllEntitiesFromAllTypes()
      const getEntityFn = (id: string) => entityType ? getEntity(entityType, id) : getEntityById(id)
      const resolution = resolveProvider(provider, allEntities, getEntityFn, { '@characterLevel': levelNumber })
      const grantedEntities = resolution.granted?.entities || []
      const selectedEntities = getSelectedEntityInstances(baseData, providerLocation)
      systemProviders.push({ provider, providerLocation, grantedEntities, selectedEntities })
    })
  }

  const handleOpenClassSelector = () => {
    openPanel(`classSelectorDetail/${levelIndex}`)
  }

  const handleHpChange = (hp: number | null) => {
    updateLevelHp(baseData, updater, levelIndex, hp)
  }

  const handleRollHp = () => {
    // Placeholder
  }

  const handleSelectorPress = (providerLocation: ProviderLocation) => {
    // Navigate to entity selector detail
    // We encode the provider location as JSON in the id
    const locationJson = JSON.stringify(providerLocation)
    navigateToDetail('entitySelectorDetail', locationJson)
  }

  const handleGrantedEntityPress = (entity: StandardEntity) => {
    navigateToDetail('compendiumEntity', entity.id, entity.name)
  }

  const handleSelectedEntityPress = (instance: EntityInstance) => {
    navigateToDetail('compendiumEntity', instance.entity.id, instance.entity.name)
  }

  return (
    <LevelDetail
      levelIndex={levelIndex}
      levelSlot={levelSlot}
      className={className}
      classLevel={classLevel}
      hitDie={hitDie}
      systemProviders={systemProviders}
      classProviders={classProviders}
      onOpenClassSelector={handleOpenClassSelector}
      onHpChange={handleHpChange}
      onRollHp={handleRollHp}
      onSelectorPress={handleSelectorPress}
      onGrantedEntityPress={handleGrantedEntityPress}
      onSelectedEntityPress={handleSelectedEntityPress}
    />
  )
}

function ClassSelectorDetailPanelContainer({ levelIndex }: { levelIndex: number }) {
  const baseData = useCharacterBaseData()
  const { updater } = useCharacterStore()
  const { closePanel } = usePanelNavigation('character')

  if (!baseData || !updater) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  const levelSlot = baseData.levelSlots?.[levelIndex]
  const currentClassId = levelSlot?.classId ?? null

  const handleSelectClass = (classId: string) => {
    updateLevelClass(baseData, updater, levelIndex, classId)
    closePanel()
  }

  const handleClose = () => {
    closePanel()
  }

  const availableClasses = getAvailableClasses()

  return (
    <ClassSelectorDetail
      levelIndex={levelIndex}
      currentClassId={currentClassId}
      availableClasses={availableClasses}
      onSelectClass={handleSelectClass}
      onClose={handleClose}
    />
  )
}

function EntitySelectorDetailPanelContainer({ locationJson }: { locationJson: string }) {
  // Parse the provider location from JSON
  let providerLocation: ProviderLocation | null = null
  try {
    providerLocation = JSON.parse(locationJson)
  } catch {
    // Invalid JSON
  }

  if (!providerLocation) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Invalid provider location</Text>
      </YStack>
    )
  }

  return <EntitySelectorDetail providerLocation={providerLocation} />
}

function BuffEditPanelContainer({ buffId }: { buffId: string }) {
  const buffs = useCharacterBuffs()
  const deleteBuff = useCharacterStore((state) => state.deleteBuff)
  const { openPanel, closePanel } = usePanelNavigation('character')
  const draftBuff = useDraftBuff()
  const { startEditing, save, discard } = useBuffEditActions()

  const originalBuff = buffs.find((b) => b.uniqueId === buffId)

  // Iniciar edicion si no hay draft o es de otro buff
  useEffect(() => {
    if (originalBuff && (!draftBuff || draftBuff.uniqueId !== buffId)) {
      startEditing(originalBuff)
    }
  }, [originalBuff, draftBuff, buffId, startEditing])

  // Usar el draft si existe, si no el original
  const buff = draftBuff?.uniqueId === buffId ? draftBuff : originalBuff

  if (!buff) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Buff no encontrado</Text>
      </YStack>
    )
  }

  const handleSave = () => {
    save()
    openPanel(`buff/${buffId}`)
  }

  const handleDelete = () => {
    discard()
    deleteBuff(buffId)
    closePanel()
  }

  const handleCancel = () => {
    discard()
    openPanel(`buff/${buffId}`)
  }

  return (
    <BuffEditScreen
      buff={buff}
      onSave={handleSave}
      onDelete={handleDelete}
      onCancel={handleCancel}
    />
  )
}

function ChangeEditPanelContainer({ changeId }: { changeId: string }) {
  const { openPanel } = usePanelNavigation('character')
  const draftBuff = useDraftBuff()
  const { updateChange, addChange, deleteChange } = useBuffEditActions()

  // Parsear el id: buffId:changeIndex o buffId:new
  const [buffId, indexStr] = changeId.split(':')
  const isNew = indexStr === 'new'
  const changeIndex = isNew ? -1 : parseInt(indexStr, 10)

  // Leer del draft (ya deberia estar inicializado desde BuffEditPanelContainer)
  if (!draftBuff || draftBuff.uniqueId !== buffId) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Buff no encontrado en edicion</Text>
      </YStack>
    )
  }

  const changes = draftBuff.changes ?? []
  const change = isNew ? null : changes[changeIndex]

  if (!isNew && !change) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Change no encontrado</Text>
      </YStack>
    )
  }

  type AnyChange = NonNullable<typeof draftBuff.changes>[number]

  const handleSave = (updatedChange: AnyChange) => {
    if (isNew) {
      addChange(updatedChange)
    } else {
      updateChange(changeIndex, updatedChange)
    }
    openPanel(`buffEdit/${buffId}`)
  }

  const handleDelete = () => {
    deleteChange(changeIndex)
    openPanel(`buffEdit/${buffId}`)
  }

  const handleCancel = () => {
    openPanel(`buffEdit/${buffId}`)
  }

  return (
    <ChangeEditScreen
      change={change ?? null}
      isNew={isNew}
      onSave={handleSave}
      onDelete={isNew ? undefined : handleDelete}
      onCancel={handleCancel}
    />
  )
}

function InventoryItemDetailPanelContainer({ instanceId }: { instanceId: string }) {
  const inventoryState = useInventoryState()
  const setInventoryInstanceField = useCharacterStore((state) => state.setInventoryInstanceField)
  const updateInventoryItem = useCharacterStore((state) => state.updateInventoryItem)
  const removeFromInventory = useCharacterStore((state) => state.removeFromInventory)
  const { closePanel } = usePanelNavigation('character')

  const item = inventoryState.items.find((i) => i.instanceId === instanceId)

  if (!item) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Item no encontrado</Text>
      </YStack>
    )
  }

  // Convert InventoryItemInstance to ComputedEntity format for GenericEntityDetailPanel
  const entity = item.entity
  if (!entity) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Entity data not available</Text>
      </YStack>
    )
  }

  // Merge quantity from item into entity so it appears in instance fields
  const computedEntity: ComputedEntity = {
    ...entity,
    quantity: item.quantity,
    _meta: {
      source: {
        type: 'inventory' as any,
        instanceId: item.instanceId,
      },
      suppressed: false,
    },
  }

  const handleRemove = () => {
    removeFromInventory(instanceId)
    closePanel()
  }

  const handleInstanceFieldChange = (field: string, value: unknown) => {
    // Handle quantity separately (it's stored directly on InventoryItemInstance)
    if (field === 'quantity' && typeof value === 'number') {
      updateInventoryItem(instanceId, { quantity: value })
      return
    }
    // Handle boolean instance fields (equipped, wielded, active, etc.)
    if (typeof value === 'boolean') {
      setInventoryInstanceField(instanceId, field, value)
    }
  }

  return (
    <YStack gap={16}>
      <GenericEntityDetailPanel
        entity={computedEntity}
        onInstanceFieldChange={handleInstanceFieldChange}
      />
      <XStack gap={8} paddingHorizontal={16}>
        <Pressable onPress={handleRemove}>
          <YStack
            padding={8}
            borderRadius={6}
            backgroundColor="$red4"
            borderWidth={1}
            borderColor="$red8"
          >
            <Text fontSize={12} color="$red10">
              Remove
            </Text>
          </YStack>
        </Pressable>
      </XStack>
    </YStack>
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

  if (isLoading || error) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Spinner size="large" color="$accentColor" />
      </YStack>
    )
  }

  return <CharacterScreenDesktopContent />
}
