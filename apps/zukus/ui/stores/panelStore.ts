import { create } from 'zustand'

export type PanelState = {
  id: string
  type: string
  name?: string
}

export type PanelNavigationResult = {
  currentPanel: PanelState | null
  isPanelOpen: boolean
  canGoBack: boolean
  openPanel: (id: string, type: string, name?: string) => void
  closePanel: () => void
  goBack: () => void
}

type PanelStore = {
  history: PanelState[]
  initialized: boolean
  initialize: (history: PanelState[]) => void
  setHistory: (history: PanelState[]) => void
  pushPanel: (panel: PanelState) => void
  popPanel: () => void
  clearHistory: () => void
}

/**
 * Store global para el estado del Side Panel en desktop.
 * Permite que múltiples componentes compartan el mismo estado.
 */
export const usePanelStore = create<PanelStore>((set) => ({
  history: [],
  initialized: false,
  
  initialize: (history) => set({ history, initialized: true }),
  
  setHistory: (history) => set({ history }),
  
  pushPanel: (panel) => set((state) => ({
    history: [...state.history, panel],
  })),
  
  popPanel: () => set((state) => ({
    history: state.history.slice(0, -1),
  })),
  
  clearHistory: () => set({ history: [] }),
}))
