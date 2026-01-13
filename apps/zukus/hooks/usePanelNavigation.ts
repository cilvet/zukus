import { useState, useEffect, useCallback, useRef } from 'react'

export type PanelState = {
  id: string
  type: string
  name?: string
}

type HistoryState = {
  panelIndex: number
  panelHistory: PanelState[]
}

function parseUrlParams(): PanelState | null {
  if (typeof window === 'undefined') {
    return null
  }
  const params = new URLSearchParams(window.location.search)
  const panelId = params.get('panel')
  const panelType = params.get('type')
  const panelName = params.get('name')

  if (panelId && panelType) {
    return { id: panelId, type: panelType, name: panelName || undefined }
  }
  return null
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

function getInitialHistory(): PanelState[] {
  const initial = parseUrlParams()
  return initial ? [initial] : []
}

/**
 * Hook para manejar la navegación del Side Panel en desktop web.
 * 
 * Mantiene un array de historial de paneles para soportar navegación hacia atrás
 * entre paneles. La URL refleja el panel actual.
 */
export function usePanelNavigation() {
  const [history, setHistory] = useState<PanelState[]>(getInitialHistory)
  const historyRef = useRef<PanelState[]>(history)

  // Mantener el ref sincronizado con el estado
  useEffect(() => {
    historyRef.current = history
  }, [history])

  // Escuchar eventos popstate (cuando el usuario navega con botones del navegador)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as HistoryState | null
      if (state && state.panelHistory) {
        setHistory(state.panelHistory)
      } else {
        // Sin estado guardado, leer de la URL
        const panel = parseUrlParams()
        setHistory(panel ? [panel] : [])
      }
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const currentPanel = history.length > 0 ? history[history.length - 1] : null
  const isPanelOpen = currentPanel !== null
  const canGoBack = history.length > 1

  const openPanel = useCallback((id: string, type: string, name?: string) => {
    const newPanel: PanelState = { id, type, name }
    const newHistory = [...historyRef.current, newPanel]

    const historyState: HistoryState = {
      panelIndex: newHistory.length - 1,
      panelHistory: newHistory,
    }
    window.history.pushState(historyState, '', createPanelUrl(newPanel))
    
    setHistory(newHistory)
  }, [])

  const closePanel = useCallback(() => {
    const historyState: HistoryState = {
      panelIndex: -1,
      panelHistory: [],
    }
    window.history.pushState(historyState, '', createPanelUrl(null))
    
    setHistory([])
  }, [])

  const goBack = useCallback(() => {
    if (historyRef.current.length <= 1) {
      return
    }
    
    const newHistory = historyRef.current.slice(0, -1)
    const previousPanel = newHistory[newHistory.length - 1]

    const historyState: HistoryState = {
      panelIndex: newHistory.length - 1,
      panelHistory: newHistory,
    }
    window.history.pushState(historyState, '', createPanelUrl(previousPanel))
    
    setHistory(newHistory)
  }, [])

  return {
    currentPanel,
    isPanelOpen,
    canGoBack,
    openPanel,
    closePanel,
    goBack,
  }
}
