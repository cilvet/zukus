import { YStack, ScrollView } from 'tamagui'

type LeftColumnProps = {
  children: React.ReactNode
  width?: number
  height?: number
}

/**
 * A scrollable column for the left side of the desktop layout.
 * Used for abilities, saving throws, skills, etc.
 */
export function LeftColumn({ children, width = 280, height }: LeftColumnProps) {
  return (
    <ScrollView
      width={width}
      height={height ?? '100%'}
      showsVerticalScrollIndicator={false}
      // @ts-ignore - CSS property for web
      scrollbarWidth="none"
    >
      <YStack gap={16} paddingRight={4} minHeight={height}>
        {children}
      </YStack>
    </ScrollView>
  )
}
