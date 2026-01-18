import { Platform, Pressable } from 'react-native'
import { Text, XStack, YStack, ScrollView } from 'tamagui'
import { useTheme } from '../../ui'

type SidePanelProps = {
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
  canGoBack?: boolean
  title?: string
  children: React.ReactNode
  isLeftSide?: boolean
}

function HeaderButton({
  onPress,
  children,
}: {
  onPress: () => void
  children: React.ReactNode
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      {({ pressed }) => (
        <XStack
          width={32}
          height={32}
          alignItems="center"
          justifyContent="center"
          borderRadius={4}
          backgroundColor={pressed ? '$backgroundHover' : '$uiBackgroundColor'}
          borderWidth={1}
          borderColor="$borderColor"
        >
          {children}
        </XStack>
      )}
    </Pressable>
  )
}

export function SidePanel({
  isOpen,
  onClose,
  onBack,
  canGoBack = false,
  title = 'Panel',
  children,
  isLeftSide = false,
}: SidePanelProps) {
  const { themeColors } = useTheme()

  // Solo renderizar en web
  if (Platform.OS !== 'web') {
    return null
  }

  if (!isOpen) {
    return null
  }

  return (
    <YStack
      x={0}
      opacity={1}
      position="absolute"
      top={8}
      bottom={8}
      right={isLeftSide ? undefined : 8}
      left={isLeftSide ? 8 : undefined}
      width="100%"
      maxWidth={350}
      backgroundColor={themeColors.background}
      borderWidth={1}
      borderRadius={8}
      borderColor={themeColors.borderColor}
      padding={8}
      zIndex={1000}
      // Web shadow via style
      {...(Platform.OS === 'web' && {
        style: { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)' } as any,
      })}
    >
      {/* Header */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal={12}
        paddingVertical={10}
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        marginBottom={8}
      >
        <XStack alignItems="center" gap={8} flex={1}>
          {canGoBack && onBack && (
            <HeaderButton onPress={onBack}>
              <Text fontSize={16} color="$color">
                ←
              </Text>
            </HeaderButton>
          )}
          <Text
            fontSize={16}
            fontWeight="700"
            color="$color"
            letterSpacing={1}
            textTransform="uppercase"
            numberOfLines={1}
            flex={1}
          >
            {title}
          </Text>
        </XStack>

        <HeaderButton onPress={onClose}>
          <Text fontSize={16} color="$color">
            x
          </Text>
        </HeaderButton>
      </XStack>

      {/* Content */}
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </YStack>
  )
}

/**
 * Wrapper con position relative para el SidePanel absoluto
 */
export function SidePanelContainer({ children }: { children: React.ReactNode }) {
  return (
    <YStack position="relative" flex={1} overflow="hidden">
      {children}
    </YStack>
  )
}
