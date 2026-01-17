/**
 * Este archivo existe para que TypeScript pueda resolver el módulo.
 * Metro automáticamente usa .native.ts o .web.ts según la plataforma.
 * 
 * En runtime:
 * - Web: usa usePanelNavigation.web.ts
 * - Native: usa usePanelNavigation.native.ts
 */
export { usePanelNavigation } from './usePanelNavigation.web'
export type { PanelState, PanelNavigationResult } from './usePanelNavigation.types'
