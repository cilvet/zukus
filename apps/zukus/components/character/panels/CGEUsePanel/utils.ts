import { Platform, ToastAndroid } from 'react-native'
import type { CalculatedBoundSlot } from '@zukus/core'

/**
 * Shows a toast notification for entity usage (Android only).
 */
export function showActionToast(actionLabel: string, entityName: string) {
  "use no memo"
  if (Platform.OS === 'android') {
    ToastAndroid.show(`${actionLabel}: ${entityName}`, ToastAndroid.SHORT)
  }
}

/**
 * Formats an entity ID into a display name when no entity data is available.
 */
export function formatEntityDisplayName(
  entityId: string,
  entity: { name?: string; image?: string } | undefined
): string {
  if (entity?.name) return entity.name
  return entityId
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase())
}

export type GroupedBoundSlots = {
  total: number
  available: number
  slots: CalculatedBoundSlot[]
}

/**
 * Groups bound slots by entityId for display.
 * Returns a map of entityId -> { total, available, slots }
 */
export function groupBoundSlotsByEntity(
  boundSlots: CalculatedBoundSlot[]
): Map<string, GroupedBoundSlots> {
  const grouped = new Map<string, GroupedBoundSlots>()

  for (const slot of boundSlots) {
    if (!slot.preparedEntityId) continue

    const existing = grouped.get(slot.preparedEntityId)
    if (existing) {
      existing.total++
      if (!slot.used) existing.available++
      existing.slots.push(slot)
    } else {
      grouped.set(slot.preparedEntityId, {
        total: 1,
        available: slot.used ? 0 : 1,
        slots: [slot],
      })
    }
  }

  return grouped
}
