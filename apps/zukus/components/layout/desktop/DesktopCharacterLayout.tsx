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
const CONTENT_WIDTH = 1200 // Total width of columns + gaps
const CONTENT_PADDING = 24
const MAX_CONTENT_WIDTH = CONTENT_WIDTH + (CONTENT_PADDING * 2) // Container includes padding
const LEFT_COLUMN_1_WIDTH = 280
const LEFT_COLUMN_2_WIDTH = 340
const COLUMN_GAP = 16
const LEFT_COLUMNS_TOTAL_WIDTH = LEFT_COLUMN_1_WIDTH + LEFT_COLUMN_2_WIDTH + COLUMN_GAP
// Right side: 1200 - 636 - 16 = 548
const RIGHT_SIDE_WIDTH = CONTENT_WIDTH - LEFT_COLUMNS_TOTAL_WIDTH - COLUMN_GAP
const COMBAT_STATS_HEIGHT = 105 // Approximate height of CombatStatsRow

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
  rightSideWidth: RIGHT_SIDE_WIDTH,
}

/**
 * Hook to calculate dynamic layout heights based on viewport.
 */
export function useLayoutHeights() {
  const { height } = useWindowDimensions()

  // Top bar (~140px) + padding (24*2) + gaps (~32) = ~220px overhead
  const viewportOverhead = 220
  const availableHeight = height - viewportOverhead
  // Minimum 450px, maximum based on remaining space
  const mainAreaHeight = Math.max(450, Math.min(availableHeight, 800))
  // Height for right bottom = main area minus combat stats and gap
  const columnsHeight = mainAreaHeight - COMBAT_STATS_HEIGHT - COLUMN_GAP

  return { mainAreaHeight, columnsHeight }
}

/**
 * Desktop character layout inspired by DnD Beyond.
 * Left columns align to bottom, matching the height of right bottom.
 *
 * Structure:
 * +-----------------------------------------------------+
 * |                    TOP BAR                          |
 * +-----------------------------------------------------+
 * |                      |  +----------------------+    |
 * |                      |  |      RIGHT TOP       |    |
 * |  +------+  +------+  |  +----------------------+    |
 * |  | Col1 |  | Col2 |  |  |     RIGHT BOTTOM     |    |
 * |  |      |  |      |  |  |    (Tabbed Box)      |    |
 * |  +------+  +------+  |  +----------------------+    |
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
  const { mainAreaHeight, columnsHeight } = useLayoutHeights()

  // Only render on web
  if (Platform.OS !== 'web') {
    return null
  }

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
          padding={CONTENT_PADDING}
          gap={16}
          maxWidth={MAX_CONTENT_WIDTH}
          width="100%"
          alignSelf="center"
        >
          {/* Top bar */}
          <YStack>{topBar}</YStack>

          {/* Main area: left columns + right side */}
          <XStack gap={COLUMN_GAP} alignItems="flex-end">
            {/* Left columns - full height, aligned to bottom */}
            <XStack gap={COLUMN_GAP} height={mainAreaHeight}>
              {leftColumns}
            </XStack>

            {/* Right side */}
            <YStack gap={COLUMN_GAP} width={RIGHT_SIDE_WIDTH}>
              {/* Right top (combat stats) */}
              <YStack>{rightTop}</YStack>

              {/* Right bottom (tabbed box) */}
              <YStack height={columnsHeight}>
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
