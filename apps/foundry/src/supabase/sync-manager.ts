import type { CharacterBaseData } from '@zukus/core'
import { saveCharacter, subscribeToCharacter } from './character-repository'
import { isLoggedIn } from './auth'

/**
 * Unique device ID for this session.
 * Used to ignore echoes of our own changes from Supabase Realtime.
 */
const DEVICE_ID = `foundry-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

type SyncState = {
  actorId: string
  zukusCharacterId: string
  unsubscribe: () => void
  saveInProgress: boolean
  pendingData: CharacterBaseData | null
}

// Global map of active syncs
const activeSyncs: Map<string, SyncState> = new Map()

/**
 * Get the device ID for this Foundry session.
 */
export function getDeviceId(): string {
  return DEVICE_ID
}

/**
 * Start syncing an actor with its linked Zukus character.
 * @param actorId - Foundry actor ID
 * @param zukusCharacterId - Supabase character ID
 * @param onRemoteChange - Callback when remote data changes
 */
export function startSync(
  actorId: string,
  zukusCharacterId: string,
  onRemoteChange: (data: CharacterBaseData) => void
): void {
  // Check if already syncing
  if (activeSyncs.has(actorId)) {
    console.log(`[Zukus Sync] Already syncing actor ${actorId}`)
    return
  }

  if (!isLoggedIn()) {
    console.log('[Zukus Sync] Not logged in, skipping sync')
    return
  }

  console.log(`[Zukus Sync] Starting sync for actor ${actorId} -> character ${zukusCharacterId}`)

  // Subscribe to remote changes
  const unsubscribe = subscribeToCharacter(zukusCharacterId, (data, deviceId) => {
    console.log(`[Zukus Sync] Received change, deviceId: ${deviceId}, our deviceId: ${DEVICE_ID}`)

    // Ignore our own echoes
    if (deviceId === DEVICE_ID) {
      console.log('[Zukus Sync] Ignoring echo of our own change')
      return
    }

    // Check if still syncing (might have stopped)
    if (!activeSyncs.has(actorId)) {
      console.log('[Zukus Sync] Sync stopped, ignoring remote change')
      return
    }

    // Apply remote change
    console.log('[Zukus Sync] Applying remote change')
    onRemoteChange(data)
  })

  // Store sync state
  activeSyncs.set(actorId, {
    actorId,
    zukusCharacterId,
    unsubscribe,
    saveInProgress: false,
    pendingData: null,
  })
}

/**
 * Stop syncing an actor.
 */
export function stopSync(actorId: string): void {
  const syncState = activeSyncs.get(actorId)
  if (!syncState) {
    return
  }

  console.log(`[Zukus Sync] Stopping sync for actor ${actorId}`)

  syncState.unsubscribe()
  activeSyncs.delete(actorId)
}

/**
 * Push local changes to Supabase.
 * Uses a queue to serialize saves and avoid race conditions.
 */
export async function pushLocalChanges(actorId: string, data: CharacterBaseData): Promise<void> {
  const syncState = activeSyncs.get(actorId)
  if (!syncState) {
    console.log(`[Zukus Sync] No active sync for actor ${actorId}, skipping push`)
    return
  }

  if (!isLoggedIn()) {
    console.log('[Zukus Sync] Not logged in, skipping push')
    return
  }

  // Queue the data
  syncState.pendingData = data

  // Process queue
  await processQueue(syncState)
}

/**
 * Process the save queue for a sync state.
 */
async function processQueue(syncState: SyncState): Promise<void> {
  if (syncState.saveInProgress) {
    return
  }

  const data = syncState.pendingData
  if (!data) {
    return
  }

  syncState.pendingData = null
  syncState.saveInProgress = true

  const saveStart = performance.now()
  console.log(`[Zukus Sync] Saving to Supabase with deviceId: ${DEVICE_ID}`)

  try {
    await saveCharacter(syncState.zukusCharacterId, data, DEVICE_ID)
    console.log(`[Zukus Sync] Saved OK (${(performance.now() - saveStart).toFixed(1)}ms)`)
  } catch (err) {
    console.error('[Zukus Sync] Error saving:', err)
    ui.notifications?.error('Failed to sync character to Zukus')
  }

  syncState.saveInProgress = false

  // Process next queued item if any
  if (syncState.pendingData) {
    await processQueue(syncState)
  }
}

/**
 * Check if an actor is currently syncing.
 */
export function isSyncing(actorId: string): boolean {
  return activeSyncs.has(actorId)
}

/**
 * Get the sync state for an actor (for debugging).
 */
export function getSyncState(actorId: string): SyncState | undefined {
  return activeSyncs.get(actorId)
}
