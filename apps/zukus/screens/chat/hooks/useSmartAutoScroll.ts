import { useCallback, useRef, useState } from 'react'
import type { ScrollView } from 'react-native'

const SCROLL_THRESHOLD = 50

type ScrollEvent = {
  nativeEvent: {
    contentOffset: { y: number }
    contentSize: { height: number }
    layoutMeasurement: { height: number }
    velocity?: { y: number }
  }
}

export function useSmartAutoScroll(scrollRef: React.RefObject<ScrollView | null>) {
  const [showScrollButton, setShowScrollButton] = useState(false)

  const lastScrollTime = useRef(0)
  const lastScrollYRef = useRef(0)
  const isAtBottomRef = useRef(true)
  const userIsDraggingRef = useRef(false)

  // Scroll throttled - solo si usuario está en el fondo
  const scrollToBottom = useCallback(() => {
    if (!isAtBottomRef.current) return

    const now = Date.now()
    if (now - lastScrollTime.current < 100) return
    lastScrollTime.current = now

    setTimeout(() => {
      if (!isAtBottomRef.current) return
      scrollRef.current?.scrollToEnd({ animated: false })
    }, 50)
  }, [scrollRef])

  // Scroll manual al fondo (para el botón flotante)
  const handleScrollToBottom = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true })
    setShowScrollButton(false)
    isAtBottomRef.current = true
  }, [scrollRef])

  // Forzar auto-scroll activo (cuando el usuario envía mensaje)
  const activateAutoScroll = useCallback(() => {
    isAtBottomRef.current = true
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [scrollRef])

  // Detectar inicio de scroll manual
  const handleScrollBeginDrag = useCallback((event: ScrollEvent) => {
    userIsDraggingRef.current = true
    // Cancelar cualquier scroll animado en progreso
    const currentY = event.nativeEvent.contentOffset.y
    scrollRef.current?.scrollTo({ y: currentY, animated: false })
  }, [scrollRef])

  // Detectar dirección y posición del scroll
  const handleScroll = useCallback((event: ScrollEvent, hasMessages = true) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height
    const isAtBottom = distanceFromBottom <= SCROLL_THRESHOLD

    if (userIsDraggingRef.current) {
      const scrolledUp = contentOffset.y < lastScrollYRef.current - 5

      if (scrolledUp) {
        isAtBottomRef.current = false
      } else if (isAtBottom) {
        isAtBottomRef.current = true
      }
    }

    lastScrollYRef.current = contentOffset.y
    setShowScrollButton(!isAtBottom && hasMessages)
  }, [])

  // Finalizar estado cuando termina el drag
  const handleScrollEndDrag = useCallback((event: ScrollEvent) => {
    const { contentOffset, contentSize, layoutMeasurement, velocity } = event.nativeEvent
    const hasNoMomentum = !velocity || Math.abs(velocity.y) < 0.1

    if (hasNoMomentum) {
      userIsDraggingRef.current = false
      const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height
      isAtBottomRef.current = distanceFromBottom <= SCROLL_THRESHOLD
    }
  }, [])

  // Finalizar estado después del momentum scroll
  const handleMomentumScrollEnd = useCallback((event: ScrollEvent) => {
    userIsDraggingRef.current = false
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height
    isAtBottomRef.current = distanceFromBottom <= SCROLL_THRESHOLD
  }, [])

  return {
    showScrollButton,
    scrollToBottom,
    handleScrollToBottom,
    activateAutoScroll,
    scrollHandlers: {
      onScroll: handleScroll,
      onScrollBeginDrag: handleScrollBeginDrag,
      onScrollEndDrag: handleScrollEndDrag,
      onMomentumScrollEnd: handleMomentumScrollEnd,
    },
  }
}
