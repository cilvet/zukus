import type { EntitySchemaDefinition, Entity, ApiResponse } from './types'
import {
  initializeStorage,
  getAllSchemas,
  getSchema,
  saveSchema,
  deleteSchema,
  renameSchema,
  getAllEntities,
  getEntity,
  saveEntity,
  deleteEntity,
} from './storage'
import { join } from 'path'

// =============================================================================
// Assets Configuration
// =============================================================================

const ASSETS_DIR = join(import.meta.dir, 'assets')
const ICONS_DIR = join(ASSETS_DIR, 'icons')

// =============================================================================
// Configuration
// =============================================================================

const PORT = 3001
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// =============================================================================
// Helpers
// =============================================================================

function jsonResponse<T>(data: ApiResponse<T>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  })
}

function successResponse<T>(data: T): Response {
  return jsonResponse({ success: true, data })
}

function errorResponse(error: string, status = 400): Response {
  return jsonResponse({ success: false, error }, status)
}

function corsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

// =============================================================================
// Image Library Types
// =============================================================================

type ImageInfo = {
  id: string;          // Path relative to icons dir (e.g., "SkillsIcons/Skillicons/fire.png")
  name: string;        // File name without extension
  category: string;    // Top-level folder (e.g., "SkillsIcons")
  path: string;        // Full relative path for URL
}

type ImageCategory = {
  name: string;
  subcategories: string[];
  imageCount: number;
}

// =============================================================================
// Image Library Helpers
// =============================================================================

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

function getMimeType(filePath: string): string {
  const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase()
  return MIME_TYPES[ext] || 'application/octet-stream'
}

async function getImagesInDirectory(dir: string, basePath: string = ''): Promise<ImageInfo[]> {
  const images: ImageInfo[] = []
  
  try {
    const entries = await Array.fromAsync(new Bun.Glob('**/*.{png,jpg,jpeg,gif,webp,svg}').scan({ cwd: dir }))
    
    for (const entry of entries) {
      const fullPath = basePath ? `${basePath}/${entry}` : entry
      const parts = entry.split('/')
      const fileName = parts[parts.length - 1]
      const name = fileName.substring(0, fileName.lastIndexOf('.'))
      const category = parts[0] || 'root'
      
      images.push({
        id: fullPath,
        name,
        category,
        path: fullPath,
      })
    }
  } catch (e) {
    console.error('Error scanning images directory:', e)
  }
  
  return images
}

async function getImageCategories(): Promise<ImageCategory[]> {
  const categories: Map<string, ImageCategory> = new Map()
  
  try {
    const entries = await Array.fromAsync(new Bun.Glob('*').scan({ cwd: ICONS_DIR, onlyFiles: false }))
    
    for (const entry of entries) {
      const categoryPath = join(ICONS_DIR, entry)
      const stat = await Bun.file(categoryPath).exists()
      
      // Check if it's a directory by trying to scan it
      try {
        const subEntries = await Array.fromAsync(new Bun.Glob('*').scan({ cwd: categoryPath, onlyFiles: false }))
        const imageCount = (await Array.fromAsync(new Bun.Glob('**/*.{png,jpg,jpeg,gif,webp,svg}').scan({ cwd: categoryPath }))).length
        
        const subcategories = subEntries.filter(sub => {
          // Simple check - if it doesn't have an extension, it's probably a folder
          return !sub.includes('.')
        })
        
        categories.set(entry, {
          name: entry,
          subcategories,
          imageCount,
        })
      } catch {
        // Not a directory, skip
      }
    }
  } catch (e) {
    console.error('Error getting image categories:', e)
  }
  
  return Array.from(categories.values())
}

// =============================================================================
// Route Handlers
// =============================================================================

// Entity Types (Schemas)
async function handleGetSchemas(): Promise<Response> {
  const schemas = await getAllSchemas()
  return successResponse(schemas)
}

async function handleGetSchema(typeName: string): Promise<Response> {
  const schema = await getSchema(typeName)
  if (!schema) {
    return errorResponse(`Schema '${typeName}' not found`, 404)
  }
  return successResponse(schema)
}

async function handleCreateSchema(request: Request): Promise<Response> {
  try {
    const schema = await request.json() as EntitySchemaDefinition
    
    if (!schema.typeName) {
      return errorResponse('typeName is required')
    }
    
    const existing = await getSchema(schema.typeName)
    if (existing) {
      return errorResponse(`Schema '${schema.typeName}' already exists`)
    }
    
    await saveSchema(schema)
    return successResponse(schema)
  } catch (e) {
    return errorResponse(`Invalid request: ${e}`)
  }
}

async function handleUpdateSchema(typeName: string, request: Request): Promise<Response> {
  try {
    const schema = await request.json() as EntitySchemaDefinition
    
    const existing = await getSchema(typeName)
    if (!existing) {
      return errorResponse(`Schema '${typeName}' not found`, 404)
    }
    
    // If typeName changed, handle rename
    if (schema.typeName !== typeName) {
      await renameSchema(typeName, schema.typeName)
    } else {
      await saveSchema(schema)
    }
    
    return successResponse(schema)
  } catch (e) {
    return errorResponse(`Invalid request: ${e}`)
  }
}

async function handleDeleteSchema(typeName: string): Promise<Response> {
  const deleted = await deleteSchema(typeName)
  if (!deleted) {
    return errorResponse(`Schema '${typeName}' not found`, 404)
  }
  return successResponse({ deleted: true })
}

// Entities
async function handleGetEntities(typeName: string): Promise<Response> {
  const schema = await getSchema(typeName)
  if (!schema) {
    return errorResponse(`Schema '${typeName}' not found`, 404)
  }
  
  const entities = await getAllEntities(typeName)
  return successResponse(entities)
}

async function handleGetEntity(typeName: string, entityId: string): Promise<Response> {
  const entity = await getEntity(typeName, entityId)
  if (!entity) {
    return errorResponse(`Entity '${entityId}' not found in '${typeName}'`, 404)
  }
  return successResponse(entity)
}

async function handleCreateEntity(typeName: string, request: Request): Promise<Response> {
  try {
    const schema = await getSchema(typeName)
    if (!schema) {
      return errorResponse(`Schema '${typeName}' not found`, 404)
    }
    
    const entity = await request.json() as Entity
    
    if (!entity.id) {
      return errorResponse('id is required')
    }
    
    const existing = await getEntity(typeName, entity.id)
    if (existing) {
      return errorResponse(`Entity '${entity.id}' already exists in '${typeName}'`)
    }
    
    // Ensure entityType is set
    entity.entityType = typeName
    
    await saveEntity(typeName, entity)
    return successResponse(entity)
  } catch (e) {
    return errorResponse(`Invalid request: ${e}`)
  }
}

async function handleUpdateEntity(typeName: string, entityId: string, request: Request): Promise<Response> {
  try {
    const existing = await getEntity(typeName, entityId)
    if (!existing) {
      return errorResponse(`Entity '${entityId}' not found in '${typeName}'`, 404)
    }
    
    const entity = await request.json() as Entity
    
    // Handle ID change
    if (entity.id !== entityId) {
      await deleteEntity(typeName, entityId)
    }
    
    // Ensure entityType is set
    entity.entityType = typeName
    
    await saveEntity(typeName, entity)
    return successResponse(entity)
  } catch (e) {
    return errorResponse(`Invalid request: ${e}`)
  }
}

async function handleDeleteEntity(typeName: string, entityId: string): Promise<Response> {
  const deleted = await deleteEntity(typeName, entityId)
  if (!deleted) {
    return errorResponse(`Entity '${entityId}' not found in '${typeName}'`, 404)
  }
  return successResponse({ deleted: true })
}

// Image Library
async function handleGetImageCategories(): Promise<Response> {
  const categories = await getImageCategories()
  return successResponse(categories)
}

async function handleGetImages(category?: string): Promise<Response> {
  const searchDir = category ? join(ICONS_DIR, category) : ICONS_DIR
  const basePath = category || ''
  const images = await getImagesInDirectory(searchDir, basePath)
  return successResponse(images)
}

async function handleServeImage(imagePath: string): Promise<Response> {
  const fullPath = join(ICONS_DIR, imagePath)
  const file = Bun.file(fullPath)
  
  const exists = await file.exists()
  if (!exists) {
    return errorResponse(`Image not found: ${imagePath}`, 404)
  }
  
  const mimeType = getMimeType(imagePath)
  
  return new Response(file, {
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=31536000',
      ...CORS_HEADERS,
    },
  })
}

// Semantic Image Search (proxy to Python CLIP server)
const CLIP_SERVER_URL = 'http://localhost:8000'

async function handleSemanticImageSearch(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    const topK = url.searchParams.get('top_k') || '20'
    const category = url.searchParams.get('category')
    
    if (!query) {
      return errorResponse('Query parameter "q" is required')
    }
    
    // Build URL for Python server
    const clipUrl = new URL('/search', CLIP_SERVER_URL)
    clipUrl.searchParams.set('q', query)
    clipUrl.searchParams.set('top_k', topK)
    if (category) {
      clipUrl.searchParams.set('category', category)
    }
    
    // Call Python CLIP server
    const response = await fetch(clipUrl.toString())
    
    if (!response.ok) {
      const error = await response.text()
      return errorResponse(`CLIP server error: ${error}`, response.status)
    }
    
    const data = await response.json()
    return successResponse(data)
    
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error'
    
    // Check if CLIP server is down
    if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('fetch failed')) {
      return errorResponse(
        'CLIP search server is not running. Start it with: cd icon-search && python3 clip_server.py',
        503
      )
    }
    
    return errorResponse(`Semantic search failed: ${errorMsg}`, 500)
  }
}

// =============================================================================
// Router
// =============================================================================

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname
  const method = request.method
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return corsResponse()
  }
  
  // Parse route
  const parts = path.split('/').filter(Boolean)
  
  // Static assets: /assets/icons/*
  if (parts[0] === 'assets' && parts[1] === 'icons') {
    const imagePath = parts.slice(2).join('/')
    return handleServeImage(imagePath)
  }
  
  // API routes
  if (parts[0] !== 'api') {
    return errorResponse('Not found', 404)
  }
  
  // /api/images - Image library endpoints
  if (parts[1] === 'images') {
    // /api/images/search - Semantic search (proxy to Python CLIP server)
    if (parts[2] === 'search') {
      if (method !== 'GET') {
        return errorResponse('Method not allowed', 405)
      }
      return handleSemanticImageSearch(request)
    }
    
    if (method !== 'GET') {
      return errorResponse('Method not allowed', 405)
    }
    
    // /api/images/categories - List categories
    if (parts[2] === 'categories') {
      return handleGetImageCategories()
    }
    
    // /api/images or /api/images/:category - List images
    const category = parts[2]
    return handleGetImages(category)
  }
  
  // /api/entity-types
  if (parts[1] === 'entity-types') {
    const typeName = parts[2]
    
    if (!typeName) {
      if (method === 'GET') return handleGetSchemas()
      if (method === 'POST') return handleCreateSchema(request)
      return errorResponse('Method not allowed', 405)
    }
    
    if (method === 'GET') return handleGetSchema(typeName)
    if (method === 'PUT') return handleUpdateSchema(typeName, request)
    if (method === 'DELETE') return handleDeleteSchema(typeName)
    return errorResponse('Method not allowed', 405)
  }
  
  // /api/entities/:typeName/:entityId
  if (parts[1] === 'entities') {
    const typeName = parts[2]
    const entityId = parts[3]
    
    if (!typeName) {
      return errorResponse('typeName is required')
    }
    
    if (!entityId) {
      if (method === 'GET') return handleGetEntities(typeName)
      if (method === 'POST') return handleCreateEntity(typeName, request)
      return errorResponse('Method not allowed', 405)
    }
    
    if (method === 'GET') return handleGetEntity(typeName, entityId)
    if (method === 'PUT') return handleUpdateEntity(typeName, entityId, request)
    if (method === 'DELETE') return handleDeleteEntity(typeName, entityId)
    return errorResponse('Method not allowed', 405)
  }
  
  return errorResponse('Not found', 404)
}

// =============================================================================
// Server
// =============================================================================

async function main() {
  await initializeStorage()
  
  const server = Bun.serve({
    port: PORT,
    fetch: handleRequest,
  })
  
  console.log(`
🚀 Entity API Server running at http://localhost:${PORT}

📚 Available endpoints:

  Entity Types (Schemas):
    GET    /api/entity-types              - List all entity types
    POST   /api/entity-types              - Create entity type
    GET    /api/entity-types/:typeName    - Get entity type
    PUT    /api/entity-types/:typeName    - Update entity type
    DELETE /api/entity-types/:typeName    - Delete entity type

  Entities:
    GET    /api/entities/:typeName        - List all entities of type
    POST   /api/entities/:typeName        - Create entity
    GET    /api/entities/:typeName/:id    - Get entity
    PUT    /api/entities/:typeName/:id    - Update entity
    DELETE /api/entities/:typeName/:id    - Delete entity

  🖼️  Image Library:
    GET    /api/images                    - List all images
    GET    /api/images/categories         - List image categories
    GET    /api/images/:category          - List images in category
    GET    /api/images/search?q=...       - Semantic search (requires Python CLIP server)
    GET    /assets/icons/:path            - Serve image file
`)
}

main()

