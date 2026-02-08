import { useRef, useEffect } from 'react'
import { Pressable } from 'react-native'
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { XStack, Text } from 'tamagui'
import { useTheme } from '../../contexts/ThemeContext'

type BottomSheetProps = {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  /** Si se muestra el boton de cerrar. Default: true */
  showCloseButton?: boolean
  /** Altura del sheet como porcentaje (0-1). Default: 0.85 */
  heightPercent?: number
  /** Si el contenido debe ser scrollable. Default: true */
  scrollable?: boolean
}

/**
 * BottomSheet reutilizable basado en @gorhom/bottom-sheet.
 * Se desliza desde abajo con gesto nativo, fondo semitransparente.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  heightPercent = 0.85,
  scrollable = true,
}: BottomSheetProps) {
  const ref = useRef<BottomSheetModal>(null)
  const insets = useSafeAreaInsets()
  const { themeColors } = useTheme()

  const snapPoints = [`${Math.round(heightPercent * 100)}%`]

  useEffect(() => {
    if (visible) {
      ref.current?.present()
    } else {
      ref.current?.dismiss()
    }
  }, [visible])

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
      pressBehavior="close"
    />
  )

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: themeColors.background }}
      handleIndicatorStyle={{ backgroundColor: themeColors.placeholderColor }}
      enableDynamicSizing={false}
    >
      {/* Header */}
      {(title || showCloseButton) && (
        <XStack
          paddingHorizontal={16}
          paddingBottom={12}
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Text fontSize={18} fontWeight="700" color="$color">
            {title ?? ''}
          </Text>
          {showCloseButton && (
            <Pressable onPress={onClose} hitSlop={8}>
              <Text fontSize={16} color="$placeholderColor">
                Done
              </Text>
            </Pressable>
          )}
        </XStack>
      )}

      {/* Content */}
      {scrollable ? (
        <BottomSheetScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </BottomSheetScrollView>
      ) : (
        <BottomSheetView style={{ flex: 1 }}>
          {children}
        </BottomSheetView>
      )}
    </BottomSheetModal>
  )
}
