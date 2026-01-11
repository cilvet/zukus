import { useState, useEffect, useCallback } from 'react'

export type PanelState = {
  id: string
  type: string
  name?: string
}

type HistoryState = {
  panelDepth?: number
}

type NavigationState = {
  currentPanel: PanelState | null
  depth: number
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

function getDepthFromHistory(): number {
  if (typeof window === 'undefined') {
    return 0
  }
  const state = window.history.state as HistoryState | null
  return state?.panelDepth || 0
}

function readCurrentState(): NavigationState {
  return {
    currentPanel: parseUrlParams(),
    depth: getDepthFromHistory(),
  }
}

/**
 * Hook para manejar la navegación del Side Panel en desktop web.
 * 
 * Usa la URL como fuente de verdad para el panel actual, y history.state
 * para saber la profundidad de navegación (si podemos ir hacia atrás).
 */
export function usePanelNavigation() {
  const [state, setState] = useState<NavigationState>(readCurrentState)

  // Escuchar eventos popstate (cuando el usuario navega con botones del navegador)
  useEffect(() => {
    const handlePopState = () => {
      setState(readCurrentState())
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const isPanelOpen = state.currentPanel !== null
  const canGoBack = state.depth > 1

  const openPanel = useCallback((id: string, type: string, name?: string) => {
    const newPanel: PanelState = { id, type, name }
    const newDepth = state.depth + 1

    const historyState: HistoryState = { panelDepth: newDepth }
    window.history.pushState(historyState, '', createPanelUrl(newPanel))
    
    // Actualizar estado local inmediatamente
    setState({ currentPanel: newPanel, depth: newDepth })
  }, [state.depth])

  const closePanel = useCallback(() => {
    const historyState: HistoryState = { panelDepth: 0 }
    window.history.pushState(historyState, '', createPanelUrl(null))
    
    setState({ currentPanel: null, depth: 0 })
  }, [])

  const goBack = useCallback(() => {
    // El estado se actualizará via el listener de popstate
    window.history.back()
  }, [])

  return {
    currentPanel: state.currentPanel,
    isPanelOpen,
    canGoBack,
    openPanel,
    closePanel,
    goBack,
  }
}
