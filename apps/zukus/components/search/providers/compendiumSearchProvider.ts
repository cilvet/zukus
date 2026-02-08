import type { StandardEntity } from '@zukus/core'
import type { SearchProvider, SearchResult } from '../types'
import { scoreMatch } from '../scoring'

const ENTITY_TYPE_LABELS: Record<string, string> = {
  spell: 'Conjuro',
  feat: 'Dote',
  buff: 'Buff',
  class: 'Clase',
  classFeature: 'Rasgo de Clase',
  item: 'Objeto',
  maneuver: 'Maniobra',
}

function getCategoryLabel(entityType: string): string {
  return ENTITY_TYPE_LABELS[entityType] ?? entityType
}

const MAX_RESULTS = 50

export function createCompendiumSearchProvider(
  entities: StandardEntity[],
): SearchProvider {
  return {
    id: 'compendium',
    search(query: string): SearchResult[] {
      if (!query.trim()) return []

      const results: SearchResult[] = []

      for (const entity of entities) {
        const score = scoreMatch(query, entity.name, entity.description, entity.tags)
        if (score === 0) continue

        results.push({
          id: entity.id,
          title: entity.name,
          description: entity.description,
          image: entity.image,
          category: getCategoryLabel(entity.entityType),
          categoryKey: entity.entityType,
          score,
          data: entity,
        })
      }

      results.sort((a, b) => b.score - a.score)

      return results.slice(0, MAX_RESULTS)
    },
  }
}
