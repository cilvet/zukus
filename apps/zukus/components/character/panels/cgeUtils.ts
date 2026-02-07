import type { CalculatedCGE } from '@zukus/core'

export type SelectionMode = 'prepare' | 'known'

export type ParsedSelection = {
  mode: SelectionMode
  level: number
  cgeId: string
  // Only for prepare mode
  slotIndex?: number
  trackId?: string
}

/**
 * Parse selectionId to determine mode and extract params.
 */
export function parseSelectionId(selectionId: string, fallbackCgeId: string): ParsedSelection {
  const parts = selectionId.split(':')

  // Known mode: "known:level:cgeId"
  if (parts[0] === 'known') {
    return {
      mode: 'known',
      level: parseInt(parts[1] ?? '0', 10),
      cgeId: parts[2] ?? fallbackCgeId,
    }
  }

  // Prepare mode: "level:slotIndex:cgeId:trackId"
  return {
    mode: 'prepare',
    level: parseInt(parts[0] ?? '0', 10),
    slotIndex: parseInt(parts[1] ?? '0', 10),
    cgeId: parts[2] ?? fallbackCgeId,
    trackId: parts[3] ?? 'base',
  }
}

/**
 * Calculate progress for CGE slots at a given level.
 */
export function calculateSlotProgress(cge: CalculatedCGE | null, level: number): { current: number; max: number } {
  if (!cge) return { current: 0, max: 0 }

  const primaryTrack = cge.tracks[0]
  if (!primaryTrack) return { current: 0, max: 0 }

  const slots = primaryTrack.slots ?? []

  // For LIMITED_TOTAL mode (level -1), count all slots
  if (level < 0) {
    let current = 0
    let max = 0
    for (const slot of slots) {
      if (slot.boundSlots) {
        max += slot.max
        current += slot.boundSlots.filter((s) => s.preparedEntityId).length
      }
    }
    return { current, max }
  }

  // For specific level
  const slot = slots.find((s) => s.level === level)
  if (!slot || !slot.boundSlots) return { current: 0, max: 0 }

  const current = slot.boundSlots.filter((s) => s.preparedEntityId).length
  return { current, max: slot.max }
}

/**
 * Find the next empty slot index for a given level.
 * Returns -1 if no empty slots available.
 */
export function findNextEmptySlotIndex(cge: CalculatedCGE | null, level: number): number {
  if (!cge) return -1

  const primaryTrack = cge.tracks[0]
  if (!primaryTrack) return -1

  const slots = primaryTrack.slots ?? []
  const slot = slots.find((s) => s.level === level)
  if (!slot || !slot.boundSlots) return -1

  const emptySlot = slot.boundSlots.find((bs) => !bs.preparedEntityId)
  return emptySlot ? emptySlot.index : -1
}

