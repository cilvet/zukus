import { useEffect } from 'react'
import { usePanelStore } from '../ui/stores'
import type { PanelState, PanelNavigationResult } from '../ui/stores'

type HistoryState = {
  panelIndex: number
  panelHistory: PanelState[]
}

function parseUrlParams(): PanelState | null {
  const params = new URLSearchParams(window.location.search)
  const panelId = params.get('panel')
  const panelType = params.get('type')
  const panelName = params.get('name')

  if (!panelId || !panelType) {
    return null
  }
  
  return { id: panelId, type: panelType, name: panelName || undefined }
}

function createPanelUrl(panel: PanelState | null): string {
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
 * Hook para manejar la navegación del Side Panel en desktop web.
 * 
 * Usa un store global de Zustand para que todas las instancias compartan el mismo estado.
 * La URL refleja el panel actual.
 */
export function usePanelNavigation(): PanelNavigationResult {
  const history = usePanelStore((state) => state.history)
  const initialized = usePanelStore((state) => state.initialized)
  const initialize = usePanelStore((state) => state.initialize)
  const setHistory = usePanelStore((state) => state.setHistory)
  const pushPanel = usePanelStore((state) => state.pushPanel)
  const clearHistory = usePanelStore((state) => state.clearHistory)

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
      if (state?.panelHistory) {
        setHistory(state.panelHistory)
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
    const newPanel: PanelState = { id, type, name }
    const currentHistory = usePanelStore.getState().history
    const newHistory = [...currentHistory, newPanel]

    const historyState: HistoryState = {
      panelIndex: newHistory.length - 1,
      panelHistory: newHistory,
    }
    window.history.pushState(historyState, '', createPanelUrl(newPanel))
    
    pushPanel(newPanel)
  }

  const closePanel = () => {
    const historyState: HistoryState = {
      panelIndex: -1,
      panelHistory: [],
    }
    window.history.pushState(historyState, '', createPanelUrl(null))
    
    clearHistory()
  }

  const goBack = () => {
    const currentHistory = usePanelStore.getState().history
    if (currentHistory.length <= 1) {
      return
    }
    
    const newHistory = currentHistory.slice(0, -1)
    const previousPanel = newHistory[newHistory.length - 1]

    const historyState: HistoryState = {
      panelIndex: newHistory.length - 1,
      panelHistory: newHistory,
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
