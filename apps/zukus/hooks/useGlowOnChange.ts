import { useEffect, useRef, useState } from 'react'
import { usePanelStore } from '../ui/stores/panelStore'

type GlowOptions = {
  /**
   * Si es false, el hook actualiza su referencia interna pero NO dispara la animación.
   * Útil para evitar animaciones en páginas que no están visibles.
   * @default true
   */
  enabled?: boolean
}

/**
 * Hook que detecta cambios en un valor y retorna un contador que se incrementa
 * cada vez que el valor cambia. Útil para disparar animaciones de "glow" o highlight.
 *
 * Ignora el primer render para no activar el glow al montar el componente.
 * También deshabilita automáticamente cuando hay un panel abierto para evitar
 * crashes de Reanimated con múltiples animaciones simultáneas.
 *
 * @param value - El valor a observar
 * @param options - Opciones de configuración
 * @returns Contador que se incrementa en cada cambio (0 = nunca ha cambiado)
 */
export function useGlowOnChange<T>(value: T, options?: GlowOptions): number {
  const enabled = options?.enabled ?? true
  const prevRef = useRef<T | undefined>(undefined)
  const isFirstRender = useRef(true)
  const [glowTrigger, setGlowTrigger] = useState(0)

  // Deshabilitar glow cuando hay un panel abierto para evitar crashes de Reanimated
  const hasOpenPanel = usePanelStore((state) => {
    const stacks = state.stacks
    for (const key in stacks) {
      if (stacks[key].length > 0) return true
    }
    return false
  })

  useEffect(() => {
    // Ignorar primer render para no brillar al montar
    if (isFirstRender.current) {
      isFirstRender.current = false
      prevRef.current = value
      return
    }

    if (prevRef.current !== value) {
      // Siempre actualizamos la referencia para que cuando se haga visible
      // no brille por cambios que ocurrieron mientras estaba oculto
      prevRef.current = value

      // Solo incrementamos el trigger si está habilitado y no hay panel abierto
      if (enabled && !hasOpenPanel) {
        setGlowTrigger((prev) => prev + 1)
      }
    }
  }, [value, enabled, hasOpenPanel])

  return glowTrigger
}
