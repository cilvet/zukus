import type { CalculatedAbility, CalculatedSavingThrow, CalculatedSingleSkill, ComputedEntity, Buff, CalculatedAttack, SourceValue, CalculatedAttackData } from '@zukus/core'
import {
  EquipmentDetailPanel,
  InitiativeDetailPanel,
  BABDetailPanel,
  SkillDetailPanel,
  AttackDetailPanel,
  GenericEntityDetailPanel,
  BuffDetailPanel,
  AllBuffsDetailPanel,
  SavingThrowDetailPanel,
  useCharacterStore,
  useCharacterBuffs,
} from '../../../ui'
import {
  SectionHeader,
  SectionCard,
  AbilityDetailPanel,
  GenericDetailPanel,
  ArmorClassDetailPanel,
  CGEManagementPanel,
  CGEEntitySelectPanel,
  ItemBrowserPanel,
  CurrencyEditPanel,
} from '../../../components/character'
import { ChatScreenWeb } from '../../chat/ChatScreenWeb'
import { CompendiumEntityDetail } from '../../../components/compendiums'
import { usePanelNavigation } from '../../../hooks'
import { useNavigateToDetail } from '../../../navigation'
import type { Ability } from '../../../components/character/data'
import {
  HitPointsContainer,
  LevelDetailContainer,
  ClassSelectorContainer,
  EntitySelectorContainer,
  BuffEditContainer,
  ChangeEditContainer,
  InventoryItemContainer,
} from './panels'

type PanelInfo = {
  type: string
  id: string
} | null

// AC shape from useCharacterArmorClass
type ArmorClassData = {
  totalAc: { totalValue: number; sourceValues: SourceValue[] }
  touchAc: { totalValue: number; sourceValues: SourceValue[] }
  flatFootedAc: { totalValue: number; sourceValues: SourceValue[] }
}

// Initiative shape from useCharacterInitiative
type InitiativeData = {
  totalValue: number
  sourceValues?: SourceValue[]
}

// BAB shape from useCharacterBAB
type BABData = {
  totalValue: number
  multipleBaseAttackBonuses: number[]
  sourceValues?: SourceValue[]
}

type SidePanelContentProps = {
  panelInfo: PanelInfo
  panelTitle?: string
  // Data getters
  getAbilityForPanel: (key: string) => Ability | null
  getCalculatedAbility: (key: string) => CalculatedAbility | null
  getSavingThrowForPanel: (key: string) => CalculatedSavingThrow | null
  getSkillForPanel: (id: string) => CalculatedSingleSkill | null
  getEquipmentItemForPanel: (id: string) => any | null
  // Character data
  armorClass: ArmorClassData | null
  initiative: InitiativeData | null
  bab: BABData | null
  attackData: CalculatedAttackData | null
  computedEntities: readonly ComputedEntity[]
  characterSheet: any
}

export function SidePanelContent({
  panelInfo,
  panelTitle,
  getAbilityForPanel,
  getCalculatedAbility,
  getSavingThrowForPanel,
  getSkillForPanel,
  getEquipmentItemForPanel,
  armorClass,
  initiative,
  bab,
  attackData,
  computedEntities,
  characterSheet,
}: SidePanelContentProps) {
  const buffs = useCharacterBuffs()
  const toggleBuff = useCharacterStore((state) => state.toggleBuff)
  const deleteBuff = useCharacterStore((state) => state.deleteBuff)
  const toggleItemEquipped = useCharacterStore((state) => state.toggleItemEquipped)
  const { closePanel } = usePanelNavigation('character')
  const navigateToDetail = useNavigateToDetail()

  if (!panelInfo) return null

  const getBuffForPanel = (buffId: string): Buff | null => {
    return buffs.find((buff) => buff.uniqueId === buffId) ?? null
  }

  const attackForPanel =
    panelInfo.type === 'attack' && panelInfo.id && attackData
      ? attackData.attacks.find(
          (a: CalculatedAttack) => a.weaponUniqueId === panelInfo.id || a.name === panelInfo.id
        )
      : null

  const entityForPanel =
    panelInfo.type === 'computedEntity' && panelInfo.id
      ? computedEntities.find((e) => e.id === panelInfo.id) ?? null
      : null

  switch (panelInfo.type) {
    case 'ability': {
      const ability = getAbilityForPanel(panelInfo.id)
      if (!ability) return null
      return (
        <AbilityDetailPanel
          abilityKey={panelInfo.id}
          ability={ability}
          sourceValues={getCalculatedAbility(panelInfo.id)?.sourceValues}
        />
      )
    }

    case 'savingThrow': {
      const savingThrow = getSavingThrowForPanel(panelInfo.id)
      if (!savingThrow) return null
      return (
        <SavingThrowDetailPanel
          savingThrowKey={panelInfo.id}
          totalValue={savingThrow.totalValue}
          sourceValues={savingThrow.sourceValues}
        />
      )
    }

    case 'armorClass':
      if (!armorClass) return null
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

    case 'initiative':
      if (!initiative) return null
      return (
        <InitiativeDetailPanel
          totalValue={initiative.totalValue}
          sourceValues={initiative.sourceValues}
        />
      )

    case 'bab':
      if (!bab) return null
      return (
        <BABDetailPanel
          totalValue={bab.totalValue}
          multipleAttacks={bab.multipleBaseAttackBonuses}
          sourceValues={bab.sourceValues}
        />
      )

    case 'hitPoints':
      return <HitPointsContainer />

    case 'skill': {
      const skill = getSkillForPanel(panelInfo.id)
      if (!skill) return null
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

    case 'attack':
      if (!attackForPanel || !attackData) return null
      return <AttackDetailPanel attack={attackForPanel} attackData={attackData} />

    case 'equipment': {
      const item = getEquipmentItemForPanel(panelInfo.id)
      if (!item) return null
      return (
        <EquipmentDetailPanel
          item={item}
          onToggleEquipped={() => toggleItemEquipped(panelInfo.id)}
        />
      )
    }

    case 'inventoryItem':
      return <InventoryItemContainer instanceId={panelInfo.id} />

    case 'itemBrowser':
      return <ItemBrowserPanel />

    case 'currencyEdit':
      return <CurrencyEditPanel />

    case 'buff': {
      const buff = getBuffForPanel(panelInfo.id)
      if (!buff) return null
      return (
        <BuffDetailPanel
          buff={buff}
          onToggleActive={() => toggleBuff(panelInfo.id)}
          onEdit={() => navigateToDetail('buffEdit', panelInfo.id, `Edit: ${buff.name}`)}
          onDelete={() => {
            deleteBuff(panelInfo.id)
            closePanel()
          }}
        />
      )
    }

    case 'buffEdit':
      return <BuffEditContainer buffId={panelInfo.id} />

    case 'changeEdit':
      return <ChangeEditContainer changeId={panelInfo.id} />

    case 'allBuffs':
      return <AllBuffsDetailPanel />

    case 'item':
      if (!panelTitle) return null
      return <GenericDetailPanel title={panelTitle} />

    case 'chat':
      return <ChatScreenWeb />

    case 'levelDetail':
      return <LevelDetailContainer levelIndex={parseInt(panelInfo.id)} />

    case 'classSelectorDetail':
      return <ClassSelectorContainer levelIndex={parseInt(panelInfo.id)} />

    case 'entitySelectorDetail':
      return <EntitySelectorContainer locationJson={panelInfo.id} />

    case 'computedEntity':
      if (!entityForPanel) return null
      return <GenericEntityDetailPanel entity={entityForPanel} />

    case 'cgeManagement':
      return <CGEManagementPanel />

    case 'cgeEntitySelect':
      return <CGEEntitySelectPanel selectionId={panelInfo.id} />

    case 'compendiumEntity':
      return <CompendiumEntityDetail entityId={panelInfo.id} />

    default:
      return null
  }
}
