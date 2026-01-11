import { generateEntityVariables } from '@root/core/domain/levels/filtering/entityVariables'
import { testEntities, type TestEntity } from '@/data/testEntities'

/**
 * Gets a sample entity for a given type to generate entity variables.
 */
export function getSampleEntityForType(entityType?: string): TestEntity | undefined {
  if (!entityType) {
    return testEntities[0]
  }
  return testEntities.find(e => e.entityType === entityType)
}

/**
 * Generates entity variables for autocomplete suggestions.
 * Returns a Record where keys are @entity.xxx paths and values are example values.
 */
export function getEntityVariablesForAutocomplete(entityType?: string): Record<string, unknown> {
  const sampleEntity = getSampleEntityForType(entityType)
  if (!sampleEntity) {
    return {}
  }
  
  const variables = generateEntityVariables(sampleEntity)
  return variables
}

/**
 * Checks if a field value is ONLY a single entity variable reference.
 * Returns the variable path (without @) if it is, null otherwise.
 * 
 * Examples:
 * - "@entity.school" -> "entity.school"
 * - "@entity.school + 1" -> null (has extra content)
 * - "school" -> null (not a variable)
 * - "@entity.school @entity.level" -> null (multiple variables)
 */
export function extractSingleEntityVariable(fieldValue: string): string | null {
  const trimmed = fieldValue.trim()
  
  if (!trimmed.startsWith('@') || trimmed.length < 2) {
    return null
  }
  
  const variablePart = trimmed.slice(1)
  
  if (!/^[a-zA-Z0-9_.]+$/.test(variablePart)) {
    return null
  }
  
  if (!variablePart.startsWith('entity.')) {
    return null
  }
  
  return variablePart
}

/**
 * Gets the property path from an entity variable path.
 * 
 * Example: "entity.school" -> "school"
 * Example: "entity.props.bonus" -> "props.bonus"
 */
export function getPropertyPathFromVariable(variablePath: string): string {
  return variablePath.replace(/^entity\./, '')
}

/**
 * Gets a value from an entity using a dot-notation path.
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }
  
  return current
}

/**
 * Extracts unique string values for a property from all entities of a given type.
 * Returns null if the property is not a string type or has too many unique values.
 */
export function getUniqueStringValuesForProperty(
  entityType: string | undefined,
  propertyPath: string
): string[] | null {
  const MAX_OPTIONS = 100
  
  const entities = entityType 
    ? testEntities.filter(e => e.entityType === entityType)
    : testEntities
  
  const values = new Set<string>()
  let allStrings = true
  
  for (const entity of entities) {
    const value = getNestedValue(entity as Record<string, unknown>, propertyPath)
    
    if (value === null || value === undefined) {
      continue
    }
    
    if (typeof value === 'string') {
      values.add(value)
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') {
          values.add(item)
        } else {
          allStrings = false
          break
        }
      }
    } else {
      allStrings = false
    }
    
    if (!allStrings) {
      break
    }
    
    if (values.size > MAX_OPTIONS) {
      return null
    }
  }
  
  if (!allStrings || values.size === 0) {
    return null
  }
  
  return Array.from(values).sort()
}

