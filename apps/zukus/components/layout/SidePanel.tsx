import { useRef, useState, useCallback, useEffect } from 'react'
import { Platform, Pressable } from 'react-native'
import { Text, XStack, YStack, ScrollView } from 'tamagui'
import { useTheme } from '../../ui'

const MIN_PANEL_WIDTH = 280
const MAX_PANEL_WIDTH = 600
const DEFAULT_PANEL_WIDTH = 350
const RESIZE_HANDLE_WIDTH = 8

type SidePanelProps = {
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
  canGoBack?: boolean
  title?: string
  children: React.ReactNode
  isLeftSide?: boolean
  disableScroll?: boolean
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

function ResizeHandle({
  onResizeStart,
  isLeftSide,
}: {
  onResizeStart: (e: React.MouseEvent) => void
  isLeftSide: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  const positionStyle = isLeftSide
    ? { right: -RESIZE_HANDLE_WIDTH / 2, left: undefined }
    : { left: -RESIZE_HANDLE_WIDTH / 2, right: undefined }

  return (
    <div
      onMouseDown={onResizeStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        ...positionStyle,
        width: RESIZE_HANDLE_WIDTH,
        cursor: 'col-resize',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Visual indicator */}
      <div
        style={{
          width: 3,
          height: 40,
          borderRadius: 2,
          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
          transition: 'background-color 0.15s ease',
        }}
      />
    </div>
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
  disableScroll = false,
}: SidePanelProps) {
  const { themeColors } = useTheme()
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(DEFAULT_PANEL_WIDTH)

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = panelWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [panelWidth])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = isLeftSide
        ? e.clientX - startXRef.current
        : startXRef.current - e.clientX

      const newWidth = Math.min(
        MAX_PANEL_WIDTH,
        Math.max(MIN_PANEL_WIDTH, startWidthRef.current + delta)
      )
      setPanelWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, isLeftSide])

  // Solo renderizar en web
  if (Platform.OS !== 'web') {
    return null
  }

  if (!isOpen) {
    return null
  }

  return (
    <>
      {/* Overlay to capture all mouse events during resize */}
      {isResizing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            cursor: 'col-resize',
          }}
        />
      )}
      <YStack
        x={0}
        opacity={1}
        position="absolute"
        top={8}
        bottom={8}
        right={isLeftSide ? undefined : 8}
        left={isLeftSide ? 8 : undefined}
        width={panelWidth}
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
        {/* Resize handle */}
        <ResizeHandle onResizeStart={handleResizeStart} isLeftSide={isLeftSide} />
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
      {disableScroll ? (
        <YStack flex={1} minHeight={0}>
          {children}
        </YStack>
      ) : (
        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      )}
    </YStack>
    </>
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
