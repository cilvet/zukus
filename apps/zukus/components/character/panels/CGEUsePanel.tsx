import { Pressable } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, XStack, Text } from 'tamagui'
import { usePrimaryCGE, useCharacterStore, useCompendiumContext, useTheme, EntityImage } from '../../../ui'
import type { CalculatedCGE, CalculatedSlot } from '@zukus/core'

type CGEUsePanelProps = {
  cge?: CalculatedCGE | null
}

/**
 * Groups prepared entities by level.
 * Returns: Map<level, Map<entityId, { count, slotIndices }>>
 */
function groupPreparedByLevel(
  slots: CalculatedSlot[]
): Map<number, Map<string, { count: number; slotIndices: number[] }>> {
  const byLevel = new Map<number, Map<string, { count: number; slotIndices: number[] }>>()

  for (const slot of slots) {
    if (!slot.boundSlots) continue

    let levelMap = byLevel.get(slot.level)
    if (!levelMap) {
      levelMap = new Map<string, { count: number; slotIndices: number[] }>()
      byLevel.set(slot.level, levelMap)
    }

    for (const boundSlot of slot.boundSlots) {
      if (!boundSlot.preparedEntityId) continue
      const existing = levelMap.get(boundSlot.preparedEntityId)
      if (existing) {
        existing.count++
        existing.slotIndices.push(boundSlot.index)
      } else {
        levelMap.set(boundSlot.preparedEntityId, {
          count: 1,
          slotIndices: [boundSlot.index],
        })
      }
    }
  }

  return byLevel
}

/**
 * CGE Use Panel - Runtime view for casting spells/using abilities.
 * Shows prepared entities grouped by level with cast buttons.
 * Used in both desktop SidePanel and mobile tab view.
 */
export function CGEUsePanel({ cge: propsCge }: CGEUsePanelProps) {
  "use no memo"

  const getLevelLabel = (level: number): string => {
    if (level === 0) return 'Nivel 0'
    return `Nivel ${level}`
  }

  const hookCge = usePrimaryCGE()
  const primaryCGE = propsCge ?? hookCge
  const consumeSlotForCGE = useCharacterStore((state) => state.useSlotForCGE)
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
  const preparedByLevel = groupPreparedByLevel(slots)

  const handleCast = (entityId: string, level: number) => {
    const result = consumeSlotForCGE(primaryCGE.id, level)
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
      {/* Slots by level */}
      <YStack gap={16}>
        {slots.map((slot) => {
          if (slot.max === 0) return null

          const levelEntities = preparedByLevel.get(slot.level) ?? new Map()
          const entityEntries = Array.from(levelEntities.entries())
          const levelLabel = getLevelLabel(slot.level)
          const slotsRemaining = slot.current

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
                  {levelLabel} ({slotsRemaining}/{slot.max} disponibles)
                </Text>
              </YStack>

              {/* Prepared entities */}
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
                entityEntries.map(([entityId, data], index) => {
                  const entity = compendium.getEntityById(entityId)
                  const displayName = entity?.name ?? entityId
                    .replace(/-/g, ' ')
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (l: string) => l.toUpperCase())
                  const isLast = index === entityEntries.length - 1
                  const hasSlots = slotsRemaining > 0
                  const countLabel = data.count > 1 ? ` x${data.count}` : ''

                  return (
                    <XStack
                      key={entityId}
                      alignItems="center"
                      paddingVertical={10}
                      paddingHorizontal={16}
                      gap={12}
                      borderBottomWidth={isLast ? 0 : 1}
                      borderBottomColor="$borderColor"
                    >
                      <EntityImage image={entity?.image} fallbackText={displayName} />

                      <YStack flex={1} gap={2}>
                        <Text fontSize={14} color="$color">
                          {displayName}{countLabel}
                        </Text>
                      </YStack>

                      <Pressable
                        onPress={() => handleCast(entityId, slot.level)}
                        disabled={!hasSlots}
                        hitSlop={8}
                      >
                        {({ pressed }) => (
                          <XStack
                            paddingVertical={6}
                            paddingHorizontal={12}
                            backgroundColor={hasSlots ? accentColor : themeColors.borderColor}
                            borderRadius={6}
                            opacity={pressed ? 0.7 : hasSlots ? 1 : 0.5}
                          >
                            <Text
                              fontSize={12}
                              fontWeight="600"
                              color={hasSlots ? '#FFFFFF' : '$placeholderColor'}
                            >
                              Lanzar
                            </Text>
                          </XStack>
                        )}
                      </Pressable>
                    </XStack>
                  )
                })
              )}
            </YStack>
          )
        })}
      </YStack>
    </ScrollView>
  )
}
