import { View, Pressable } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, XStack, Text } from 'tamagui'
import { usePrimaryCGE, useTheme, useCharacterStore, useCompendiumContext } from '../../../ui'
import { useNavigateToDetail } from '../../../navigation'
import type { CalculatedSlot, CalculatedCGE } from '@zukus/core'

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
 * Returns a label for entity level.
 */
function getLevelLabel(level: number): string {
  if (level === 0) return 'Nivel 0'
  return `Nivel ${level}`
}

/**
 * Groups bound preparations by level.
 */
function getPreparationsByLevel(
  slots: CalculatedSlot[]
): Map<number, { entityId: string; slotId: string; slotIndex: number }[]> {
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

type CGEManagementPanelProps = {
  cge?: CalculatedCGE | null
}

/**
 * CGE Management Panel - Content for preparing spells, managing spellbook, etc.
 * Used in both desktop SidePanel and mobile detail screen.
 */
export function CGEManagementPanel({ cge: propsCge }: CGEManagementPanelProps) {
  "use no memo"
  const { themeColors } = useTheme()
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

  const handleAddPreparation = (level: number, slotIndex: number) => {
    // Navigate to entity select using the unified navigation system
    // Format: level:slotIndex:cgeId
    const selectionId = `${level}:${slotIndex}:${primaryCGE.id}`
    const title = level === 0 ? 'Seleccionar Nivel 0' : `Seleccionar Nivel ${level}`
    navigateToDetail('cgeEntitySelect', selectionId, title)
  }

  const handleRemovePreparation = (level: number, slotIndex: number) => {
    unprepareSlotForCGE(primaryCGE.id, level, slotIndex)
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary - simplified to just "X / Y" */}
      <XStack justifyContent="center" paddingVertical={8}>
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

          return (
            <YStack key={slot.level} gap={8}>
              {/* Level header */}
              <XStack alignItems="center" gap={8}>
                <View style={{ flex: 1, height: 1, backgroundColor: themeColors.borderColor }} />
                <Text fontSize={12} color="$placeholderColor" fontWeight="600">
                  {levelLabel} ({preparedCount}/{slot.max})
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: themeColors.borderColor }} />
              </XStack>

              {/* Prepared entities */}
              {levelPreps.map((prep) => {
                // Get entity name from compendium, fallback to formatted ID
                const entity = compendium.getEntityById(prep.entityId)
                const displayName = entity?.name ?? prep.entityId
                  .replace(/-/g, ' ')
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())

                return (
                  <XStack
                    key={prep.slotId}
                    alignItems="center"
                    justifyContent="space-between"
                    paddingVertical={8}
                    paddingHorizontal={12}
                    backgroundColor="$uiBackgroundColor"
                    borderRadius={8}
                  >
                    <Text fontSize={14} color="$color" flex={1}>
                      {displayName}
                    </Text>
                    <Pressable
                      onPress={() => handleRemovePreparation(slot.level, prep.slotIndex)}
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
              {slot.boundSlots?.filter((bs) => !bs.preparedEntityId).map((emptySlot) => (
                <Pressable
                  key={emptySlot.slotId}
                  onPress={() => handleAddPreparation(slot.level, emptySlot.index)}
                >
                  {({ pressed }) => (
                    <XStack
                      alignItems="center"
                      justifyContent="center"
                      paddingVertical={12}
                      backgroundColor="$uiBackgroundColor"
                      borderRadius={8}
                      borderWidth={1}
                      borderColor="$borderColor"
                      borderStyle="dashed"
                      opacity={pressed ? 0.6 : 1}
                    >
                      <Text fontSize={14} color="$placeholderColor">
                        + Preparar
                      </Text>
                    </XStack>
                  )}
                </Pressable>
              ))}
            </YStack>
          )
        })}
      </YStack>

      {/* Info */}
      <Text fontSize={12} color="$placeholderColor" lineHeight={18} paddingTop={8}>
        Selecciona los {entityTypeLabel.toLowerCase()} que quieres preparar para cada nivel.
      </Text>
    </ScrollView>
  )
}
