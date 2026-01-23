import { ReactNode } from 'react'
import { Platform, useWindowDimensions } from 'react-native'
import { YStack } from 'tamagui'

const DESKTOP_BREAKPOINT = 768

interface VerticalSectionProps {
  children: ReactNode
  width?: number
}

/**
 * Columna vertical individual con scroll interno.
 * - Desktop: ancho fijo (default 280px), altura fija con scroll interno
 * - Mobile: ancho 100%, altura auto
 */
export function VerticalSection({ children, width: columnWidth = 280 }: VerticalSectionProps) {
  const { width, height } = useWindowDimensions()
  const isMobile = Platform.OS !== 'web' || width < DESKTOP_BREAKPOINT

  // Altura del contenedor: altura de viewport menos espacio para header/tabs
  const containerHeight = height - 120

  return (
    <YStack
      alignItems="center"
      height={isMobile ? 'auto' : containerHeight}
      flexDirection="column"
      width={isMobile ? '100%' : columnWidth}
      paddingHorizontal={isMobile ? 16 : 0}
      paddingTop={isMobile ? 16 : 0}
      overflow={isMobile ? 'visible' : 'scroll'}
      // @ts-ignore - CSS property for web
      scrollbarWidth="none"
    >
      {children}
    </YStack>
  )
}
