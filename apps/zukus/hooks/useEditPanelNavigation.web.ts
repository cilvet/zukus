import { useEffect } from 'react'
import { useEditPanelStore, type EditPanelState } from '../ui/stores/editPanelStore'
import type { PanelNavigationResult } from './usePanelNavigation.types'

type HistoryState = {
  editPanelIndex: number
  editPanelHistory: EditPanelState[]
}

function parseUrlParams(): EditPanelState | null {
  const params = new URLSearchParams(window.location.search)
  const panelId = params.get('panel')
  const panelType = params.get('type')
  const panelName = params.get('name')

  if (!panelId || !panelType) {
    return null
  }

  return { id: panelId, type: panelType, name: panelName || undefined }
}

function createPanelUrl(panel: EditPanelState | null): string {
  const basePath = window.location.pathname

  if (!panel) {
    return basePath
  }

  const params = new URLSearchParams()
  params.set('panel', panel.id)
  params.set('type', panel.type)
  if (panel.name) {
    params.set('name', panel.name)
  }
  return `${basePath}?${params.toString()}`
}

/**
 * Hook para manejar la navegación del Side Panel en la pantalla de edición (desktop web).
 *
 * Usa un store separado del panelStore de CharacterScreen.
 */
export function useEditPanelNavigation(): PanelNavigationResult {
  const history = useEditPanelStore((state) => state.history)
  const initialized = useEditPanelStore((state) => state.initialized)
  const initialize = useEditPanelStore((state) => state.initialize)
  const setHistory = useEditPanelStore((state) => state.setHistory)
  const pushPanel = useEditPanelStore((state) => state.pushPanel)
  const clearHistory = useEditPanelStore((state) => state.clearHistory)

  // Inicializar desde URL solo una vez (controlado por el store)
  useEffect(() => {
    if (initialized) return

    const initial = parseUrlParams()
    initialize(initial ? [initial] : [])
  }, [initialized, initialize])

  // Escuchar navegación del browser (back/forward)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as HistoryState | null
      if (state?.editPanelHistory) {
        setHistory(state.editPanelHistory)
        return
      }
      const panel = parseUrlParams()
      setHistory(panel ? [panel] : [])
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [setHistory])

  const currentPanel = history.length > 0 ? history[history.length - 1] : null
  const isPanelOpen = currentPanel !== null
  const canGoBack = history.length > 1

  const openPanel = (id: string, type: string, name?: string) => {
    const newPanel: EditPanelState = { id, type, name }
    const currentHistory = useEditPanelStore.getState().history
    const newHistory = [...currentHistory, newPanel]

    const historyState: HistoryState = {
      editPanelIndex: newHistory.length - 1,
      editPanelHistory: newHistory,
    }
    window.history.pushState(historyState, '', createPanelUrl(newPanel))

    pushPanel(newPanel)
  }

  const closePanel = () => {
    const historyState: HistoryState = {
      editPanelIndex: -1,
      editPanelHistory: [],
    }
    window.history.pushState(historyState, '', createPanelUrl(null))

    clearHistory()
  }

  const goBack = () => {
    const currentHistory = useEditPanelStore.getState().history
    if (currentHistory.length <= 1) {
      return
    }

    const newHistory = currentHistory.slice(0, -1)
    const previousPanel = newHistory[newHistory.length - 1]

    const historyState: HistoryState = {
      editPanelIndex: newHistory.length - 1,
      editPanelHistory: newHistory,
    }
    window.history.pushState(historyState, '', createPanelUrl(previousPanel))

    setHistory(newHistory)
  }

  return {
    currentPanel,
    isPanelOpen,
    canGoBack,
    openPanel,
    closePanel,
    goBack,
  }
}
