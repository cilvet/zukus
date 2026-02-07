import { useCallback } from 'react'
import { YStack, XStack, Text } from 'tamagui'
import { View } from 'react-native'
import { usePanelNavigation } from '../../hooks'
import {
  useCharacterStore,
  useCharacterSheet,
  useCharacterBaseData,
} from '../../ui'
import {
  LevelDetail,
  ClassSelectorDetail,
  AbilityScoresEditor,
  CharacterInfoSection,
  CurrentLevelSelector,
  LevelSlotRow,
  updateLevelHp,
  updateLevelClass,
  getAvailableClasses,
  type ProviderWithResolution,
  type LevelSlotData,
} from '../../ui/components/character/editor'
import {
  SidePanel,
  SidePanelContainer,
  ColumnsContainer,
  VerticalSection,
} from '../../components/layout'
import { SectionCard, SectionHeader } from '../../components/character'
import { useCompendiumContext, EntitySelectorDetail } from '../../ui/components/EntityProvider'
import { getDetailTitle } from '../../navigation'
import { resolveProvider, getSelectedEntityInstances, ops } from '@zukus/core'
import type { ProviderLocation, StandardEntity, EntityInstance, LevelSlot } from '@zukus/core'
import { useEffect, useRef } from 'react'

const TOTAL_LEVELS = 20

/**
 * Pantalla de edicion de personaje para desktop.
 * 3 columnas: Info | Abilities | Niveles
 * Con SidePanel para detalles de nivel.
 */
export function EditCharacterScreenDesktop() {
  const characterSheet = useCharacterSheet()

  if (!characterSheet) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text color="$placeholderColor">Cargando personaje...</Text>
      </View>
    )
  }

  return <EditCharacterScreenDesktopContent />
}

function EditCharacterScreenDesktopContent() {
  const baseData = useCharacterBaseData()
  const { updater } = useCharacterStore()
  const hasInitialized = useRef(false)

  const {
    currentPanel,
    isPanelOpen,
    canGoBack,
    openPanel,
    closePanel,
    goBack,
  } = usePanelNavigation('edit')

  // Helper para parsear el path del panel: "type/id"
  const parsePanelPath = (path: string | undefined): { type: string; id: string } | null => {
    if (!path) return null
    const [type, ...rest] = path.split('/')
    const id = rest.join('/')
    if (!type || !id) return null
    return { type, id }
  }

  const panelInfo = parsePanelPath(currentPanel?.path)

  // Ensure 20 level slots exist on mount
  useEffect(() => {
    if (!hasInitialized.current && baseData && updater) {
      hasInitialized.current = true
      const currentSlots = baseData.levelSlots?.length ?? 0

      if (currentSlots < TOTAL_LEVELS) {
        let updatedData = { ...baseData }

        while ((updatedData.levelSlots?.length ?? 0) < TOTAL_LEVELS) {
          const result = ops.addLevelSlot(updatedData as any)
          updatedData = result.character
        }

        const newSlots = updatedData.levelSlots?.length ?? 0
        if (currentSlots !== newSlots) {
          updater.updateCharacterBaseData(updatedData)
        }
      }
    }
  }, [baseData, updater])

  const currentLevel = baseData?.level?.level ?? 0
  const levelSlots = baseData?.levelSlots ?? []
  const classEntities = baseData?.classEntities

  const displaySlots: LevelSlot[] = Array.from({ length: TOTAL_LEVELS }, (_, index) => {
    return levelSlots[index] ?? { classId: null, hpRoll: null }
  })

  const handleLevelRowPress = useCallback((levelIndex: number) => {
    openPanel(`levelDetail/${levelIndex}`, `Nivel ${levelIndex + 1}`)
  }, [openPanel])

  const handleLevelChange = useCallback((level: number) => {
    if (updater) {
      updater.setCurrentCharacterLevel(level)
    }
  }, [updater])

  const getPanelTitle = () => {
    if (!currentPanel) return ''
    if (currentPanel.title) return currentPanel.title
    if (!panelInfo) return ''
    return getDetailTitle(panelInfo.type as any, panelInfo.id)
  }

  if (!baseData) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text color="$placeholderColor">Cargando datos...</Text>
      </View>
    )
  }

  // Ancho de columna más amplio para la pantalla de edición
  const EDIT_COLUMN_WIDTH = 340

  return (
    <SidePanelContainer>
      <ColumnsContainer>
        {/* Columna 1: Info (imagen, nombre, alineamiento, fisico, background) */}
        <VerticalSection width={EDIT_COLUMN_WIDTH}>
          <YStack
            width="100%"
            backgroundColor="$background"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius={4}
          >
            <CharacterInfoSection />
          </YStack>
        </VerticalSection>

        {/* Columna 2: Ability Scores */}
        <VerticalSection width={EDIT_COLUMN_WIDTH}>
          <YStack
            width="100%"
            backgroundColor="$background"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius={4}
            padding={12}
          >
            <AbilityScoresEditor />
          </YStack>
        </VerticalSection>

        {/* Columna 3: Niveles */}
        <VerticalSection width={EDIT_COLUMN_WIDTH}>
          <YStack width="100%" gap={16}>
            <SectionCard>
              <SectionHeader icon="#" title="Niveles" />
              <YStack gap={16}>
                {/* Level Selector */}
                <CurrentLevelSelector
                  currentLevel={currentLevel}
                  onLevelChange={handleLevelChange}
                />

                {/* Level List Header */}
                <XStack
                  gap={8}
                  paddingBottom={8}
                  borderBottomWidth={1}
                  borderColor="$borderColor"
                >
                  <Text width={24} />
                  <Text width={70} fontWeight="bold" fontSize={13} color="$placeholderColor">
                    Nivel
                  </Text>
                  <Text flex={1} fontWeight="bold" fontSize={13} color="$placeholderColor">
                    Clase
                  </Text>
                </XStack>

                {/* Level Rows */}
                <YStack>
                  {displaySlots.map((slot, index) => {
                    const isActive = index < currentLevel
                    const isNextActive = index + 1 < currentLevel
                    const isFirstLevel = index === 0
                    const isLastLevel = index === displaySlots.length - 1

                    return (
                      <LevelSlotRow
                        key={index}
                        levelIndex={index}
                        slot={slot}
                        isActive={isActive}
                        isNextActive={isNextActive}
                        isFirstLevel={isFirstLevel}
                        isLastLevel={isLastLevel}
                        classEntities={classEntities}
                        onRowPress={handleLevelRowPress}
                        onLevelActivate={handleLevelChange}
                      />
                    )
                  })}
                </YStack>
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
        {panelInfo?.type === 'levelDetail' && panelInfo?.id && (
          <EditLevelDetailPanelContainer levelIndex={parseInt(panelInfo.id)} />
        )}
        {panelInfo?.type === 'classSelectorDetail' && panelInfo?.id && (
          <EditClassSelectorDetailPanelContainer levelIndex={parseInt(panelInfo.id)} />
        )}
        {panelInfo?.type === 'entitySelectorDetail' && panelInfo?.id && (
          <EditEntitySelectorDetailPanelContainer locationJson={panelInfo.id} />
        )}
      </SidePanel>
    </SidePanelContainer>
  )
}

// Panel containers that use useEditPanelNavigation

function EditLevelDetailPanelContainer({ levelIndex }: { levelIndex: number }) {
  const baseData = useCharacterBaseData()
  const { updater } = useCharacterStore()
  const { openPanel } = usePanelNavigation('edit')
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
    openPanel(`classSelectorDetail/${levelIndex}`, 'Seleccionar Clase')
  }

  const handleHpChange = (hp: number | null) => {
    updateLevelHp(baseData, updater, levelIndex, hp)
  }

  const handleRollHp = () => {
    // Placeholder
  }

  const handleSelectorPress = (providerLocation: ProviderLocation) => {
    const locationJson = JSON.stringify(providerLocation)
    openPanel(`entitySelectorDetail/${locationJson}`, 'Seleccionar')
  }

  const handleGrantedEntityPress = (entity: StandardEntity) => {
    openPanel(`customEntityDetail/${entity.id}`, entity.name)
  }

  const handleSelectedEntityPress = (instance: EntityInstance) => {
    openPanel(`customEntityDetail/${instance.entity.id}`, instance.entity.name)
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

function EditClassSelectorDetailPanelContainer({ levelIndex }: { levelIndex: number }) {
  const baseData = useCharacterBaseData()
  const { updater } = useCharacterStore()
  const { closePanel } = usePanelNavigation('edit')

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

function EditEntitySelectorDetailPanelContainer({ locationJson }: { locationJson: string }) {
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
