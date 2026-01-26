import { View, Pressable } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, XStack, Text } from 'tamagui'
import { usePrimaryCGE, useCharacterStore } from '../../../ui'
import { useNavigateToDetail } from '../../../navigation'
import { SectionHeader, SectionCard } from '../CharacterComponents'
import type { CalculatedCGE, CalculatedSlot } from '@zukus/core'

/**
 * Returns a label for the CGE entity type (localized).
 */
function getEntityTypeLabel(entityType: string): string {
  const labels: Record<string, string> = {
    spell: 'Conjuros',
    power: 'Poderes',
    maneuver: 'Maniobras',
    invocation: 'Invocaciones',
  }
  return labels[entityType] ?? 'Habilidades'
}

/**
 * Groups bound slots by entity ID and counts occurrences.
 * Returns: { entityId: { count: number, levels: number[] } }
 */
function groupBoundSlotsByEntity(
  slots: CalculatedSlot[]
): Map<string, { count: number; levels: number[] }> {
  const groups = new Map<string, { count: number; levels: number[] }>()

  for (const slot of slots) {
    if (!slot.boundSlots) continue

    for (const boundSlot of slot.boundSlots) {
      if (!boundSlot.preparedEntityId) continue

      const existing = groups.get(boundSlot.preparedEntityId)
      if (existing) {
        existing.count++
        if (!existing.levels.includes(slot.level)) {
          existing.levels.push(slot.level)
        }
      } else {
        groups.set(boundSlot.preparedEntityId, {
          count: 1,
          levels: [slot.level],
        })
      }
    }
  }

  return groups
}

/**
 * Groups prepared entities by level.
 * Returns: { level: { entityId: count }[] }
 */
function groupPreparedByLevel(
  slots: CalculatedSlot[]
): Map<number, Map<string, number>> {
  const byLevel = new Map<number, Map<string, number>>()

  for (const slot of slots) {
    if (!slot.boundSlots) continue

    let levelMap = byLevel.get(slot.level)
    if (!levelMap) {
      levelMap = new Map<string, number>()
      byLevel.set(slot.level, levelMap)
    }

    for (const boundSlot of slot.boundSlots) {
      if (!boundSlot.preparedEntityId) continue
      const current = levelMap.get(boundSlot.preparedEntityId) ?? 0
      levelMap.set(boundSlot.preparedEntityId, current + 1)
    }
  }

  return byLevel
}

type CGELevelGroupProps = {
  level: number
  slot: CalculatedSlot
  entities: Map<string, number> // entityId -> count
  onCast: (entityId: string, level: number) => void
}

function CGELevelGroup({ level, slot, entities, onCast }: CGELevelGroupProps) {
  "use no memo"
  const entityEntries = Array.from(entities.entries())

  if (entityEntries.length === 0 && slot.max === 0) {
    return null
  }

  const levelLabel = level === 0 ? 'Trucos' : `Nivel ${level}`
  const slotsLabel = slot.max > 0 ? ` (${slot.current}/${slot.max})` : ''
  const hasSlots = slot.current > 0

  return (
    <YStack gap={8}>
      <XStack alignItems="center" gap={8}>
        <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
        <Text fontSize={12} color="$placeholderColor" fontWeight="600">
          {levelLabel}{slotsLabel}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
      </XStack>

      {entityEntries.length === 0 ? (
        <Text fontSize={12} color="$placeholderColor" textAlign="center" paddingVertical={8}>
          Sin preparaciones
        </Text>
      ) : (
        <YStack gap={4}>
          {entityEntries.map(([entityId, count]) => (
            <CGEEntityRow
              key={entityId}
              entityId={entityId}
              count={count}
              level={level}
              hasSlots={hasSlots}
              onCast={() => onCast(entityId, level)}
            />
          ))}
        </YStack>
      )}
    </YStack>
  )
}

type CGEEntityRowProps = {
  entityId: string
  count: number
  level: number
  hasSlots: boolean
  onCast: () => void
}

function CGEEntityRow({ entityId, count, level, hasSlots, onCast }: CGEEntityRowProps) {
  "use no memo"
  // TODO: Get entity name from compendium context
  // For now, just show the ID
  const displayName = entityId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  const countLabel = count > 1 ? ` x${count}` : ''

  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      paddingVertical={8}
      paddingHorizontal={12}
      backgroundColor="$uiBackgroundColor"
      borderRadius={8}
    >
      <Text fontSize={14} color="$color" flex={1}>
        {displayName}{countLabel}
      </Text>

      <Pressable
        onPress={onCast}
        disabled={!hasSlots}
        hitSlop={8}
      >
        {({ pressed }) => (
          <XStack
            paddingVertical={6}
            paddingHorizontal={12}
            backgroundColor={hasSlots ? '$accentColor' : '$borderColor'}
            borderRadius={6}
            opacity={pressed ? 0.7 : hasSlots ? 1 : 0.5}
          >
            <Text
              fontSize={12}
              fontWeight="600"
              color={hasSlots ? '$accentContrastText' : '$placeholderColor'}
            >
              Lanzar
            </Text>
          </XStack>
        )}
      </Pressable>
    </XStack>
  )
}

/**
 * CGE Summary Section - Main runtime view for spellcasting/abilities.
 * Shows prepared entities grouped by level with cast buttons.
 */
export function CGESummarySection() {
  "use no memo"
  const primaryCGE = usePrimaryCGE()
  const consumeSlotForCGE = useCharacterStore((state) => state.useSlotForCGE)
  const navigateToDetail = useNavigateToDetail()

  if (!primaryCGE) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <YStack padding={16}>
          <SectionCard>
            <SectionHeader icon="*" title="Sin habilidades" />
            <Text fontSize={12} color="$placeholderColor" padding={8}>
              Este personaje no tiene sistemas de conjuros o habilidades configurados.
            </Text>
          </SectionCard>
        </YStack>
      </View>
    )
  }

  const entityTypeLabel = getEntityTypeLabel(primaryCGE.entityType)

  // Get slots from the first track (we're ignoring multiple tracks for now)
  const primaryTrack = primaryCGE.tracks[0]
  const slots = primaryTrack?.slots ?? []

  // Group prepared entities by level
  const preparedByLevel = groupPreparedByLevel(slots)

  const handleManagePress = () => {
    if (!primaryCGE) return
    navigateToDetail('cgeManagement', primaryCGE.id, `Gestionar ${entityTypeLabel}`)
  }

  const handleCast = (entityId: string, level: number) => {
    if (!primaryCGE) return
    const result = consumeSlotForCGE(primaryCGE.id, level)
    if (!result.success) {
      console.warn('Failed to use slot:', result.error)
    }
  }

  return (
    <View style={{ flex: 1 }} collapsable={false}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* Header with manage button */}
        <SectionCard>
          <XStack alignItems="center" justifyContent="space-between">
            <SectionHeader icon="*" title={entityTypeLabel} />
            <Pressable onPress={handleManagePress} hitSlop={8}>
              {({ pressed }) => (
                <XStack
                  paddingVertical={8}
                  paddingHorizontal={16}
                  backgroundColor="$uiBackgroundColor"
                  borderRadius={8}
                  borderWidth={1}
                  borderColor="$borderColor"
                  opacity={pressed ? 0.7 : 1}
                >
                  <Text fontSize={14} fontWeight="600" color="$color">
                    Gestionar
                  </Text>
                </XStack>
              )}
            </Pressable>
          </XStack>
        </SectionCard>

        {/* Slots by level */}
        <SectionCard>
          <YStack gap={16}>
            {slots.map((slot) => {
              const levelEntities = preparedByLevel.get(slot.level) ?? new Map()
              return (
                <CGELevelGroup
                  key={slot.level}
                  level={slot.level}
                  slot={slot}
                  entities={levelEntities}
                  onCast={handleCast}
                />
              )
            })}
          </YStack>
        </SectionCard>
      </ScrollView>
    </View>
  )
}
