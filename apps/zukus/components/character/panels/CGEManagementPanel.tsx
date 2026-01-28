import { Pressable } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, XStack, Text } from 'tamagui'
import { usePrimaryCGE, useCharacterStore, useCompendiumContext } from '../../../ui'
import { useNavigateToDetail } from '../../../navigation'
import type { CalculatedSlot, CalculatedCGE } from '@zukus/core'
import { EntityRow, EmptySlotRow, LevelHeader } from './EntityRow'

type CGEManagementPanelProps = {
  cge?: CalculatedCGE | null
}

/**
 * CGE Management Panel - Content for preparing spells, managing spellbook, etc.
 * Used in both desktop SidePanel and mobile detail screen.
 */
export function CGEManagementPanel({ cge: propsCge }: CGEManagementPanelProps) {
  "use no memo"

  // Helper functions inside component to avoid React Compiler issues
  const getCGELabel = (entityType: string): string => {
    const labels: Record<string, string> = {
      spell: 'Conjuros',
      power: 'Poderes',
      maneuver: 'Maniobras',
      invocation: 'Invocaciones',
    }
    return labels[entityType] ?? 'Habilidades'
  }

  const getLevelLabel = (level: number): string => {
    if (level === 0) return 'Nivel 0'
    return `Nivel ${level}`
  }

  const getPreparationsByLevel = (
    slots: CalculatedSlot[]
  ): Map<number, { entityId: string; slotId: string; slotIndex: number }[]> => {
    const byLevel = new Map<number, { entityId: string; slotId: string; slotIndex: number }[]>()

    for (const slot of slots) {
      if (!slot.boundSlots) continue

      let levelList = byLevel.get(slot.level)
      if (!levelList) {
        levelList = []
        byLevel.set(slot.level, levelList)
      }

      for (const boundSlot of slot.boundSlots) {
        if (boundSlot.preparedEntityId) {
          levelList.push({
            entityId: boundSlot.preparedEntityId,
            slotId: boundSlot.slotId,
            slotIndex: boundSlot.index,
          })
        }
      }
    }

    return byLevel
  }

  const hookCge = usePrimaryCGE()
  const primaryCGE = propsCge ?? hookCge
  const unprepareSlotForCGE = useCharacterStore((state) => state.unprepareSlotForCGE)
  const navigateToDetail = useNavigateToDetail()
  const compendium = useCompendiumContext()

  if (!primaryCGE) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">No hay CGE disponible</Text>
      </YStack>
    )
  }

  const entityTypeLabel = getCGELabel(primaryCGE.entityType)
  const primaryTrack = primaryCGE.tracks[0]
  const slots = primaryTrack?.slots ?? []
  const preparationsByLevel = getPreparationsByLevel(slots)

  // Count total prepared
  let totalPrepared = 0
  let totalSlots = 0
  for (const slot of slots) {
    if (slot.boundSlots) {
      totalSlots += slot.max
      totalPrepared += slot.boundSlots.filter((s) => s.preparedEntityId).length
    }
  }

  const handleAddPreparation = (level: number, slotIndex: number, trackId: string) => {
    // Navigate to entity select using the unified navigation system
    // Format: level:slotIndex:cgeId:trackId
    const selectionId = `${level}:${slotIndex}:${primaryCGE.id}:${trackId}`
    const title = level === 0 ? 'Seleccionar Nivel 0' : `Seleccionar Nivel ${level}`
    navigateToDetail('cgeEntitySelect', selectionId, title)
  }

  const handleRemovePreparation = (level: number, slotIndex: number, trackId: string) => {
    unprepareSlotForCGE(primaryCGE.id, level, slotIndex, trackId)
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingVertical: 12 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary */}
      <XStack justifyContent="center" paddingVertical={6} paddingHorizontal={16}>
        <Text fontSize={12} color="$placeholderColor">
          {totalPrepared} / {totalSlots} preparados
        </Text>
      </XStack>

      {/* Preparations by level */}
      <YStack>
        {slots.map((slot) => {
          if (slot.max === 0) return null

          const levelPreps = preparationsByLevel.get(slot.level) ?? []
          const levelLabel = getLevelLabel(slot.level)
          const preparedCount = levelPreps.length
          const emptySlots = slot.boundSlots?.filter((bs) => !bs.preparedEntityId) ?? []
          const hasEmptySlots = emptySlots.length > 0

          return (
            <YStack key={slot.level}>
              <LevelHeader label={levelLabel} count={`${preparedCount}/${slot.max}`} />

              {/* Prepared entities */}
              {levelPreps.map((prep, index) => {
                const entity = compendium.getEntityById(prep.entityId)
                const displayName = entity?.name ?? prep.entityId
                  .replace(/-/g, ' ')
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l: string) => l.toUpperCase())
                const isLastItem = index === levelPreps.length - 1 && !hasEmptySlots

                return (
                  <EntityRow
                    key={prep.slotId}
                    name={displayName}
                    image={entity?.image}
                    isLast={isLastItem}
                    rightElement={
                      <Pressable
                        onPress={() => handleRemovePreparation(slot.level, prep.slotIndex, primaryTrack.id)}
                        hitSlop={8}
                      >
                        {({ pressed }) => (
                          <Text fontSize={11} color="$colorFocus" opacity={pressed ? 0.6 : 1}>
                            Quitar
                          </Text>
                        )}
                      </Pressable>
                    }
                  />
                )
              })}

              {/* Empty slots */}
              {emptySlots.map((emptySlot, index) => (
                <EmptySlotRow
                  key={emptySlot.slotId}
                  isLast={index === emptySlots.length - 1}
                  onPress={() => handleAddPreparation(slot.level, emptySlot.index, primaryTrack.id)}
                />
              ))}
            </YStack>
          )
        })}
      </YStack>

      {/* Info */}
      <Text fontSize={11} color="$placeholderColor" lineHeight={16} paddingTop={10} paddingHorizontal={16}>
        Selecciona los {entityTypeLabel.toLowerCase()} que quieres preparar para cada nivel.
      </Text>
    </ScrollView>
  )
}
