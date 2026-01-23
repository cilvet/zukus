import { create } from 'zustand'

type VisiblePageState = {
  visiblePage: string | null
  setVisiblePage: (page: string | null) => void
}

export const useVisiblePageStore = create<VisiblePageState>((set) => ({
  visiblePage: null,
  setVisiblePage: (page) => set({ visiblePage: page }),
}))

/**
 * Hook que retorna si una página específica está visible.
 * Usa selector de Zustand para evitar re-renders innecesarios.
 *
 * @param pageKey - La key de la página (ej: 'combat', 'abilities')
 * @returns true si la página está visible
 */
export function useIsPageVisible(pageKey: string): boolean {
  return useVisiblePageStore((state) => state.visiblePage === pageKey)
}
