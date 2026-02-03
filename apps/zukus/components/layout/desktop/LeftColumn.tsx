import { YStack, ScrollView } from 'tamagui'

type LeftColumnProps = {
  children: React.ReactNode
  width?: number
}

/**
 * A scrollable column for the left side of the desktop layout.
 * Used for abilities, saving throws, skills, etc.
 */
export function LeftColumn({ children, width = 280 }: LeftColumnProps) {
  return (
    <ScrollView
      width={width}
      flex={1}
      showsVerticalScrollIndicator={false}
      // @ts-ignore - CSS property for web
      scrollbarWidth="none"
    >
      <YStack gap={16} paddingRight={4}>
        {children}
      </YStack>
    </ScrollView>
  )
}
