import { ScrollView } from 'react-native-gesture-handler'
import { YStack, Text } from 'tamagui'
import { usePrimaryCGE, useCharacterStore, useCompendiumContext, useTheme } from '../../../../ui'
import { useNavigateToDetail } from '../../../../navigation'
import { calculatePoolCost, type CalculatedCGE, type CalculatedBoundSlot, type ResourceConfigPool } from '@zukus/core'
import { EntityRow, LevelHeader, ENTITY_ROW_PADDING_HORIZONTAL } from '../EntityRow'
import { ActionButton } from './ActionButton'
import { SlotLevelHeader } from './SlotLevelHeader'
import { PoolHeader } from './PoolHeader'
import { formatEntityDisplayName, groupBoundSlotsByEntity } from './utils'

type KnownEntityDisplay = {
  id: string
  name: string
  image?: string
}

type CGEUsePanelProps = {
  cge?: CalculatedCGE | null
}

/**
 * CGE Use Panel - Runtime view for using entities (spells, powers, maneuvers).
 *
 * Supports three resource types:
 * - POOL: Shows pool bar and entities with individual costs
 * - SLOTS + BOUND: Shows prepared entities grouped, each use consumes one preparation
 * - SLOTS + NONE: Shows known entities per level, uses consume level slots
 */
export function CGEUsePanel({ cge: propsCge }: CGEUsePanelProps) {
  "use no memo"

  const hookCge = usePrimaryCGE()
  const primaryCGE = propsCge ?? hookCge
  const useSlotForCGE = useCharacterStore((state) => state.useSlotForCGE)
  const useBoundSlotForCGE = useCharacterStore((state) => state.useBoundSlotForCGE)
  const setSlotValueForCGE = useCharacterStore((state) => state.setSlotValueForCGE)
  const compendium = useCompendiumContext()
  const navigateToDetail = useNavigateToDetail()
  const { themeInfo, themeColors } = useTheme()
  const accentColor = themeInfo.colors.accent
  const textColor = themeColors.color

  if (!primaryCGE) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">No hay CGE disponible</Text>
      </YStack>
    )
  }

  const baseData = useCharacterStore((state) => state.baseData)
  const cgeId = primaryCGE.id

  const primaryTrack = primaryCGE.tracks[0]
  const slots = primaryTrack?.slots ?? []
  const isBoundPreparation = primaryTrack?.preparationType === 'BOUND'
  const isPoolResource = primaryTrack?.resourceType === 'POOL'
  const pool = primaryTrack?.pool

  // Get resourceId from config for POOL type
  const trackConfig = primaryCGE.config.tracks[0]
  const poolResourceId = trackConfig?.resource.type === 'POOL'
    ? (trackConfig.resource as ResourceConfigPool).resourceId
    : undefined
  const consumeResource = useCharacterStore((state) => state.consumeResource)

  // Get known entities for spontaneous casters
  const knownSelections = baseData?.cgeState?.[cgeId]?.knownSelections ?? {}

  const getLevelLabel = (level: number): string => {
    if (level === 0) return 'Nivel 0'
    return `Nivel ${level}`
  }

  const getKnownEntitiesForLevel = (level: number): KnownEntityDisplay[] => {
    const entityIds = knownSelections[String(level)] ?? []
    return entityIds.map((entityId) => {
      const entity = compendium.getEntityById(entityId)
      return {
        id: entityId,
        name: formatEntityDisplayName(entityId, entity),
        image: entity?.image,
      }
    })
  }

  const handleUseBoundEntity = (entitySlots: CalculatedBoundSlot[]) => {
    const availableSlot = entitySlots.find(s => !s.used)
    if (!availableSlot) return

    const result = useBoundSlotForCGE(primaryCGE.id, availableSlot.slotId)
    if (!result.success) {
      console.warn('Failed to use bound slot:', result.error)
    }
  }

  const handleUseLevelSlot = (level: number) => {
    const result = useSlotForCGE(primaryCGE.id, level)
    if (!result.success) {
      console.warn('Failed to use slot:', result.error)
    }
  }

  const handleUsePoolEntity = (cost: number) => {
    if (!poolResourceId) return
    const result = consumeResource(poolResourceId, cost)
    if (!result.success) {
      console.warn('Failed to consume pool:', result.error)
    }
  }

  // Render POOL-based system
  if (isPoolResource && pool) {
    const knownEntityIds = knownSelections['-1'] ?? []
    const costPath = trackConfig?.resource.type === 'POOL'
      ? (trackConfig.resource as ResourceConfigPool).costPath
      : undefined

    type KnownEntityWithCost = KnownEntityDisplay & { cost: number }
    const knownEntities: KnownEntityWithCost[] = knownEntityIds.map((entityId) => {
      const entity = compendium.getEntityById(entityId)
      const cost = entity ? calculatePoolCost(costPath, entity as Record<string, unknown>) : 1
      return {
        id: entityId,
        name: formatEntityDisplayName(entityId, entity),
        image: entity?.image,
        cost,
      }
    })

    const poolLabel = primaryCGE.config.labels?.pool ?? 'pool'
    const actionLabel = primaryCGE.config.labels?.action ?? 'Usar'

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <YStack>
          <PoolHeader
            label={poolLabel}
            current={pool.current}
            max={pool.max}
            accentColor={accentColor}
          />

          <YStack marginTop={16}>
            <LevelHeader label={primaryCGE.config.labels?.known ?? 'Conocidos'} count={String(knownEntities.length)} />
            {knownEntities.length === 0 ? (
              <Text
                fontSize={11}
                color="$placeholderColor"
                textAlign="center"
                paddingVertical={10}
                paddingHorizontal={ENTITY_ROW_PADDING_HORIZONTAL}
              >
                Sin entidades conocidas
              </Text>
            ) : (
              knownEntities.map((knownEntity, index) => {
                const canUse = pool.current >= knownEntity.cost
                return (
                  <EntityRow
                    key={knownEntity.id}
                    name={knownEntity.name}
                    image={knownEntity.image}
                    subtitle={`Coste: ${knownEntity.cost} ${poolLabel}`}
                    isLast={index === knownEntities.length - 1}
                    opacity={canUse ? 1 : 0.5}
                    onPress={() => navigateToDetail('compendiumEntity', knownEntity.id, knownEntity.name)}
                    rightElement={
                      <ActionButton
                        canUse={canUse}
                        accentColor={accentColor}
                        disabledColor={themeColors.borderColor}
                        entityName={knownEntity.name}
                        actionLabel={actionLabel}
                        onPress={() => handleUsePoolEntity(knownEntity.cost)}
                      />
                    }
                  />
                )
              })
            )}
          </YStack>
        </YStack>
      </ScrollView>
    )
  }

  // Render SLOTS-based system (BOUND or spontaneous)
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingVertical: 12 }}
      showsVerticalScrollIndicator={false}
    >
      <YStack>
        {slots.map((slot) => {
          if (slot.max === 0) return null

          const levelLabel = getLevelLabel(slot.level)
          const actionLabel = primaryCGE.config.labels?.action ?? 'Usar'

          // BOUND preparation: group by entity and show counts
          if (isBoundPreparation && slot.boundSlots) {
            const preparedSlots = slot.boundSlots.filter(bs => bs.preparedEntityId)
            const groupedByEntity = groupBoundSlotsByEntity(preparedSlots)
            const entityEntries = Array.from(groupedByEntity.entries())

            const totalAvailable = preparedSlots.filter(bs => !bs.used).length
            const totalPrepared = preparedSlots.length

            return (
              <YStack key={slot.level}>
                <LevelHeader label={levelLabel} count={`${totalAvailable}/${totalPrepared}`} />

                {entityEntries.length === 0 ? (
                  <Text
                    fontSize={11}
                    color="$placeholderColor"
                    textAlign="center"
                    paddingVertical={10}
                    paddingHorizontal={ENTITY_ROW_PADDING_HORIZONTAL}
                  >
                    Sin preparaciones
                  </Text>
                ) : (
                  entityEntries.map(([entityId, data], index) => {
                    const entity = compendium.getEntityById(entityId)
                    const displayName = formatEntityDisplayName(entityId, entity)
                    const canUse = data.available > 0
                    const subtitle = data.total > 1
                      ? `${data.available}/${data.total} disponibles`
                      : !canUse ? 'Usado' : undefined

                    return (
                      <EntityRow
                        key={entityId}
                        name={displayName}
                        image={entity?.image}
                        subtitle={subtitle}
                        isLast={index === entityEntries.length - 1}
                        opacity={canUse ? 1 : 0.5}
                        onPress={() => navigateToDetail('compendiumEntity', entityId, displayName)}
                        rightElement={
                          <ActionButton
                            canUse={canUse}
                            accentColor={accentColor}
                            disabledColor={themeColors.borderColor}
                            entityName={displayName}
                            actionLabel={actionLabel}
                            onPress={() => handleUseBoundEntity(data.slots)}
                          />
                        }
                      />
                    )
                  })
                )}
              </YStack>
            )
          }

          // Spontaneous: show known entities with slot consumption
          const slotsRemaining = slot.current
          const levelKnownEntities = getKnownEntitiesForLevel(slot.level)
          const canUse = slotsRemaining > 0
          const knownLabel = primaryCGE.config.labels?.known ?? 'conocidos'

          const handleSlotValueChange = (value: number) => {
            setSlotValueForCGE(primaryCGE.id, slot.level, value, slot.max)
          }

          return (
            <YStack key={slot.level}>
              <SlotLevelHeader
                label={levelLabel}
                current={slotsRemaining}
                max={slot.max}
                textColor={textColor}
                onValueChange={handleSlotValueChange}
              />

              {levelKnownEntities.length === 0 ? (
                <Text
                  fontSize={11}
                  color="$placeholderColor"
                  textAlign="center"
                  paddingVertical={10}
                  paddingHorizontal={ENTITY_ROW_PADDING_HORIZONTAL}
                >
                  Sin {knownLabel.toLowerCase()}
                </Text>
              ) : (
                levelKnownEntities.map((knownEntity, index) => (
                  <EntityRow
                    key={knownEntity.id}
                    name={knownEntity.name}
                    image={knownEntity.image}
                    isLast={index === levelKnownEntities.length - 1}
                    opacity={canUse ? 1 : 0.5}
                    onPress={() => navigateToDetail('compendiumEntity', knownEntity.id, knownEntity.name)}
                    rightElement={
                      <ActionButton
                        canUse={canUse}
                        accentColor={accentColor}
                        disabledColor={themeColors.borderColor}
                        entityName={knownEntity.name}
                        actionLabel={actionLabel}
                        onPress={() => handleUseLevelSlot(slot.level)}
                      />
                    }
                  />
                ))
              )}
            </YStack>
          )
        })}
      </YStack>
    </ScrollView>
  )
}
