import { Pressable } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, XStack, Text } from 'tamagui'
import { usePrimaryCGE, useCharacterStore, useCompendiumContext, useTheme } from '../../../ui'
import { useNavigateToDetail } from '../../../navigation'
import type { CalculatedCGE, CalculatedBoundSlot } from '@zukus/core'
import { EntityRow, LevelHeader, ENTITY_ROW_PADDING_HORIZONTAL } from './EntityRow'

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
  const navigateToDetail = useNavigateToDetail()
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
      contentContainerStyle={{ paddingVertical: 12 }}
      showsVerticalScrollIndicator={false}
    >
      <YStack>
        {slots.map((slot) => {
          if (slot.max === 0) return null

          const levelLabel = getLevelLabel(slot.level)

          // For BOUND preparation: group by entity and show counts
          if (isBoundPreparation && slot.boundSlots) {
            const preparedSlots = slot.boundSlots.filter(bs => bs.preparedEntityId)
            const groupedByEntity = groupBoundSlotsByEntity(preparedSlots)
            const entityEntries = Array.from(groupedByEntity.entries())

            const totalAvailable = preparedSlots.filter(bs => !bs.used).length
            const totalPrepared = preparedSlots.length

            return (
              <YStack key={slot.level}>
                <LevelHeader label={levelLabel} count={`${totalAvailable}/${totalPrepared} disponibles`} />

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
                    const displayName = entity?.name ?? entityId
                      .replace(/-/g, ' ')
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l: string) => l.toUpperCase())
                    const canCast = data.available > 0
                    const subtitle = data.total > 1
                      ? `${data.available}/${data.total} disponibles`
                      : !canCast ? 'Usado' : undefined

                    return (
                      <EntityRow
                        key={entityId}
                        name={displayName}
                        image={entity?.image}
                        subtitle={subtitle}
                        isLast={index === entityEntries.length - 1}
                        opacity={canCast ? 1 : 0.5}
                        onPress={() => navigateToDetail('compendiumEntity', entityId, displayName)}
                        rightElement={
                          <CastButton
                            canCast={canCast}
                            accentColor={accentColor}
                            disabledColor={themeColors.borderColor}
                            onPress={() => handleCastBoundEntity(data.slots)}
                          />
                        }
                      />
                    )
                  })
                )}
              </YStack>
            )
          }

          // For non-BOUND: show level-based slots
          const slotsRemaining = slot.current

          return (
            <YStack key={slot.level}>
              <LevelHeader label={levelLabel} count={`${slotsRemaining}/${slot.max} disponibles`} />

              <XStack
                alignItems="center"
                justifyContent="center"
                paddingVertical={10}
                paddingHorizontal={ENTITY_ROW_PADDING_HORIZONTAL}
              >
                <Pressable
                  onPress={() => handleCastLevelSlot(slot.level)}
                  disabled={slotsRemaining <= 0}
                  hitSlop={8}
                >
                  {({ pressed }) => (
                    <XStack
                      paddingVertical={5}
                      paddingHorizontal={12}
                      backgroundColor={slotsRemaining > 0 ? accentColor : themeColors.borderColor}
                      borderRadius={6}
                      opacity={pressed ? 0.7 : slotsRemaining > 0 ? 1 : 0.5}
                    >
                      <Text
                        fontSize={11}
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

type CastButtonProps = {
  canCast: boolean
  accentColor: string
  disabledColor: string
  onPress: () => void
}

function CastButton({ canCast, accentColor, disabledColor, onPress }: CastButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={!canCast} hitSlop={8}>
      {({ pressed }) => (
        <XStack
          paddingVertical={5}
          paddingHorizontal={10}
          backgroundColor={canCast ? accentColor : disabledColor}
          borderRadius={6}
          opacity={pressed ? 0.7 : canCast ? 1 : 0.5}
        >
          <Text
            fontSize={11}
            fontWeight="600"
            color={canCast ? '#FFFFFF' : '$placeholderColor'}
          >
            Lanzar
          </Text>
        </XStack>
      )}
    </Pressable>
  )
}
