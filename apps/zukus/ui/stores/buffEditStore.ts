import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { Buff } from '@zukus/core'
import { useCharacterStore } from './characterStore'

type AnyChange = NonNullable<Buff['changes']>[number]

type BuffEditState = {
  draftBuff: Buff | null
  originalBuffId: string | null
  isNew: boolean
}

type BuffEditActions = {
  startEditing: (buff: Buff, isNew?: boolean) => void
  updateDraft: (changes: Partial<Buff>) => void
  updateChange: (index: number, change: AnyChange) => void
  addChange: (change: AnyChange) => void
  deleteChange: (index: number) => void
  save: () => boolean
  discard: () => void
}

type BuffEditStore = BuffEditState & BuffEditActions

export const useBuffEditStore = create<BuffEditStore>((set, get) => ({
  // State
  draftBuff: null,
  originalBuffId: null,
  isNew: false,

  // =============================================================================
  // Iniciar edicion
  // =============================================================================

  startEditing: (buff: Buff, isNew = false) => {
    set({
      draftBuff: { ...buff },
      originalBuffId: buff.uniqueId,
      isNew,
    })
  },

  // =============================================================================
  // Actualizar draft (name, description, etc.)
  // =============================================================================

  updateDraft: (changes: Partial<Buff>) => {
    const { draftBuff } = get()
    if (!draftBuff) return

    set({
      draftBuff: { ...draftBuff, ...changes },
    })
  },

  // =============================================================================
  // Gestion de changes
  // =============================================================================

  updateChange: (index: number, change: AnyChange) => {
    const { draftBuff } = get()
    if (!draftBuff) return

    const newChanges = [...(draftBuff.changes ?? [])]
    newChanges[index] = change

    set({
      draftBuff: { ...draftBuff, changes: newChanges },
    })
  },

  addChange: (change: AnyChange) => {
    const { draftBuff } = get()
    if (!draftBuff) return

    const newChanges = [...(draftBuff.changes ?? []), change]

    set({
      draftBuff: { ...draftBuff, changes: newChanges },
    })
  },

  deleteChange: (index: number) => {
    const { draftBuff } = get()
    if (!draftBuff) return

    const newChanges = [...(draftBuff.changes ?? [])]
    newChanges.splice(index, 1)

    set({
      draftBuff: { ...draftBuff, changes: newChanges },
    })
  },

  // =============================================================================
  // Persistir al characterStore
  // =============================================================================

  save: () => {
    const { draftBuff, isNew } = get()
    if (!draftBuff) return false

    const characterStore = useCharacterStore.getState()

    let result
    if (isNew) {
      result = characterStore.addBuff(draftBuff)
    } else {
      result = characterStore.editBuff(draftBuff)
    }

    if (result.success) {
      set({ draftBuff: null, originalBuffId: null, isNew: false })
    }

    return result.success
  },

  // =============================================================================
  // Descartar cambios
  // =============================================================================

  discard: () => {
    set({ draftBuff: null, originalBuffId: null, isNew: false })
  },
}))

// =============================================================================
// Selectores
// =============================================================================

export function useDraftBuff() {
  return useBuffEditStore((state) => state.draftBuff)
}

export function useIsEditingNewBuff() {
  return useBuffEditStore((state) => state.isNew)
}

export function useBuffEditActions() {
  return useBuffEditStore(
    useShallow((state) => ({
      startEditing: state.startEditing,
      updateDraft: state.updateDraft,
      updateChange: state.updateChange,
      addChange: state.addChange,
      deleteChange: state.deleteChange,
      save: state.save,
      discard: state.discard,
    }))
  )
}
