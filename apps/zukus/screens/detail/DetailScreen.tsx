import { useState, useEffect } from 'react'
import { ScrollView, StyleSheet, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { Text, YStack } from 'tamagui'
import { useCharacterStore, useCharacterSheet, useCharacterAbilities, useCharacterSavingThrows, useCharacterArmorClass, useCharacterInitiative, useCharacterBAB, useCharacterSkills, useCharacterHitPoints, useCharacterAttacks, useTheme, SavingThrowDetailPanel, InitiativeDetailPanel, BABDetailPanel, SkillDetailPanel, HitPointsDetailPanel, AttackDetailPanel, EquipmentDetailPanel, useCharacterBaseData, useComputedEntities, GenericEntityDetailPanel } from '../../ui'
import { AbilityDetailPanel, ArmorClassDetailPanel } from '../../components/character'
import { LevelDetail, ClassSelectorDetail, updateLevelHp, updateLevelClass, getAvailableClasses } from '../../ui/components/character/editor'
import type { Ability } from '../../components/character/data'
import type { CalculatedAbility, CalculatedSavingThrow } from '@zukus/core'
import { type DetailType, isValidDetailType, getDetailTitle, useNavigateToDetail } from '../../navigation'
import { ChatScreen } from '../chat/ChatScreen'

type SlugParams = {
  slug: string[]
}

type ParsedSlug = {
  type: DetailType | null
  id: string | null
  extra: string[]
}

function parseSlug(slug: string | string[] | undefined): ParsedSlug {
  if (!slug) {
    return { type: null, id: null, extra: [] }
  }
  
  const parts = Array.isArray(slug) ? slug : [slug]
  const [type, id, ...extra] = parts
  
  if (!isValidDetailType(type)) {
    return { type: null, id: id ?? null, extra }
  }
  
  return {
    type,
    id: id ?? null,
    extra,
  }
}

function AbilityDetail({ abilityKey }: { abilityKey: string }) {
  const abilities = useCharacterAbilities()

  if (!abilities) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  const coreAbility = abilities[abilityKey] as CalculatedAbility | undefined
  if (!coreAbility) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Ability no encontrada: {abilityKey}</Text>
      </YStack>
    )
  }

  const ability: Ability = {
    score: coreAbility.totalScore,
    modifier: coreAbility.totalModifier,
  }

  return (
    <AbilityDetailPanel
      abilityKey={abilityKey}
      ability={ability}
      sourceValues={coreAbility.sourceValues}
    />
  )
}

function SavingThrowDetail({ savingThrowKey }: { savingThrowKey: string }) {
  const savingThrows = useCharacterSavingThrows()

  if (!savingThrows) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  const savingThrow = savingThrows[savingThrowKey as keyof typeof savingThrows] as CalculatedSavingThrow | undefined
  if (!savingThrow) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Saving Throw no encontrado: {savingThrowKey}</Text>
      </YStack>
    )
  }

  return (
    <SavingThrowDetailPanel
      savingThrowKey={savingThrowKey}
      totalValue={savingThrow.totalValue}
      sourceValues={savingThrow.sourceValues}
    />
  )
}

function EquipmentDetail({ itemId }: { itemId: string }) {
  const characterSheet = useCharacterSheet()
  const toggleItemEquipped = useCharacterStore((state) => state.toggleItemEquipped)

  if (!characterSheet) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  const item = characterSheet.equipment.items.find((entry) => entry.uniqueId === itemId)
  if (!item) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Item no encontrado: {itemId}</Text>
      </YStack>
    )
  }

  return (
    <EquipmentDetailPanel
      item={item}
      onToggleEquipped={() => toggleItemEquipped(item.uniqueId)}
    />
  )
}

function ArmorClassDetail() {
  const armorClass = useCharacterArmorClass()

  if (!armorClass) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  return (
    <ArmorClassDetailPanel
      totalValue={armorClass.totalAc.totalValue}
      totalSourceValues={armorClass.totalAc.sourceValues}
      touchValue={armorClass.touchAc.totalValue}
      touchSourceValues={armorClass.touchAc.sourceValues}
      flatFootedValue={armorClass.flatFootedAc.totalValue}
      flatFootedSourceValues={armorClass.flatFootedAc.sourceValues}
    />
  )
}

function InitiativeDetail() {
  const initiative = useCharacterInitiative()

  if (!initiative) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  return (
    <InitiativeDetailPanel
      totalValue={initiative.totalValue}
      sourceValues={initiative.sourceValues}
    />
  )
}

function BABDetail() {
  const bab = useCharacterBAB()

  if (!bab) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  return (
    <BABDetailPanel
      totalValue={bab.totalValue}
      multipleAttacks={bab.multipleBaseAttackBonuses}
      sourceValues={bab.sourceValues}
    />
  )
}

function SkillDetail({ skillId }: { skillId: string }) {
  const skills = useCharacterSkills()

  if (!skills) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  // Buscar en skills y en sub-skills
  let skill = skills[skillId]
  
  if (!skill) {
    // Buscar en sub-skills de parent skills
    for (const parentSkill of Object.values(skills)) {
      if (parentSkill.type === 'parent') {
        const subSkill = parentSkill.subSkills.find(s => s.uniqueId === skillId)
        if (subSkill) {
          skill = subSkill
          break
        }
      }
    }
  }

  if (!skill) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Skill no encontrada: {skillId}</Text>
      </YStack>
    )
  }

  if (skill.type === 'parent') {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">
          Esta es una parent skill. Selecciona una sub-skill específica.
        </Text>
      </YStack>
    )
  }

  return (
    <SkillDetailPanel
      skillName={skill.name}
      abilityKey={skill.abilityModifierUniqueId}
      totalBonus={skill.totalBonus}
      isClassSkill={skill.isClassSkill}
      sourceValues={skill.sourceValues}
    />
  )
}

function AttackDetail({ attackId }: { attackId: string }) {
  const attackData = useCharacterAttacks()

  if (!attackData) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  const attack = attackData.attacks.find(
    (a) => a.weaponUniqueId === attackId || a.name === attackId
  )

  if (!attack) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Ataque no encontrado: {attackId}</Text>
      </YStack>
    )
  }

  return <AttackDetailPanel attack={attack} attackData={attackData} />
}

function HitPointsDetail() {
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
    if (hpChange === '') return 0
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

function NotImplementedDetail({ type, id }: { type: string; id: string }) {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding={20}>
      <Text fontSize={18} fontWeight="700" color="$color" marginBottom={8}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Text>
      <Text color="$placeholderColor" textAlign="center">
        Detalle de "{id}" - Pendiente de implementar
      </Text>
    </YStack>
  )
}

function LevelDetailWrapper({ levelIndex }: { levelIndex: number }) {
  const baseData = useCharacterBaseData()
  const { updater } = useCharacterStore()
  const navigateToDetail = useNavigateToDetail()

  if (!baseData || !updater) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  const levelSlot = baseData.levelSlots?.[levelIndex] ?? { classId: null, hpRoll: null }
  const classEntity = levelSlot.classId ? baseData.classEntities?.[levelSlot.classId] : null
  const className = classEntity?.name ?? null
  const hitDie = classEntity?.hitDie ?? null

  const handleOpenClassSelector = () => {
    navigateToDetail('classSelectorDetail', String(levelIndex))
  }

  const handleHpChange = (hp: number | null) => {
    updateLevelHp(baseData, updater, levelIndex, hp)
  }

  const handleRollHp = () => {
    // Placeholder: la lógica de roll ya está en el handleHpChange
  }

  return (
    <LevelDetail
      levelIndex={levelIndex}
      levelSlot={levelSlot}
      className={className}
      hitDie={hitDie}
      onOpenClassSelector={handleOpenClassSelector}
      onHpChange={handleHpChange}
      onRollHp={handleRollHp}
    />
  )
}

function ClassSelectorDetailWrapper({ levelIndex }: { levelIndex: number}) {
  const baseData = useCharacterBaseData()
  const { updater } = useCharacterStore()
  const router = useRouter()

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
    router.back()
  }

  const handleClose = () => {
    router.back()
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

function ComputedEntityDetail({ entityId }: { entityId: string }) {
  const computedEntities = useComputedEntities()
  const entity = computedEntities.find((e) => e.id === entityId)

  if (!entity) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Entidad no encontrada: {entityId}</Text>
      </YStack>
    )
  }

  return <GenericEntityDetailPanel entity={entity} />
}

function InvalidRoute() {
  const router = useRouter()

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding={20}>
      <Text fontSize={18} fontWeight="700" color="$color" marginBottom={8}>
        Ruta no valida
      </Text>
      <Text color="$placeholderColor" textAlign="center" marginBottom={16}>
        La ruta solicitada no existe o no es valida.
      </Text>
      <Pressable onPress={() => router.back()}>
        {({ pressed }) => (
          <Text color="$colorFocus" opacity={pressed ? 0.7 : 1}>
            Volver
          </Text>
        )}
      </Pressable>
    </YStack>
  )
}

/**
 * Pantalla de detalle genérica que renderiza según el tipo.
 * 
 * Rutas soportadas:
 * - /detail/ability/[abilityKey] - Detalle de ability score
 * - /detail/savingThrow/[savingThrowKey] - Detalle de saving throw
 * - /detail/armorClass/armorClass - Detalle de armor class
 * - /detail/hitPoints/hitPoints - Detalle de hit points
 * - /detail/skill/[skillId] - Detalle de skill (pendiente)
 * - /detail/spell/[spellId] - Detalle de spell (pendiente)
 * - /detail/buff/[buffId] - Detalle de buff (pendiente)
 * - /detail/equipment/[itemId] - Detalle de equipment (pendiente)
 */
export function DetailScreen() {
  const { slug } = useLocalSearchParams<SlugParams>()
  const { themeColors } = useTheme()
  
  const { type, id, extra } = parseSlug(slug)
  const isChatDetail = type === 'chat'
  
  // Determinar el título para el header
  const getTitle = (): string => {
    if (!type || !id) {
      return 'Detalle'
    }
    return getDetailTitle(type, id)
  }
  
  // Renderizar contenido según el tipo
  const renderContent = () => {
    if (!type || !id) {
      return <InvalidRoute />
    }
    
    switch (type) {
      case 'ability':
        return <AbilityDetail abilityKey={id} />
      case 'savingThrow':
        return <SavingThrowDetail savingThrowKey={id} />
      case 'armorClass':
        return <ArmorClassDetail />
      case 'initiative':
        return <InitiativeDetail />
      case 'bab':
        return <BABDetail />
      case 'hitPoints':
        return <HitPointsDetail />
      case 'skill':
        return <SkillDetail skillId={id} />
      case 'attack':
        return <AttackDetail attackId={id} />
      case 'chat':
        return <ChatScreen />
      case 'spell':
      case 'buff':
      case 'item':
        return <NotImplementedDetail type={type} id={id} />
      case 'equipment':
        return <EquipmentDetail itemId={id} />
      case 'levelDetail':
        return <LevelDetailWrapper levelIndex={parseInt(id)} />
      case 'classSelectorDetail':
        return <ClassSelectorDetailWrapper levelIndex={parseInt(id)} />
      case 'entitySelectorDetail':
      case 'customEntityDetail':
        return <NotImplementedDetail type={type} id={id} />
      case 'computedEntity':
        return <ComputedEntityDetail entityId={id} />
      default:
        return <InvalidRoute />
    }
  }
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: getTitle(),
        }} 
      />
      {isChatDetail ? (
        <ChatScreen />
      ) : (
        <ScrollView
          style={[styles.container, { backgroundColor: themeColors.background }]}
          contentContainerStyle={styles.content}
        >
          {renderContent()}
        </ScrollView>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
  },
})
