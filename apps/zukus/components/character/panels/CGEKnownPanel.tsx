import { Pressable } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, XStack, Text } from 'tamagui'
import { usePrimaryCGE, useCharacterStore, useCompendiumContext } from '../../../ui'
import { useNavigateToDetail } from '../../../navigation'
import type { CalculatedCGE, CalculatedKnownLimit } from '@zukus/core'
import { EntityRow, EmptySlotRow, LevelHeader } from './EntityRow'

type CGEKnownPanelProps = {
  cge?: CalculatedCGE | null
}

/**
 * CGE Known Panel - Manage known entities (spells known for Sorcerer, spellbook for Wizard).
 *
 * Shows known entities grouped by level with limits from knownLimits.
 * Allows adding new known entities and removing existing ones.
 */
export function CGEKnownPanel({ cge: propsCge }: CGEKnownPanelProps) {
  'use no memo'

  const getCGELabel = (entityType: string): string => {
    const labels: Record<string, string> = {
      spell: 'conjuros',
      power: 'poderes',
      maneuver: 'maniobras',
      invocation: 'invocaciones',
    }
    return labels[entityType] ?? 'habilidades'
  }

  const getLevelLabel = (level: number): string => {
    if (level === 0) return 'Nivel 0'
    return `Nivel ${level}`
  }

  const hookCge = usePrimaryCGE()
  const primaryCGE = propsCge ?? hookCge
  const removeKnownForCGE = useCharacterStore((state) => state.removeKnownForCGE)
  const baseData = useCharacterStore((state) => state.baseData)
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
  const knownLimits = primaryCGE.knownLimits ?? []
  const cgeId = primaryCGE.id

  // Get known selections from character base data
  const knownSelections = baseData?.cgeState?.[cgeId]?.knownSelections ?? {}

  // Build known entities by level
  const getKnownByLevel = (level: number): string[] => {
    return knownSelections[String(level)] ?? []
  }

  // Count totals
  let totalKnown = 0
  let totalMax = 0
  for (const limit of knownLimits) {
    if (limit.max > 0) {
      totalKnown += limit.current
      totalMax += limit.max
    }
  }

  const handleAddKnown = (level: number) => {
    // Navigate to entity select in "known" mode
    // Format: known:level:cgeId
    const selectionId = `known:${level}:${cgeId}`
    const title = level === 0 ? 'Aprender Nivel 0' : `Aprender Nivel ${level}`
    navigateToDetail('cgeEntitySelect', selectionId, title)
  }

  const handleRemoveKnown = (entityId: string) => {
    const result = removeKnownForCGE(cgeId, entityId)
    if (!result.success) {
      console.warn('Failed to remove known entity:', result.error)
    }
  }

  // If no known limits, show message
  if (knownLimits.length === 0) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding={16}>
        <Text color="$placeholderColor" textAlign="center">
          Esta clase no tiene limite de {entityTypeLabel} conocidos.
        </Text>
      </YStack>
    )
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
          {totalKnown} / {totalMax} {entityTypeLabel} conocidos
        </Text>
      </XStack>

      {/* Known entities by level */}
      <YStack>
        {knownLimits.map((limit) => {
          if (limit.max === 0) return null

          const levelLabel = getLevelLabel(limit.level)
          const knownEntityIds = getKnownByLevel(limit.level)
          const emptySlots = limit.max - knownEntityIds.length
          const canAddMore = emptySlots > 0

          return (
            <YStack key={limit.level}>
              <LevelHeader
                label={levelLabel}
                count={`${knownEntityIds.length}/${limit.max}`}
              />

              {/* Known entities */}
              {knownEntityIds.map((entityId, index) => {
                const entity = compendium.getEntityById(entityId)
                const displayName =
                  entity?.name ??
                  entityId
                    .replace(/-/g, ' ')
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (l: string) => l.toUpperCase())
                const isLastItem = index === knownEntityIds.length - 1 && !canAddMore

                return (
                  <EntityRow
                    key={entityId}
                    name={displayName}
                    image={entity?.image}
                    isLast={isLastItem}
                    onPress={() =>
                      navigateToDetail('compendiumEntity', entityId, displayName)
                    }
                    rightElement={
                      <Pressable onPress={() => handleRemoveKnown(entityId)} hitSlop={8}>
                        {({ pressed }) => (
                          <Text fontSize={11} color="$colorFocus" opacity={pressed ? 0.6 : 1}>
                            Olvidar
                          </Text>
                        )}
                      </Pressable>
                    }
                  />
                )
              })}

              {/* Empty slots for adding */}
              {canAddMore && (
                <EmptySlotRow
                  isLast={true}
                  label="Aprender..."
                  onPress={() => handleAddKnown(limit.level)}
                />
              )}
            </YStack>
          )
        })}
      </YStack>

      {/* Info */}
      <Text
        fontSize={11}
        color="$placeholderColor"
        lineHeight={16}
        paddingTop={10}
        paddingHorizontal={16}
      >
        Selecciona los {entityTypeLabel} que conoces en cada nivel.
      </Text>
    </ScrollView>
  )
}
