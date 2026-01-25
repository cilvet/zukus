import { create } from 'zustand'

export type EditPanelState = {
  id: string
  type: string
  name?: string
}

type EditPanelStore = {
  history: EditPanelState[]
  initialized: boolean
  initialize: (history: EditPanelState[]) => void
  setHistory: (history: EditPanelState[]) => void
  pushPanel: (panel: EditPanelState) => void
  popPanel: () => void
  clearHistory: () => void
}

/**
 * Store global para el estado del Side Panel en la pantalla de edición.
 * Separado del panelStore de CharacterScreen para evitar conflictos.
 */
export const useEditPanelStore = create<EditPanelStore>((set) => ({
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
