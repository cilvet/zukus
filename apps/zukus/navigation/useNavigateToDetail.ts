import { useRouter } from 'expo-router'
import { Platform, useWindowDimensions } from 'react-native'
import { usePanelNavigation } from '../hooks'
import { type DetailType, getDetailTitle, isValidDetailType } from './detailRegistry'

const DESKTOP_BREAKPOINT = 768

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
 */
export function useNavigateToDetail() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const panelNav = usePanelNavigation()
  
  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT

  const navigateToDetail = (type: DetailType, id: string, customName?: string) => {
    if (!isValidDetailType(type)) {
      console.warn(`Invalid detail type: ${type}`)
      return
    }

    const title = getDetailTitle(type, id, customName)

    // Desktop web: usar SidePanel
    if (isDesktop) {
      panelNav.openPanel(id, type, title)
      return
    }

    // Mobile (nativo + web): usar stack navigation
    router.push({
      pathname: '/(tabs)/(character)/detail/[...slug]',
      params: { slug: [type, id] },
    })
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
