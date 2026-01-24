import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { Text, YStack, XStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useTheme } from '../../ui'
import type { CharacterPage } from './data'

type MoreOptionsSheetProps = {
  visible: boolean
  pages: CharacterPage[]
  currentPage: number
  startIndex: number
  onSelect: (index: number) => void
  onClose: () => void
}

/**
 * Bottom sheet con las opciones adicionales del CharacterScreen.
 * Se abre desde la tab "Mas" cuando hay mas de 5 paginas.
 */
export function MoreOptionsSheet({
  visible,
  pages,
  currentPage,
  startIndex,
  onSelect,
  onClose,
}: MoreOptionsSheetProps) {
  const { themeColors } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <YStack
          backgroundColor={themeColors.background}
          borderTopLeftRadius={16}
          borderTopRightRadius={16}
          paddingTop={16}
          paddingBottom={insets.bottom + 16}
          paddingHorizontal={16}
        >
          {/* Handle indicator */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: themeColors.placeholderColor }]} />
          </View>

          {/* Title */}
          <Text fontSize={16} fontWeight="700" color="$color" marginBottom={16}>
            Secciones
          </Text>

          {/* Options */}
          {pages.map((page, index) => {
            const realIndex = startIndex + index
            const isActive = currentPage === realIndex
            return (
              <Pressable
                key={page.key}
                onPress={() => onSelect(realIndex)}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: isActive
                      ? themeColors.uiBackgroundColor
                      : pressed
                        ? themeColors.backgroundHover
                        : 'transparent',
                  },
                ]}
              >
                <XStack alignItems="center" gap={12} paddingVertical={14} paddingHorizontal={16}>
                  <FontAwesome
                    name={page.icon}
                    size={18}
                    color={isActive ? themeColors.color : themeColors.placeholderColor}
                  />
                  <Text
                    fontSize={15}
                    fontWeight={isActive ? '600' : '400'}
                    color={isActive ? '$color' : '$placeholderColor'}
                    flex={1}
                  >
                    {page.label}
                  </Text>
                  {isActive && (
                    <FontAwesome name="check" size={16} color={themeColors.color} />
                  )}
                </XStack>
              </Pressable>
            )
          })}
        </YStack>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  option: {
    borderRadius: 10,
    marginBottom: 4,
  },
})
