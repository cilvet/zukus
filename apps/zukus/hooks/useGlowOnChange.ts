import { useEffect, useRef, useState } from 'react'

/**
 * Hook que detecta cambios en un valor y retorna un contador que se incrementa
 * cada vez que el valor cambia. Útil para disparar animaciones de "glow" o highlight.
 *
 * Ignora el primer render para no activar el glow al montar el componente.
 *
 * @param value - El valor a observar
 * @returns Contador que se incrementa en cada cambio (0 = nunca ha cambiado)
 */
export function useGlowOnChange<T>(value: T): number {
  const prevRef = useRef<T | undefined>(undefined)
  const isFirstRender = useRef(true)
  const [glowTrigger, setGlowTrigger] = useState(0)

  useEffect(() => {
    // Ignorar primer render para no brillar al montar
    if (isFirstRender.current) {
      isFirstRender.current = false
      prevRef.current = value
      return
    }

    if (prevRef.current !== value) {
      setGlowTrigger((prev) => prev + 1)
      prevRef.current = value
    }
  }, [value])

  return glowTrigger
}
