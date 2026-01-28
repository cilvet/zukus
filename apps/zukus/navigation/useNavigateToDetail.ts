import { useRouter } from 'expo-router'
import { Platform, useWindowDimensions } from 'react-native'
import { usePanelNavigation } from '../hooks'
import { type DetailType, getDetailTitle, isValidDetailType } from './detailRegistry'

const DESKTOP_BREAKPOINT = 768

// Global timestamp for measuring navigation time
export const NAVIGATION_PRESS_TIME = { value: 0, type: '' }

/**
 * Hook que unifica la navegación a detalles entre plataformas.
 *
 * - En desktop web: abre el SidePanel
 * - En mobile (nativo + web): navega con stack navigation
 *
 * Uso:
 * ```typescript
 * const navigateToDetail = useNavigateToDetail()
 * navigateToDetail('ability', 'strength')
 * navigateToDetail('item', 'sword-123', 'Espada Larga +1')
 * ```
 *
 * @param scope - Scope del panel (default: 'character')
 */
export function useNavigateToDetail(scope: string = 'character') {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const panelNav = usePanelNavigation(scope)

  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT

  const navigateToDetail = (type: DetailType, id: string, customName?: string) => {
    const startTime = performance.now()
    console.log('[PERF] navigateToDetail called', { type, id })

    if (!isValidDetailType(type)) {
      console.warn(`Invalid detail type: ${type}`)
      return
    }

    const title = getDetailTitle(type, id, customName)

    // Desktop web: usar SidePanel con path format: type/id
    if (isDesktop) {
      panelNav.openPanel(`${type}/${id}`, title)
      return
    }

    // Mobile (nativo + web): usar stack navigation
    console.log('[PERF] calling router.push', performance.now() - startTime, 'ms since start')
    router.push({
      pathname: '/characters/detail/[...slug]',
      params: { slug: [type, id] },
    })
    console.log('[PERF] router.push returned', performance.now() - startTime, 'ms since start')
  }

  return navigateToDetail
}

/**
 * Hook para detectar si estamos en modo desktop.
 */
export function useIsDesktop(): boolean {
  const { width } = useWindowDimensions()
  return Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT
}
