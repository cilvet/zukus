import { useCallback } from 'react'
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated'

const HEADER_HEIGHT = 72

type UseCollapsibleHeaderOptions = {
  headerHeight?: number
}

/**
 * Hook para manejar un header colapsable basado en scroll.
 *
 * El header se oculta suavemente al scrollear hacia abajo
 * y reaparece al scrollear hacia arriba.
 */
export function useCollapsibleHeader(options: UseCollapsibleHeaderOptions = {}) {
  "use no memo"; // Reanimated shared values are mutable by design
  const headerHeight = options.headerHeight ?? HEADER_HEIGHT

  // Offset actual del scroll
  const scrollY = useSharedValue(0)
  // Dirección del scroll: 1 = down, -1 = up
  const scrollDirection = useSharedValue(0)
  // Último offset para calcular dirección
  const lastScrollY = useSharedValue(0)
  // Posición del header (0 = visible, -headerHeight = oculto)
  const headerTranslateY = useSharedValue(0)

  // Handler para el scroll - llamar desde onScroll del ScrollView
  const scrollHandler = useCallback((offsetY: number) => {
    'worklet'
    const diff = offsetY - lastScrollY.value
    lastScrollY.value = offsetY
    scrollY.value = offsetY

    // Solo colapsar si hay scroll significativo
    if (Math.abs(diff) < 1) return

    // Determinar dirección
    scrollDirection.value = diff > 0 ? 1 : -1

    // Calcular nueva posición del header
    if (diff > 0 && offsetY > 0) {
      // Scrolleando hacia abajo - ocultar header
      headerTranslateY.value = withTiming(
        Math.max(-headerHeight, headerTranslateY.value - diff),
        { duration: 100 }
      )
    } else if (diff < 0) {
      // Scrolleando hacia arriba - mostrar header
      headerTranslateY.value = withTiming(
        Math.min(0, headerTranslateY.value - diff),
        { duration: 100 }
      )
    }

    // Clamp
    if (headerTranslateY.value < -headerHeight) {
      headerTranslateY.value = -headerHeight
    }
    if (headerTranslateY.value > 0 || offsetY <= 0) {
      headerTranslateY.value = 0
    }
  }, [headerHeight])

  // Estilo animado para el header
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: headerTranslateY.value }],
    }
  })

  // Estilo animado para el contenido (padding top para compensar header)
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      paddingTop: interpolate(
        headerTranslateY.value,
        [-headerHeight, 0],
        [0, headerHeight],
        Extrapolation.CLAMP
      ),
    }
  })

  // Reset cuando cambia de página
  const resetHeader = useCallback(() => {
    'worklet'
    headerTranslateY.value = withTiming(0, { duration: 200 })
    scrollY.value = 0
    lastScrollY.value = 0
  }, [])

  return {
    scrollHandler,
    headerAnimatedStyle,
    contentAnimatedStyle,
    headerHeight,
    resetHeader,
    scrollY,
    headerTranslateY,
  }
}
