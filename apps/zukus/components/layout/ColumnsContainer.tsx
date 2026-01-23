import { Platform, useWindowDimensions, StyleSheet, View } from 'react-native'
import { XStack, YStack, ScrollView } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '../../ui'

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
  const { themeColors } = useTheme()
  const isMobile = Platform.OS !== 'web' || width < DESKTOP_BREAKPOINT

  if (isMobile) {
    // Mobile: scroll vertical simple
    return (
      <ScrollView
        flex={1}
        backgroundColor={themeColors.background}
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

  // Desktop: scroll horizontal con gradiente de fondo estilo aurora
  // Mezcla sutil del color de acento con viñeta oscura en las esquinas
  const accentWithAlpha = `${themeColors.accent}15`
  const darkVignette = 'rgba(0, 0, 0, 0.3)'

  return (
    <View style={styles.desktopContainer}>
      {/* Capa base: color de fondo del tema */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: themeColors.background }]} />

      {/* Capa de viñeta: oscurece sutilmente las esquinas */}
      <LinearGradient
        colors={[darkVignette, 'transparent', 'transparent', darkVignette]}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Capa de acento: toque sutil de color desde una esquina */}
      <LinearGradient
        colors={[accentWithAlpha, 'transparent']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.6, y: 0.2 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        horizontal
        flex={1}
        backgroundColor="transparent"
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
    </View>
  )
}

const styles = StyleSheet.create({
  mobileContent: {
    flexGrow: 1,
  },
  desktopContainer: {
    flex: 1,
  },
  desktopContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
})
