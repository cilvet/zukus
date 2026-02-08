'use no memo'

import { YStack, XStack, Text } from 'tamagui'
import { EntitySelectionView } from '../../../../components/entitySelection'
import type { StandardEntity, EntityInstance, FilterResult } from '@zukus/core'

const ABILITY_ABBR: Record<string, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

const SIZE_LABELS: Record<string, string> = {
  FINE: 'Fine',
  DIMINUTIVE: 'Diminutive',
  TINY: 'Tiny',
  SMALL: 'Small',
  MEDIUM: 'Medium',
  LARGE: 'Large',
  HUGE: 'Huge',
  GARGANTUAN: 'Gargantuan',
  COLOSSAL: 'Colossal',
}

/**
 * Extracts a human-readable ability modifiers summary from race effects.
 * e.g. "+2 CON, -2 CHA"
 */
function getAbilityModifiersSummary(race: StandardEntity): string | null {
  const effects = (race as any).effects
  if (!effects || !Array.isArray(effects)) return null

  const parts: string[] = []
  for (const effect of effects) {
    const target = effect.target as string | undefined
    const formula = effect.formula as string | undefined
    if (!target || !formula) continue

    // Match "ability.X.score"
    const match = target.match(/^ability\.(\w+)\.score$/)
    if (!match) continue

    const abilityKey = match[1]
    const abbr = ABILITY_ABBR[abilityKey]
    if (!abbr) continue

    const value = parseInt(formula, 10)
    if (isNaN(value)) continue

    const sign = value >= 0 ? '+' : ''
    parts.push(`${sign}${value} ${abbr}`)
  }

  return parts.length > 0 ? parts.join(', ') : null
}

/**
 * Builds a description line for a race entity.
 * e.g. "+2 CON, -2 CHA | Medium | 20 ft."
 */
function getRaceMetaLine(race: StandardEntity): string {
  const parts: string[] = []

  const modifiers = getAbilityModifiersSummary(race)
  if (modifiers) {
    parts.push(modifiers)
  }

  const size = (race as any).size as string | undefined
  if (size) {
    parts.push(SIZE_LABELS[size] ?? size)
  }

  const speed = (race as any).baseLandSpeed as number | undefined
  if (speed) {
    parts.push(`${speed} ft.`)
  }

  return parts.join(' | ')
}

function getRaceBadge(race: StandardEntity): string | null {
  const la = (race as any).levelAdjustment as number | undefined
  if (la && la > 0) {
    return `LA +${la}`
  }
  return null
}

export type RaceSelectorDetailProps = {
  currentRaceId: string | null
  availableRaces: StandardEntity[]
  onSelectRace: (raceId: string) => void
}

export function RaceSelectorDetail({
  currentRaceId,
  availableRaces,
  onSelectRace,
}: RaceSelectorDetailProps) {
  const selectedEntities: EntityInstance[] = currentRaceId
    ? [{
        instanceId: `${currentRaceId}@race-selection`,
        entity: availableRaces.find((e) => e.id === currentRaceId) ?? {
          id: currentRaceId,
          entityType: 'race',
          name: currentRaceId,
          tags: [],
        },
        applicable: true,
        origin: 'custom',
      }]
    : []

  const eligibleEntities: FilterResult<StandardEntity>[] = availableRaces.map((entity) => ({
    entity,
    matches: true,
    evaluatedConditions: [],
  }))

  function handleSelect(entityId: string) {
    onSelectRace(entityId)
  }

  return (
    <YStack flex={1}>
      <EntitySelectionView
        entities={availableRaces}
        modeConfig={{
          mode: 'selection',
          selectedEntities,
          eligibleEntities,
          onSelect: handleSelect,
          onDeselect: () => {},
          min: 1,
          max: 1,
          selectionLabel: 'Raza',
          instantSelect: true,
        }}
        onEntityPress={() => {}}
        getMetaLine={getRaceMetaLine}
        getBadge={getRaceBadge}
        emptyText="No hay razas disponibles"
        resultLabelSingular="raza"
        resultLabelPlural="razas"
      />
    </YStack>
  )
}
