import { Platform, useWindowDimensions, StyleSheet } from 'react-native'
import { XStack, YStack, ScrollView } from 'tamagui'
import { themes } from '@zukus/ui'

const CURRENT_THEME = 'zukus' as keyof typeof themes
const theme = themes[CURRENT_THEME]

const DESKTOP_BREAKPOINT = 768

type ColumnsContainerProps = {
  children: React.ReactNode
}

/**
 * Contenedor principal para layout de columnas verticales.
 * - Desktop: scroll horizontal con columnas lado a lado, centradas
 * - Mobile: scroll vertical con columnas apiladas
 */
export function ColumnsContainer({ children }: ColumnsContainerProps) {
  const { width } = useWindowDimensions()
  const isMobile = Platform.OS !== 'web' || width < DESKTOP_BREAKPOINT

  if (isMobile) {
    // Mobile: scroll vertical simple
    return (
      <ScrollView
        flex={1}
        backgroundColor={theme.background}
        contentContainerStyle={styles.mobileContent}
        showsVerticalScrollIndicator={false}
      >
        <YStack
          flexDirection="column"
          alignItems="flex-start"
          width="100%"
          gap={16}
        >
          {children}
        </YStack>
      </ScrollView>
    )
  }

  // Desktop: scroll horizontal con columnas centradas
  return (
    <ScrollView
      horizontal
      flex={1}
      backgroundColor={theme.background}
      contentContainerStyle={styles.desktopContent}
      showsHorizontalScrollIndicator={false}
      // @ts-ignore - Web-only property
      scrollbarWidth="none"
    >
      <XStack
        flexDirection="row"
        alignItems="flex-start"
        gap={16}
        paddingHorizontal={16}
        paddingVertical={16}
        minWidth="100%"
        justifyContent="center"
      >
        {children}
      </XStack>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  mobileContent: {
    flexGrow: 1,
  },
  desktopContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
})
