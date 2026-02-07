import type { StandardEntity } from '@zukus/core'

export type EnrichedItem = StandardEntity & {
  image?: string
  weight?: number
  cost?: { amount: number; currency: string }
  itemSlot?: string
  tags?: string[]
}

export function formatCost(cost?: { amount: number; currency: string }): string | null {
  if (!cost) return null
  return `${cost.amount} ${cost.currency}`
}

export function getAllItems(
  compendium: { getAllEntities: (type: string) => unknown[] },
  entityTypes: string[]
): EnrichedItem[] {
  const items: EnrichedItem[] = []
  for (const entityType of entityTypes) {
    const entities = compendium.getAllEntities(entityType) as EnrichedItem[]
    for (const entity of entities) {
      items.push(entity)
    }
  }
  return items
}

export function getInitialFilterOverrides(
  defaultEntityTypes?: string[]
): { entityType: string[] } | undefined {
  if (defaultEntityTypes && defaultEntityTypes.length > 0) {
    return { entityType: defaultEntityTypes }
  }
  return undefined
}
