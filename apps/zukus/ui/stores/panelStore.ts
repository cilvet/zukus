import { create } from 'zustand'

export type PanelEntry = {
  path: string
  title?: string
}

export type PanelScope = string // 'character' | 'edit' | cualquier otro

type PanelState = {
  stacks: Record<PanelScope, PanelEntry[]>
  initialized: Record<PanelScope, boolean>
  push: (scope: PanelScope, entry: PanelEntry) => void
  pop: (scope: PanelScope) => void
  clear: (scope: PanelScope) => void
  replace: (scope: PanelScope, entries: PanelEntry[]) => void
  markInitialized: (scope: PanelScope) => void
}

/**
 * Store global para el estado de paneles.
 * Soporta múltiples scopes (cada pantalla puede tener su propio stack).
 */
export const usePanelStore = create<PanelState>((set) => ({
  stacks: {},
  initialized: {},

  push: (scope, entry) => set((state) => ({
    stacks: {
      ...state.stacks,
      [scope]: [...(state.stacks[scope] || []), entry],
    },
  })),

  pop: (scope) => set((state) => ({
    stacks: {
      ...state.stacks,
      [scope]: (state.stacks[scope] || []).slice(0, -1),
    },
  })),

  clear: (scope) => set((state) => ({
    stacks: {
      ...state.stacks,
      [scope]: [],
    },
  })),

  replace: (scope, entries) => set((state) => ({
    stacks: {
      ...state.stacks,
      [scope]: entries,
    },
  })),

  markInitialized: (scope) => set((state) => ({
    initialized: {
      ...state.initialized,
      [scope]: true,
    },
  })),
}))

// Tipos legacy para compatibilidad durante la migración
export type PanelState_Legacy = {
  id: string
  type: string
  name?: string
}

export type PanelNavigationResult = {
  currentPanel: PanelEntry | null
  isPanelOpen: boolean
  canGoBack: boolean
  openPanel: (path: string, title?: string) => void
  closePanel: () => void
  goBack: () => void
}
