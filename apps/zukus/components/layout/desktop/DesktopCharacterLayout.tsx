import { Platform, useWindowDimensions, StyleSheet, View } from 'react-native'
import { XStack, YStack, ScrollView } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '../../../ui'

/**
 * Lightens a hex color by mixing it with white.
 * @param hex - Hex color (e.g., "#2e1a47")
 * @param amount - 0 to 1, where 1 is fully white
 */
function lightenColor(hex: string, amount: number): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '')

  // Parse RGB
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)

  // Mix with white (255, 255, 255)
  const newR = Math.round(r + (255 - r) * amount)
  const newG = Math.round(g + (255 - g) * amount)
  const newB = Math.round(b + (255 - b) * amount)

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

// Layout dimensions
const MAX_CONTENT_WIDTH = 1400
const MAX_CONTENT_HEIGHT = 900
const LEFT_COLUMN_1_WIDTH = 300
const LEFT_COLUMN_2_WIDTH = 360
const COLUMN_GAP = 16
const LEFT_COLUMNS_TOTAL_WIDTH = LEFT_COLUMN_1_WIDTH + LEFT_COLUMN_2_WIDTH + COLUMN_GAP

type DesktopCharacterLayoutProps = {
  /** Top bar with character info and key stats */
  topBar: React.ReactNode
  /** Left side columns (abilities, saving throws, skills) */
  leftColumns: React.ReactNode
  /** Right side top area (combat stats) */
  rightTop: React.ReactNode
  /** Right side bottom area (tabbed content box) */
  rightBottom: React.ReactNode
  /** Side panel (detail panel) */
  sidePanel?: React.ReactNode
}

// Export dimensions for use in CharacterScreenDesktopNew
export const LAYOUT_DIMENSIONS = {
  leftColumn1Width: LEFT_COLUMN_1_WIDTH,
  leftColumn2Width: LEFT_COLUMN_2_WIDTH,
  leftColumnsTotalWidth: LEFT_COLUMNS_TOTAL_WIDTH,
}

/**
 * Desktop character layout inspired by DnD Beyond.
 *
 * Structure:
 * +-----------------------------------------------------+
 * |                    TOP BAR                          |
 * +-----------------------------------------------------+
 * |  LEFT COLUMNS         |        RIGHT SIDE           |
 * |  +------+  +------+   |  +----------------------+   |
 * |  | Col1 |  | Col2 |   |  |      RIGHT TOP       |   |
 * |  |      |  |      |   |  +----------------------+   |
 * |  |      |  |      |   |  |     RIGHT BOTTOM     |   |
 * |  |      |  |      |   |  |    (Tabbed Box)      |   |
 * |  +------+  +------+   |  +----------------------+   |
 * +-----------------------------------------------------+
 */
export function DesktopCharacterLayout({
  topBar,
  leftColumns,
  rightTop,
  rightBottom,
  sidePanel,
}: DesktopCharacterLayoutProps) {
  const { themeColors } = useTheme()
  const { height } = useWindowDimensions()

  // Only render on web
  if (Platform.OS !== 'web') {
    return null
  }

  // Available content height (minus top bar, capped at max)
  const availableHeight = height - 140 // top bar + padding
  const contentHeight = Math.min(availableHeight, MAX_CONTENT_HEIGHT)

  return (
    <YStack position="relative" flex={1} overflow="hidden">
      {/* Background - lightened theme background with subtle gradient */}
      <LinearGradient
        colors={[lightenColor(themeColors.background, 0.4), lightenColor(themeColors.background, 0.25)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Main content - scrollable and centered */}
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <YStack
          flex={1}
          padding={24}
          gap={16}
          maxWidth={MAX_CONTENT_WIDTH}
          width="100%"
          alignSelf="center"
        >
          {/* Top bar */}
          <YStack>{topBar}</YStack>

          {/* Main area: left columns + right side */}
          <XStack flex={1} gap={COLUMN_GAP}>
            {/* Left columns */}
            <XStack gap={COLUMN_GAP} height={contentHeight}>
              {leftColumns}
            </XStack>

            {/* Right side - same width as left columns total */}
            <YStack gap={16} height={contentHeight} width={LEFT_COLUMNS_TOTAL_WIDTH}>
              {/* Right top */}
              <YStack>{rightTop}</YStack>

              {/* Right bottom (tabbed box) */}
              <YStack flex={1} minHeight={0}>
                {rightBottom}
              </YStack>
            </YStack>
          </XStack>
        </YStack>
      </ScrollView>

      {/* Side panel */}
      {sidePanel}
    </YStack>
  )
}
