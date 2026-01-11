import { createContext, useContext, type ReactNode } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'

const HEADER_HEIGHT = 72

type CollapsibleHeaderContextType = {
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>
  headerAnimatedStyle: ReturnType<typeof useAnimatedStyle>
  headerHeight: number
}

const CollapsibleHeaderContext = createContext<CollapsibleHeaderContextType | null>(null)

type CollapsibleHeaderProviderProps = {
  children: ReactNode
  headerHeight?: number
}

/**
 * Provider que maneja el estado del header colapsable.
 * Envuelve el CharacterScreen y comparte el scroll handler con las secciones.
 */
export function CollapsibleHeaderProvider({
  children,
  headerHeight = HEADER_HEIGHT,
}: CollapsibleHeaderProviderProps) {
  const scrollY = useSharedValue(0)
  const lastScrollY = useSharedValue(0)
  const headerTranslateY = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offsetY = event.contentOffset.y
      const diff = offsetY - lastScrollY.value
      lastScrollY.value = offsetY
      scrollY.value = offsetY

      // Ignorar micro-movimientos
      if (Math.abs(diff) < 2) return

      if (diff > 0 && offsetY > 10) {
        // Scroll down → ocultar
        const newValue = headerTranslateY.value - diff * 0.5
        headerTranslateY.value = Math.max(-headerHeight, newValue)
      } else if (diff < 0) {
        // Scroll up → mostrar
        const newValue = headerTranslateY.value - diff * 0.5
        headerTranslateY.value = Math.min(0, newValue)
      }

      // Si estamos arriba del todo, mostrar header
      if (offsetY <= 0) {
        headerTranslateY.value = withTiming(0, { duration: 150 })
      }
    },
    onEndDrag: (event) => {
      // Snap al estado más cercano
      if (headerTranslateY.value > -headerHeight / 2) {
        headerTranslateY.value = withTiming(0, { duration: 200 })
      } else {
        headerTranslateY.value = withTiming(-headerHeight, { duration: 200 })
      }
    },
  })

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerTranslateY.value }],
    opacity: interpolate(
      headerTranslateY.value,
      [-headerHeight, -headerHeight / 2, 0],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    ),
  }))

  return (
    <CollapsibleHeaderContext.Provider
      value={{
        scrollHandler,
        headerAnimatedStyle,
        headerHeight,
      }}
    >
      {children}
    </CollapsibleHeaderContext.Provider>
  )
}

/**
 * Hook para acceder al contexto del header colapsable.
 */
export function useCollapsibleHeaderContext() {
  const context = useContext(CollapsibleHeaderContext)
  if (!context) {
    throw new Error('useCollapsibleHeaderContext must be used within CollapsibleHeaderProvider')
  }
  return context
}
