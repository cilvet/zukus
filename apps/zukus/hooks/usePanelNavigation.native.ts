import type { PanelNavigationResult } from './usePanelNavigation.types'

const noop = () => {}

/**
 * Versión nativa del hook de navegación de panel.
 * En nativo no usamos Side Panel, solo stack navigation.
 * Este hook retorna valores por defecto sin funcionalidad.
 */
export function usePanelNavigation(): PanelNavigationResult {
  return {
    currentPanel: null,
    isPanelOpen: false,
    canGoBack: false,
    openPanel: noop,
    closePanel: noop,
    goBack: noop,
  }
}
