// =============================================================================
// API Client for Entity Management
// =============================================================================

import type { EntitySchemaDefinition } from '@root/core/domain/entities/types/schema'
import type { Entity } from '@root/core/domain/entities/types/base'

const API_BASE = 'http://localhost:3001/api'

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

export type EntityInstance = Entity & Record<string, unknown> & { name: string }

// Re-export types for convenience
export type { EntitySchemaDefinition, Entity }

// =============================================================================
// Generic fetch wrapper
// =============================================================================

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const result = await response.json() as ApiResponse<T>

  if (!result.success) {
    throw new Error(result.error ?? 'Unknown error')
  }

  return result.data as T
}

// =============================================================================
// Entity Types (Schemas) API
// =============================================================================

export const entityTypesApi = {
  getAll: async (): Promise<EntitySchemaDefinition[]> => {
    return apiFetch<EntitySchemaDefinition[]>('/entity-types')
  },

  get: async (typeName: string): Promise<EntitySchemaDefinition> => {
    return apiFetch<EntitySchemaDefinition>(`/entity-types/${typeName}`)
  },

  create: async (schema: EntitySchemaDefinition): Promise<EntitySchemaDefinition> => {
    return apiFetch<EntitySchemaDefinition>('/entity-types', {
      method: 'POST',
      body: JSON.stringify(schema),
    })
  },

  update: async (typeName: string, schema: EntitySchemaDefinition): Promise<EntitySchemaDefinition> => {
    return apiFetch<EntitySchemaDefinition>(`/entity-types/${typeName}`, {
      method: 'PUT',
      body: JSON.stringify(schema),
    })
  },

  delete: async (typeName: string): Promise<void> => {
    await apiFetch<{ deleted: boolean }>(`/entity-types/${typeName}`, {
      method: 'DELETE',
    })
  },
}

// =============================================================================
// Entities API
// =============================================================================

export const entitiesApi = {
  getAll: async (typeName: string): Promise<EntityInstance[]> => {
    return apiFetch<EntityInstance[]>(`/entities/${typeName}`)
  },

  get: async (typeName: string, entityId: string): Promise<EntityInstance> => {
    return apiFetch<EntityInstance>(`/entities/${typeName}/${entityId}`)
  },

  create: async (typeName: string, entity: EntityInstance): Promise<EntityInstance> => {
    return apiFetch<EntityInstance>(`/entities/${typeName}`, {
      method: 'POST',
      body: JSON.stringify(entity),
    })
  },

  update: async (typeName: string, entityId: string, entity: EntityInstance): Promise<EntityInstance> => {
    return apiFetch<EntityInstance>(`/entities/${typeName}/${entityId}`, {
      method: 'PUT',
      body: JSON.stringify(entity),
    })
  },

  delete: async (typeName: string, entityId: string): Promise<void> => {
    await apiFetch<{ deleted: boolean }>(`/entities/${typeName}/${entityId}`, {
      method: 'DELETE',
    })
  },
}

// =============================================================================
// Image Library API
// =============================================================================

export type ImageInfo = {
  id: string
  name: string
  category: string
  path: string
}

export type ImageCategory = {
  name: string
  subcategories: string[]
  imageCount: number
}

export type SemanticSearchResult = {
  path: string
  score: number
  category: string
}

export type SemanticSearchResponse = {
  query: string
  top_k: number
  results: SemanticSearchResult[]
}

export const imagesApi = {
  getCategories: async (): Promise<ImageCategory[]> => {
    return apiFetch<ImageCategory[]>('/images/categories')
  },

  getAll: async (): Promise<ImageInfo[]> => {
    return apiFetch<ImageInfo[]>('/images')
  },

  getByCategory: async (category: string): Promise<ImageInfo[]> => {
    return apiFetch<ImageInfo[]>(`/images/${category}`)
  },

  semanticSearch: async (
    query: string, 
    topK: number = 20, 
    category?: string
  ): Promise<SemanticSearchResponse> => {
    const params = new URLSearchParams({
      q: query,
      top_k: topK.toString(),
    })
    if (category) {
      params.set('category', category)
    }
    return apiFetch<SemanticSearchResponse>(`/images/search?${params.toString()}`)
  },

  getImageUrl: (imagePath: string): string => {
    return `http://localhost:3001/assets/icons/${imagePath}`
  },
}
