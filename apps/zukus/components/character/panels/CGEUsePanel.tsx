import { Pressable } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, XStack, Text } from 'tamagui'
import { usePrimaryCGE, useCharacterStore, useCompendiumContext, useTheme, EntityImage } from '../../../ui'
import type { CalculatedCGE, CalculatedSlot, CalculatedBoundSlot } from '@zukus/core'

type CGEUsePanelProps = {
  cge?: CalculatedCGE | null
}

/**
 * Groups bound slots by entityId for display.
 * Returns a map of entityId -> { total, available, slots }
 */
function groupBoundSlotsByEntity(
  boundSlots: CalculatedBoundSlot[]
): Map<string, { total: number; available: number; slots: CalculatedBoundSlot[] }> {
  const grouped = new Map<string, { total: number; available: number; slots: CalculatedBoundSlot[] }>()

  for (const slot of boundSlots) {
    if (!slot.preparedEntityId) continue

    const existing = grouped.get(slot.preparedEntityId)
    if (existing) {
      existing.total++
      if (!slot.used) existing.available++
      existing.slots.push(slot)
    } else {
      grouped.set(slot.preparedEntityId, {
        total: 1,
        available: slot.used ? 0 : 1,
        slots: [slot],
      })
    }
  }

  return grouped
}

/**
 * CGE Use Panel - Runtime view for casting spells/using abilities.
 *
 * For BOUND preparation (Cleric, Wizard): Shows prepared entities grouped by entityId.
 * When cast, one slot of that entity becomes unavailable until rest.
 * Displays "X/Y disponibles" when same entity is prepared multiple times.
 *
 * For other preparation types (Sorcerer): Shows level-based slot consumption.
 */
export function CGEUsePanel({ cge: propsCge }: CGEUsePanelProps) {
  "use no memo"

  const getLevelLabel = (level: number): string => {
    if (level === 0) return 'Nivel 0'
    return `Nivel ${level}`
  }

  const hookCge = usePrimaryCGE()
  const primaryCGE = propsCge ?? hookCge
  const useSlotForCGE = useCharacterStore((state) => state.useSlotForCGE)
  const useBoundSlotForCGE = useCharacterStore((state) => state.useBoundSlotForCGE)
  const compendium = useCompendiumContext()
  const { themeInfo, themeColors } = useTheme()
  const accentColor = themeInfo.colors.accent

  if (!primaryCGE) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">No hay CGE disponible</Text>
      </YStack>
    )
  }

  const primaryTrack = primaryCGE.tracks[0]
  const slots = primaryTrack?.slots ?? []
  const isBoundPreparation = primaryTrack?.preparationType === 'BOUND'

  // For BOUND: use the first available slot of that entity
  const handleCastBoundEntity = (entitySlots: CalculatedBoundSlot[]) => {
    // Find the first available (not used) slot
    const availableSlot = entitySlots.find(s => !s.used)
    if (!availableSlot) return

    const result = useBoundSlotForCGE(primaryCGE.id, availableSlot.slotId)
    if (!result.success) {
      console.warn('Failed to use bound slot:', result.error)
    }
  }

  // For non-BOUND: use generic level slot
  const handleCastLevelSlot = (level: number) => {
    const result = useSlotForCGE(primaryCGE.id, level)
    if (!result.success) {
      console.warn('Failed to use slot:', result.error)
    }
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingVertical: 16, gap: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <YStack gap={16}>
        {slots.map((slot) => {
          if (slot.max === 0) return null

          const levelLabel = getLevelLabel(slot.level)

          // For BOUND preparation: group by entity and show counts
          if (isBoundPreparation && slot.boundSlots) {
            const preparedSlots = slot.boundSlots.filter(bs => bs.preparedEntityId)
            const groupedByEntity = groupBoundSlotsByEntity(preparedSlots)
            const entityEntries = Array.from(groupedByEntity.entries())

            // Calculate total available for this level
            const totalAvailable = preparedSlots.filter(bs => !bs.used).length
            const totalPrepared = preparedSlots.length

            return (
              <YStack key={slot.level}>
                {/* Level header */}
                <YStack
                  borderTopWidth={1}
                  borderBottomWidth={1}
                  borderColor="$borderColor"
                  paddingVertical={10}
                  marginBottom={8}
                >
                  <Text fontSize={12} color="$placeholderColor" fontWeight="600" textAlign="center">
                    {levelLabel} ({totalAvailable}/{totalPrepared} disponibles)
                  </Text>
                </YStack>

                {/* Grouped entities */}
                {entityEntries.length === 0 ? (
                  <Text
                    fontSize={13}
                    color="$placeholderColor"
                    textAlign="center"
                    paddingVertical={12}
                    paddingHorizontal={16}
                  >
                    Sin preparaciones
                  </Text>
                ) : (
                  entityEntries.map(([entityId, data], index) => (
                    <GroupedEntityRow
                      key={entityId}
                      entityId={entityId}
                      available={data.available}
                      total={data.total}
                      slots={data.slots}
                      compendium={compendium}
                      accentColor={accentColor}
                      disabledColor={themeColors.borderColor}
                      isLast={index === entityEntries.length - 1}
                      onCast={handleCastBoundEntity}
                    />
                  ))
                )}
              </YStack>
            )
          }

          // For non-BOUND: show level-based slots (existing behavior)
          const slotsRemaining = slot.current

          return (
            <YStack key={slot.level}>
              {/* Level header */}
              <YStack
                borderTopWidth={1}
                borderBottomWidth={1}
                borderColor="$borderColor"
                paddingVertical={10}
                marginBottom={8}
              >
                <Text fontSize={12} color="$placeholderColor" fontWeight="600" textAlign="center">
                  {levelLabel} ({slotsRemaining}/{slot.max} disponibles)
                </Text>
              </YStack>

              {/* Generic cast button for level */}
              <XStack
                alignItems="center"
                justifyContent="center"
                paddingVertical={12}
                paddingHorizontal={16}
              >
                <Pressable
                  onPress={() => handleCastLevelSlot(slot.level)}
                  disabled={slotsRemaining <= 0}
                  hitSlop={8}
                >
                  {({ pressed }) => (
                    <XStack
                      paddingVertical={8}
                      paddingHorizontal={16}
                      backgroundColor={slotsRemaining > 0 ? accentColor : themeColors.borderColor}
                      borderRadius={6}
                      opacity={pressed ? 0.7 : slotsRemaining > 0 ? 1 : 0.5}
                    >
                      <Text
                        fontSize={13}
                        fontWeight="600"
                        color={slotsRemaining > 0 ? '#FFFFFF' : '$placeholderColor'}
                      >
                        Usar slot de {levelLabel}
                      </Text>
                    </XStack>
                  )}
                </Pressable>
              </XStack>
            </YStack>
          )
        })}
      </YStack>
    </ScrollView>
  )
}

type GroupedEntityRowProps = {
  entityId: string
  available: number
  total: number
  slots: CalculatedBoundSlot[]
  compendium: ReturnType<typeof useCompendiumContext>
  accentColor: string
  disabledColor: string
  isLast: boolean
  onCast: (slots: CalculatedBoundSlot[]) => void
}

function GroupedEntityRow({
  entityId,
  available,
  total,
  slots,
  compendium,
  accentColor,
  disabledColor,
  isLast,
  onCast,
}: GroupedEntityRowProps) {
  const entity = compendium.getEntityById(entityId)
  const displayName = entity?.name ?? entityId
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase())

  const canCast = available > 0
  const showCount = total > 1

  return (
    <XStack
      alignItems="center"
      paddingVertical={10}
      paddingHorizontal={16}
      gap={12}
      borderBottomWidth={isLast ? 0 : 1}
      borderBottomColor="$borderColor"
      opacity={canCast ? 1 : 0.5}
    >
      <EntityImage image={entity?.image} fallbackText={displayName} />

      <YStack flex={1} gap={2}>
        <Text fontSize={14} color="$color">
          {displayName}
        </Text>
        {showCount && (
          <Text fontSize={11} color="$placeholderColor">
            {available}/{total} disponibles
          </Text>
        )}
        {!canCast && !showCount && (
          <Text fontSize={11} color="$placeholderColor">
            Usado
          </Text>
        )}
      </YStack>

      <Pressable
        onPress={() => onCast(slots)}
        disabled={!canCast}
        hitSlop={8}
      >
        {({ pressed }) => (
          <XStack
            paddingVertical={6}
            paddingHorizontal={12}
            backgroundColor={canCast ? accentColor : disabledColor}
            borderRadius={6}
            opacity={pressed ? 0.7 : canCast ? 1 : 0.5}
          >
            <Text
              fontSize={12}
              fontWeight="600"
              color={canCast ? '#FFFFFF' : '$placeholderColor'}
            >
              Lanzar
            </Text>
          </XStack>
        )}
      </Pressable>
    </XStack>
  )
}
