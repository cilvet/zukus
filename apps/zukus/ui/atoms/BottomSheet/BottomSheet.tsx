import { useEffect } from 'react'
import {
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack, XStack, Text, ScrollView } from 'tamagui'
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

/**
 * BottomSheet reutilizable.
 * Se desliza desde abajo, con fondo semitransparente.
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
  const insets = useSafeAreaInsets()
  const { themeColors } = useTheme()

  const sheetHeight = SCREEN_HEIGHT * heightPercent

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Sheet */}
        <YStack
          height={sheetHeight}
          backgroundColor={themeColors.background}
          borderTopLeftRadius={16}
          borderTopRightRadius={16}
          paddingBottom={insets.bottom}
          style={styles.sheet}
        >
          {/* Handle */}
          <YStack alignItems="center" paddingVertical={8}>
            <YStack
              width={40}
              height={4}
              borderRadius={2}
              backgroundColor="$borderColor"
            />
          </YStack>

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
            <ScrollView
              flex={1}
              contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <YStack flex={1} padding={16}>
              {children}
            </YStack>
          )}
        </YStack>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
})
