import { useCallback, useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import { usePathname } from 'expo-router'
import { usePanelStore, type PanelEntry, type PanelNavigationResult } from '../ui/stores/panelStore'

type HistoryState = {
  panelIndex: number
  panelPath: string | null
  panelTitle?: string
}

function parseUrlParams(): PanelEntry | null {
  if (Platform.OS !== 'web') return null

  const params = new URLSearchParams(window.location.search)
  const panelPath = params.get('panel')
  const panelTitle = params.get('panelTitle')

  if (!panelPath) {
    return null
  }

  return { path: panelPath, title: panelTitle || undefined }
}

function createPanelUrl(panel: PanelEntry | null): string {
  const basePath = window.location.pathname

  if (!panel) {
    return basePath
  }

  const params = new URLSearchParams()
  params.set('panel', panel.path)
  if (panel.title) {
    params.set('panelTitle', panel.title)
  }
  return `${basePath}?${params.toString()}`
}

/**
 * Hook unificado para manejar la navegación de paneles.
 *
 * En web: sincroniza el estado del panel con URL params.
 * En native: retorna valores por defecto (no hay Side Panel en mobile nativo).
 *
 * @param scope - Identificador del scope (ej: 'character', 'edit')
 */
export function usePanelNavigation(scope: string): PanelNavigationResult {
  const pathname = usePathname()
  const stacks = usePanelStore((state) => state.stacks)
  const initialized = usePanelStore((state) => state.initialized)
  const push = usePanelStore((state) => state.push)
  const pop = usePanelStore((state) => state.pop)
  const clear = usePanelStore((state) => state.clear)
  const replace = usePanelStore((state) => state.replace)
  const markInitialized = usePanelStore((state) => state.markInitialized)

  const stack = stacks[scope] || []
  const currentPanel = stack.length > 0 ? stack[stack.length - 1] : null
  const isPanelOpen = currentPanel !== null
  const canGoBack = stack.length > 1
  const isInitialized = initialized[scope] ?? false
  const initRef = useRef(false)

  // Web: restaurar desde URL al montar (solo una vez)
  useEffect(() => {
    if (Platform.OS !== 'web') return
    if (initRef.current || isInitialized) return
    initRef.current = true

    const initial = parseUrlParams()
    if (initial) {
      replace(scope, [initial])
    }
    markInitialized(scope)
  }, [scope, isInitialized, replace, markInitialized])

  // Web: escuchar navegación del browser (back/forward)
  useEffect(() => {
    if (Platform.OS !== 'web') return

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as HistoryState | null
      if (state?.panelPath) {
        replace(scope, [{ path: state.panelPath, title: state.panelTitle }])
      } else {
        const panel = parseUrlParams()
        replace(scope, panel ? [panel] : [])
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [scope, replace])

  // Web: sincronizar URL cuando cambia el panel
  useEffect(() => {
    if (Platform.OS !== 'web') return
    if (!isInitialized) return

    const newUrl = createPanelUrl(currentPanel)
    const currentUrl = window.location.pathname + window.location.search

    // Solo actualizar si hay cambio real
    if (newUrl !== currentUrl) {
      const historyState: HistoryState = {
        panelIndex: stack.length - 1,
        panelPath: currentPanel?.path ?? null,
        panelTitle: currentPanel?.title,
      }
      window.history.replaceState(historyState, '', newUrl)
    }
  }, [currentPanel, pathname, isInitialized, stack.length])

  const openPanel = useCallback((path: string, title?: string) => {
    const entry: PanelEntry = { path, title }

    if (Platform.OS === 'web') {
      const historyState: HistoryState = {
        panelIndex: stack.length,
        panelPath: path,
        panelTitle: title,
      }
      window.history.pushState(historyState, '', createPanelUrl(entry))
    }

    push(scope, entry)
  }, [scope, push, stack.length])

  const closePanel = useCallback(() => {
    if (Platform.OS === 'web') {
      const historyState: HistoryState = {
        panelIndex: -1,
        panelPath: null,
      }
      window.history.pushState(historyState, '', createPanelUrl(null))
    }

    clear(scope)
  }, [scope, clear])

  const goBack = useCallback(() => {
    if (stack.length <= 1) {
      closePanel()
      return
    }

    const newStack = stack.slice(0, -1)
    const previousPanel = newStack[newStack.length - 1]

    if (Platform.OS === 'web') {
      const historyState: HistoryState = {
        panelIndex: newStack.length - 1,
        panelPath: previousPanel?.path ?? null,
        panelTitle: previousPanel?.title,
      }
      window.history.pushState(historyState, '', createPanelUrl(previousPanel))
    }

    pop(scope)
  }, [scope, pop, stack, closePanel])

  return {
    currentPanel,
    isPanelOpen,
    canGoBack,
    openPanel,
    closePanel,
    goBack,
  }
}

// Re-export types for convenience
export type { PanelEntry, PanelNavigationResult }
