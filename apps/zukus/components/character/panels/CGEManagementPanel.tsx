import { Pressable } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, XStack, Text } from 'tamagui'
import { usePrimaryCGE, useCharacterStore, useCompendiumContext, EntityImage } from '../../../ui'
import { useNavigateToDetail } from '../../../navigation'
import type { CalculatedSlot, CalculatedCGE } from '@zukus/core'

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
      contentContainerStyle={{ paddingVertical: 16, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary - simplified to just "X / Y" */}
      <XStack justifyContent="center" paddingVertical={8} paddingHorizontal={16}>
        <Text fontSize={14} color="$placeholderColor">
          {totalPrepared} / {totalSlots} preparados
        </Text>
      </XStack>

      {/* Preparations by level */}
      <YStack gap={16}>
        {slots.map((slot) => {
          if (slot.max === 0) return null

          const levelPreps = preparationsByLevel.get(slot.level) ?? []
          const levelLabel = getLevelLabel(slot.level)
          const preparedCount = levelPreps.length
          const emptySlots = slot.boundSlots?.filter((bs) => !bs.preparedEntityId) ?? []
          const hasEmptySlots = emptySlots.length > 0

          return (
            <YStack key={slot.level}>
              {/* Level header with borders */}
              <YStack
                borderTopWidth={1}
                borderBottomWidth={1}
                borderColor="$borderColor"
                paddingVertical={10}
                marginBottom={8}
              >
                <Text fontSize={12} color="$placeholderColor" fontWeight="600" textAlign="center">
                  {levelLabel} ({preparedCount}/{slot.max})
                </Text>
              </YStack>

              {/* Prepared entities */}
              {levelPreps.map((prep, index) => {
                // Get entity name from compendium, fallback to formatted ID
                const entity = compendium.getEntityById(prep.entityId)
                const displayName = entity?.name ?? prep.entityId
                  .replace(/-/g, ' ')
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l: string) => l.toUpperCase())
                // Only hide border on last prepared if there are no empty slots after
                const isLastItem = index === levelPreps.length - 1 && !hasEmptySlots

                return (
                  <XStack
                    key={prep.slotId}
                    alignItems="center"
                    paddingVertical={10}
                    paddingHorizontal={16}
                    gap={12}
                    borderBottomWidth={isLastItem ? 0 : 1}
                    borderBottomColor="$borderColor"
                  >
                    <EntityImage image={entity?.image} fallbackText={displayName} />

                    <Text fontSize={14} color="$color" flex={1}>
                      {displayName}
                    </Text>
                    <Pressable
                      onPress={() => handleRemovePreparation(slot.level, prep.slotIndex, primaryTrack.id)}
                      hitSlop={8}
                    >
                      {({ pressed }) => (
                        <Text fontSize={12} color="$colorFocus" opacity={pressed ? 0.6 : 1}>
                          Quitar
                        </Text>
                      )}
                    </Pressable>
                  </XStack>
                )
              })}

              {/* Empty slots - show each individually */}
              {emptySlots.map((emptySlot, index) => {
                const isLastEmpty = index === emptySlots.length - 1

                return (
                  <Pressable
                    key={emptySlot.slotId}
                    onPress={() => handleAddPreparation(slot.level, emptySlot.index, primaryTrack.id)}
                  >
                    {({ pressed }) => (
                      <XStack
                        alignItems="center"
                        paddingVertical={10}
                        paddingHorizontal={16}
                        gap={12}
                        borderBottomWidth={isLastEmpty ? 0 : 1}
                        borderBottomColor="$borderColor"
                        opacity={pressed ? 0.6 : 1}
                      >
                        {/* Empty image placeholder */}
                        <YStack
                          width={40}
                          height={40}
                          borderRadius={6}
                          borderWidth={1}
                          borderColor="$borderColor"
                          borderStyle="dashed"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text fontSize={16} color="$placeholderColor">+</Text>
                        </YStack>

                        <Text fontSize={14} color="$placeholderColor" flex={1}>
                          Preparar...
                        </Text>
                      </XStack>
                    )}
                  </Pressable>
                )
              })}
            </YStack>
          )
        })}
      </YStack>

      {/* Info */}
      <Text fontSize={12} color="$placeholderColor" lineHeight={18} paddingTop={8} paddingHorizontal={16}>
        Selecciona los {entityTypeLabel.toLowerCase()} que quieres preparar para cada nivel.
      </Text>
    </ScrollView>
  )
}
