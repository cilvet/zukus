// @ts-nocheck
// Los errores de tipo son debido a incompatibilidades entre @types/react 18 y 19
import { useEffect } from 'react'
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  interpolateColor,
} from 'react-native-reanimated'
import { useGlowOnChange } from './useGlowOnChange'

type RowGlowAnimationResult = {
  animatedRowStyle: ReturnType<typeof useAnimatedStyle>
  animatedBorderStyle: ReturnType<typeof useAnimatedStyle>
  animatedNumberStyle: ReturnType<typeof useAnimatedStyle>
}

type RowGlowAnimationOptions = {
  /**
   * Si es false, no se disparan animaciones.
   * Útil para evitar animaciones en páginas que no están visibles.
   * @default true
   */
  enabled?: boolean
}

/**
 * Hook que proporciona animaciones de brillo para filas (skills, items, etc).
 *
 * Incluye:
 * - Background glow (fondo que se ilumina)
 * - Border glow (borde que aparece blanco)
 * - Number scale (el número hace un "pop")
 *
 * @param value - El valor a observar para detectar cambios
 * @param borderColor - Color base del borde cuando no hay glow
 * @param options - Opciones de configuración
 */
export function useRowGlowAnimation<T>(
  value: T,
  borderColor: string,
  options?: RowGlowAnimationOptions
): RowGlowAnimationResult {
  const glowTrigger = useGlowOnChange(value, { enabled: options?.enabled })
  const glowProgress = useSharedValue(0)
  const numberScale = useSharedValue(1)

  useEffect(() => {
    if (glowTrigger > 0) {
      glowProgress.value = withSequence(
        withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 1200, easing: Easing.out(Easing.cubic) })
      )

      numberScale.value = withSequence(
        withTiming(1.2, { duration: 150, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
      )
    }
  }, [glowTrigger, glowProgress, numberScale])

  const animatedRowStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      glowProgress.value,
      [0, 1],
      ['transparent', 'rgba(255, 255, 255, 0.1)']
    )
    return { backgroundColor }
  }, [])

  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      opacity: glowProgress.value,
      borderColor: '#ffffff',
    }
  }, [])

  const animatedNumberStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: numberScale.value }] }
  }, [])

  return {
    animatedRowStyle,
    animatedBorderStyle,
    animatedNumberStyle,
  }
}
