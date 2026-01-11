import { mkdir, readFile, writeFile, readdir, unlink, rm } from 'fs/promises'
import { join } from 'path'
import type { EntitySchemaDefinition, Entity } from './types'

// =============================================================================
// Storage Configuration
// =============================================================================

const DATA_DIR = join(import.meta.dir, 'data')
const SCHEMAS_DIR = join(DATA_DIR, 'schemas')
const ENTITIES_DIR = join(DATA_DIR, 'entities')

// =============================================================================
// Initialization
// =============================================================================

export async function initializeStorage(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await mkdir(SCHEMAS_DIR, { recursive: true })
  await mkdir(ENTITIES_DIR, { recursive: true })
}

// =============================================================================
// Schema Operations
// =============================================================================

function getSchemaPath(typeName: string): string {
  return join(SCHEMAS_DIR, `${typeName}.json`)
}

export async function getAllSchemas(): Promise<EntitySchemaDefinition[]> {
  const files = await readdir(SCHEMAS_DIR)
  const jsonFiles = files.filter(f => f.endsWith('.json'))
  
  const schemas: EntitySchemaDefinition[] = []
  for (const file of jsonFiles) {
    const content = await readFile(join(SCHEMAS_DIR, file), 'utf-8')
    schemas.push(JSON.parse(content))
  }
  
  return schemas
}

export async function getSchema(typeName: string): Promise<EntitySchemaDefinition | null> {
  try {
    const content = await readFile(getSchemaPath(typeName), 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

export async function saveSchema(schema: EntitySchemaDefinition): Promise<void> {
  await writeFile(getSchemaPath(schema.typeName), JSON.stringify(schema, null, 2))
  // Ensure entity directory exists for this type
  await mkdir(getEntityTypeDir(schema.typeName), { recursive: true })
}

export async function deleteSchema(typeName: string): Promise<boolean> {
  try {
    await unlink(getSchemaPath(typeName))
    // Also delete all entities of this type
    const entityDir = getEntityTypeDir(typeName)
    try {
      await rm(entityDir, { recursive: true })
    } catch {
      // Directory might not exist, that's ok
    }
    return true
  } catch {
    return false
  }
}

export async function renameSchema(oldTypeName: string, newTypeName: string): Promise<void> {
  const schema = await getSchema(oldTypeName)
  if (!schema) {
    throw new Error(`Schema ${oldTypeName} not found`)
  }
  
  // Update schema with new typeName
  schema.typeName = newTypeName
  await saveSchema(schema)
  
  // Delete old schema file
  await unlink(getSchemaPath(oldTypeName))
  
  // Move entities to new directory
  const oldEntityDir = getEntityTypeDir(oldTypeName)
  const newEntityDir = getEntityTypeDir(newTypeName)
  
  try {
    const entities = await getAllEntities(oldTypeName)
    for (const entity of entities) {
      entity.entityType = newTypeName
      await saveEntity(newTypeName, entity)
    }
    await rm(oldEntityDir, { recursive: true })
  } catch {
    // Old directory might not exist
  }
}

// =============================================================================
// Entity Operations
// =============================================================================

function getEntityTypeDir(typeName: string): string {
  return join(ENTITIES_DIR, typeName)
}

function getEntityPath(typeName: string, entityId: string): string {
  return join(getEntityTypeDir(typeName), `${entityId}.json`)
}

export async function getAllEntities(typeName: string): Promise<Entity[]> {
  const typeDir = getEntityTypeDir(typeName)
  
  try {
    await mkdir(typeDir, { recursive: true })
    const files = await readdir(typeDir)
    const jsonFiles = files.filter(f => f.endsWith('.json'))
    
    const entities: Entity[] = []
    for (const file of jsonFiles) {
      const content = await readFile(join(typeDir, file), 'utf-8')
      entities.push(JSON.parse(content))
    }
    
    return entities
  } catch {
    return []
  }
}

export async function getEntity(typeName: string, entityId: string): Promise<Entity | null> {
  try {
    const content = await readFile(getEntityPath(typeName, entityId), 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

export async function saveEntity(typeName: string, entity: Entity): Promise<void> {
  await mkdir(getEntityTypeDir(typeName), { recursive: true })
  await writeFile(getEntityPath(typeName, entity.id), JSON.stringify(entity, null, 2))
}

export async function deleteEntity(typeName: string, entityId: string): Promise<boolean> {
  try {
    await unlink(getEntityPath(typeName, entityId))
    return true
  } catch {
    return false
  }
}

