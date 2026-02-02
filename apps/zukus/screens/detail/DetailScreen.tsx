import { useState, useEffect } from 'react'
import { View, ScrollView, StyleSheet, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { Text, YStack } from 'tamagui'
import { useCharacterStore, useCharacterSheet, useCharacterAbilities, useCharacterSavingThrows, useCharacterArmorClass, useCharacterInitiative, useCharacterBAB, useCharacterSkills, useCharacterHitPoints, useCharacterAttacks, useTheme, SavingThrowDetailPanel, InitiativeDetailPanel, BABDetailPanel, SkillDetailPanel, HitPointsDetailPanel, AttackDetailPanel, EquipmentDetailPanel, useCharacterBaseData, useComputedEntities, GenericEntityDetailPanel, useCharacterBuffs, BuffDetailPanel, BuffEditScreen, ChangeEditScreen, useBuffEditStore, useDraftBuff, useBuffEditActions, AllBuffsDetailPanel, useInventoryState } from '../../ui'
import { AbilityDetailPanel, ArmorClassDetailPanel, CGEManagementPanel, CGEEntitySelectPanel, ItemBrowserPanel, CurrencyEditPanel } from '../../components/character'
import { LevelDetail, ClassSelectorDetail, updateLevelHp, updateLevelClass, getAvailableClasses, type ProviderWithResolution } from '../../ui/components/character/editor'
import type { Ability } from '../../components/character/data'
import type { CalculatedAbility, CalculatedSavingThrow, ProviderLocation, StandardEntity, EntityInstance } from '@zukus/core'
import { resolveProvider, getSelectedEntityInstances } from '@zukus/core'
import { useCompendiumContext, EntitySelectorDetail } from '../../ui/components/EntityProvider'
import { type DetailType, isValidDetailType, getDetailTitle, useNavigateToDetail } from '../../navigation'
import { ChatScreen } from '../chat/ChatScreen'
import { CompendiumEntityDetail } from '../../components/compendiums'

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

function BuffDetail({ buffId }: { buffId: string }) {
  const buffs = useCharacterBuffs()
  const toggleBuff = useCharacterStore((state) => state.toggleBuff)
  const deleteBuff = useCharacterStore((state) => state.deleteBuff)
  const navigateToDetail = useNavigateToDetail()
  const router = useRouter()

  const buff = buffs.find((b) => b.uniqueId === buffId)

  if (!buff) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Buff no encontrado: {buffId}</Text>
      </YStack>
    )
  }

  const handleEdit = () => {
    navigateToDetail('buffEdit', buff.uniqueId, `Edit: ${buff.name}`)
  }

  const handleDelete = () => {
    deleteBuff(buff.uniqueId)
    router.back()
  }

  return (
    <BuffDetailPanel
      buff={buff}
      onToggleActive={() => toggleBuff(buff.uniqueId)}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}

function BuffEditDetail({ buffId }: { buffId: string }) {
  const buffs = useCharacterBuffs()
  const deleteBuff = useCharacterStore((state) => state.deleteBuff)
  const router = useRouter()
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
        <Text color="$placeholderColor">Buff no encontrado: {buffId}</Text>
      </YStack>
    )
  }

  const handleSave = () => {
    save()
    router.back()
  }

  const handleDelete = () => {
    discard()
    deleteBuff(buffId)
    // Volver dos pantallas: edit -> detail -> lista
    router.back()
    router.back()
  }

  const handleCancel = () => {
    discard()
    router.back()
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

/**
 * Wrapper para edición de un Change.
 * El id tiene formato: {buffId}:{changeIndex} o {buffId}:new
 */
function ChangeEditDetail({ changeId }: { changeId: string }) {
  const router = useRouter()
  const draftBuff = useDraftBuff()
  const { updateChange, addChange, deleteChange } = useBuffEditActions()

  // Parsear el id: buffId:changeIndex o buffId:new
  const [buffId, indexStr] = changeId.split(':')
  const isNew = indexStr === 'new'
  const changeIndex = isNew ? -1 : parseInt(indexStr, 10)

  // Leer del draft (ya deberia estar inicializado desde BuffEditDetail)
  if (!draftBuff || draftBuff.uniqueId !== buffId) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Buff no encontrado en edicion: {buffId}</Text>
      </YStack>
    )
  }

  const changes = draftBuff.changes ?? []
  const change = isNew ? null : changes[changeIndex]

  if (!isNew && !change) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Change no encontrado: {changeIndex}</Text>
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
    router.back()
  }

  const handleDelete = () => {
    deleteChange(changeIndex)
    router.back()
  }

  const handleCancel = () => {
    router.back()
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
    navigateToDetail('classSelectorDetail', String(levelIndex))
  }

  const handleHpChange = (hp: number | null) => {
    updateLevelHp(baseData, updater, levelIndex, hp)
  }

  const handleRollHp = () => {
    // Placeholder: la logica de roll ya esta en el handleHpChange
  }

  const handleSelectorPress = (providerLocation: ProviderLocation) => {
    // Navigate to entity selector detail
    // We encode the provider location as JSON in the id
    const locationJson = JSON.stringify(providerLocation)
    navigateToDetail('entitySelectorDetail', locationJson)
  }

  const handleGrantedEntityPress = (entity: StandardEntity) => {
    navigateToDetail('customEntityDetail', entity.id, entity.name)
  }

  const handleSelectedEntityPress = (instance: EntityInstance) => {
    navigateToDetail('customEntityDetail', instance.entity.id, instance.entity.name)
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

function InventoryItemDetail({ instanceId }: { instanceId: string }) {
  const inventoryState = useInventoryState()
  const setInventoryInstanceField = useCharacterStore((state) => state.setInventoryInstanceField)

  const item = inventoryState?.items.find((i) => i.instanceId === instanceId)

  if (!item || !item.entity) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Item no encontrado: {instanceId}</Text>
      </YStack>
    )
  }

  // Create a ComputedEntity from the inventory item
  const computedEntity = {
    ...item.entity,
    _meta: {
      source: {
        type: 'inventory',
        instanceId: item.instanceId,
        originType: item.entityType,
        originId: item.itemId,
        name: item.customName ?? item.entity.name ?? item.itemId,
      },
      suppressed: false,
    },
  } as import('@zukus/core').ComputedEntity

  const handleInstanceFieldChange = (field: string, value: unknown) => {
    // Generic handler for any boolean instance field
    if (typeof value === 'boolean') {
      setInventoryInstanceField(instanceId, field, value)
    }
  }

  return (
    <GenericEntityDetailPanel
      entity={computedEntity}
      onInstanceFieldChange={handleInstanceFieldChange}
    />
  )
}

function EntitySelectorDetailWrapper({ locationJson }: { locationJson: string }) {
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
  console.log('[PERF] DetailScreen render', Date.now())
  const { slug } = useLocalSearchParams<SlugParams>()
  const { themeColors } = useTheme()
  
  const { type, id, extra } = parseSlug(slug)
  const needsOwnScroll = type === 'chat' || type === 'cgeEntitySelect' || type === 'cgeManagement' || type === 'itemBrowser'
  
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
      case 'buff':
        return <BuffDetail buffId={id} />
      case 'buffEdit':
        return <BuffEditDetail buffId={id} />
      case 'changeEdit':
        return <ChangeEditDetail changeId={id} />
      case 'allBuffs':
        return <AllBuffsDetailPanel />
      case 'spell':
      case 'item':
        return <NotImplementedDetail type={type} id={id} />
      case 'equipment':
        return <EquipmentDetail itemId={id} />
      case 'levelDetail':
        return <LevelDetailWrapper levelIndex={parseInt(id)} />
      case 'classSelectorDetail':
        return <ClassSelectorDetailWrapper levelIndex={parseInt(id)} />
      case 'entitySelectorDetail':
        return <EntitySelectorDetailWrapper locationJson={id} />
      case 'customEntityDetail':
        return <NotImplementedDetail type={type} id={id} />
      case 'computedEntity':
        return <ComputedEntityDetail entityId={id} />
      case 'compendiumEntity':
        return <CompendiumEntityDetail entityId={id} />
      case 'cgeManagement':
        return <CGEManagementPanel />
      case 'cgeEntitySelect':
        return <CGEEntitySelectPanel selectionId={id} />
      case 'itemBrowser':
        return <ItemBrowserPanel />
      case 'currencyEdit':
        return <CurrencyEditPanel />
      case 'inventoryItem':
        return <InventoryItemDetail instanceId={id} />
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
      {needsOwnScroll ? (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
          {renderContent()}
        </View>
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
    padding: 16,
  },
})
