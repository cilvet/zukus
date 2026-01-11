// =============================================================================
// Server Types
// =============================================================================

/**
 * Entity field definition for schema
 */
export type EntityFieldDefinition = {
  name: string
  type: 'string' | 'integer' | 'boolean' | 'string_array' | 'integer_array' | 'reference' | 'object' | 'object_array'
  description?: string
  optional?: boolean
  allowedValues?: (string | number)[]
  referenceType?: string
  fields?: EntityFieldDefinition[]
  requireNonEmpty?: boolean
}

/**
 * Schema definition for entity types
 */
export type EntitySchemaDefinition = {
  typeName: string
  description?: string
  fields: EntityFieldDefinition[]
  addons?: string[]
}

/**
 * Base entity type
 */
export type Entity = {
  id: string
  entityType: string
  name: string
  description?: string
  [key: string]: unknown
}

/**
 * API response wrapper
 */
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

