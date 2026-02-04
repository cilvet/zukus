import { YStack, Text } from 'tamagui'
import {
  useCharacterSheet,
  useCharacterAbilities,
  useCharacterSavingThrows,
  useCharacterSkills,
  useCharacterLevel,
  useCharacterHitPoints,
  useCharacterArmorClass,
  useCharacterInitiative,
  useCharacterBAB,
  useCharacterImageUrl,
  useCharacterAttacks,
  useComputedEntities,
} from '../../../ui'
import { isValidDetailType, getDetailTitle } from '../../../navigation'
import {
  SidePanel,
  DesktopCharacterLayout,
  StatsHeaderBar,
  TabbedContentBox,
  TabEmptyState,
  CombatStatsRow,
} from '../../../components/layout'
import { SidePanelContent } from './SidePanelContent'
import { useTabsBuilder } from './TabsBuilder'
import { LeftColumnsContent } from './LeftColumnsContent'
import { usePanelHandlers } from './usePanelHandlers'
import {
  getCalculatedAbility,
  getAbilityForPanel,
  getSavingThrowForPanel,
  getSkillForPanel,
  getEquipmentItemForPanel,
} from './panelDataGetters'

/**
 * Parses panel path format "type/id"
 */
function parsePanelPath(path: string | undefined): { type: string; id: string } | null {
  if (!path) return null
  const [type, ...rest] = path.split('/')
  const id = rest.join('/')
  if (!type || !id) return null
  return { type, id }
}

export function CharacterScreenContent() {
  // Character data
  const characterSheet = useCharacterSheet()
  const abilities = useCharacterAbilities()
  const savingThrows = useCharacterSavingThrows()
  const skills = useCharacterSkills()
  const level = useCharacterLevel()
  const hitPoints = useCharacterHitPoints()
  const armorClass = useCharacterArmorClass()
  const initiative = useCharacterInitiative()
  const bab = useCharacterBAB()
  const attackData = useCharacterAttacks()
  const imageUrl = useCharacterImageUrl()
  const computedEntities = useComputedEntities()

  // Panel navigation
  const {
    currentPanel,
    isPanelOpen,
    canGoBack,
    closePanel,
    goBack,
    handleAbilityPress,
    handleSavingThrowPress,
    handleArmorClassPress,
    handleInitiativePress,
    handleBABPress,
    handleEquipmentPress,
    handleInventoryItemPress,
    handleAttackPress,
    handleEntityPress,
    handleHitPointsPress,
    handleChatPress,
    handleEditPress,
    handleRestPress,
    handleOpenItemBrowser,
    handleOpenCurrencyEdit,
  } = usePanelHandlers()

  const panelInfo = parsePanelPath(currentPanel?.path)

  // Build tabs
  const tabs = useTabsBuilder({
    onAttackPress: handleAttackPress,
    onEntityPress: handleEntityPress,
    onEquipmentPress: handleEquipmentPress,
    onInventoryItemPress: handleInventoryItemPress,
    onOpenItemBrowser: handleOpenItemBrowser,
    onOpenCurrencyEdit: handleOpenCurrencyEdit,
  })

  // Loading state
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

  const getPanelTitle = (): string => {
    if (!panelInfo) {
      return currentPanel?.title ?? 'Detail'
    }
    if (!isValidDetailType(panelInfo.type)) {
      return currentPanel?.title ?? 'Detail'
    }
    return getDetailTitle(panelInfo.type, panelInfo.id, currentPanel?.title)
  }

  return (
    <DesktopCharacterLayout
      topBar={
        <StatsHeaderBar
          name={characterSheet.name}
          level={levelNumber}
          characterClass={className}
          imageUrl={imageUrl}
          abilities={abilities}
          currentHp={currentHp}
          maxHp={maxHp}
          onAbilityPress={handleAbilityPress}
          onHpPress={handleHitPointsPress}
          onEditPress={handleEditPress}
          onRestPress={handleRestPress}
          onChatPress={handleChatPress}
        />
      }
      leftColumns={<LeftColumnsContent onSavingThrowPress={handleSavingThrowPress} />}
      rightTop={
        <CombatStatsRow
          armorClass={
            armorClass
              ? {
                  total: armorClass.totalAc.totalValue,
                  touch: armorClass.touchAc.totalValue,
                  flatFooted: armorClass.flatFootedAc.totalValue,
                }
              : undefined
          }
          initiative={initiative?.totalValue}
          bab={
            bab
              ? {
                  total: bab.totalValue,
                  attacks: bab.multipleBaseAttackBonuses,
                }
              : undefined
          }
          onArmorClassPress={handleArmorClassPress}
          onInitiativePress={handleInitiativePress}
          onBABPress={handleBABPress}
        />
      }
      rightBottom={
        tabs.length > 0 ? (
          <TabbedContentBox tabs={tabs} defaultTabId="attacks" />
        ) : (
          <TabEmptyState message="No content available." />
        )
      }
      sidePanel={
        <SidePanel
          isOpen={isPanelOpen}
          onClose={closePanel}
          onBack={goBack}
          canGoBack={canGoBack}
          title={getPanelTitle()}
          disableScroll={panelInfo?.type === 'chat' || panelInfo?.type === 'cgeEntitySelect' || panelInfo?.type === 'compendiumEntity' || panelInfo?.type === 'itemBrowser'}
        >
          <SidePanelContent
            panelInfo={panelInfo}
            panelTitle={currentPanel?.title}
            getAbilityForPanel={(key) => getAbilityForPanel(abilities, key)}
            getCalculatedAbility={(key) => getCalculatedAbility(abilities, key)}
            getSavingThrowForPanel={(key) => getSavingThrowForPanel(savingThrows, key)}
            getSkillForPanel={(id) => getSkillForPanel(skills, id)}
            getEquipmentItemForPanel={(id) => getEquipmentItemForPanel(characterSheet, id)}
            armorClass={armorClass}
            initiative={initiative}
            bab={bab}
            attackData={attackData}
            computedEntities={computedEntities}
            characterSheet={characterSheet}
          />
        </SidePanel>
      }
    />
  )
}
