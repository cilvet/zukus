import { useState } from 'react'
import { Modal, Pressable, StyleSheet } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Text, XStack, YStack } from 'tamagui'
import { useTheme } from '@zukus/ui'
import { CHARACTER_PAGES } from './data'

type CharacterTabsProps = {
  currentPage: number
  onPageChange: (index: number) => void
}

/**
 * Barra de navegación estilo D&D Beyond.
 * Muestra la tab actual y abre un modal para seleccionar otras.
 */
export function CharacterTabs({ currentPage, onPageChange }: CharacterTabsProps) {
  const { themeColors } = useTheme()
  const [modalVisible, setModalVisible] = useState(false)

  const currentTab = CHARACTER_PAGES[currentPage]

  function handleSelectTab(index: number) {
    onPageChange(index)
    setModalVisible(false)
  }

  return (
    <>
      <Pressable onPress={() => setModalVisible(true)}>
        <XStack
          paddingHorizontal={16}
          paddingVertical={12}
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor={themeColors.borderColor}
        >
          <XStack alignItems="center" gap={8}>
            <FontAwesome name={currentTab.icon} size={16} color={themeColors.color} />
            <Text fontSize={14} fontWeight="600" color="$color">
              {currentTab.label}
            </Text>
          </XStack>
          <FontAwesome name="th" size={18} color={themeColors.placeholderColor} />
        </XStack>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <YStack
            backgroundColor={themeColors.background}
            borderRadius={12}
            padding={8}
            minWidth={280}
            style={styles.modalContent}
          >
            {CHARACTER_PAGES.map((page, index) => {
              const isActive = index === currentPage
              return (
                <Pressable
                  key={page.key}
                  onPress={() => handleSelectTab(index)}
                  style={[
                    styles.modalItem,
                    { backgroundColor: isActive ? themeColors.uiBackgroundColor : 'transparent' },
                  ]}
                >
                  <XStack alignItems="center" gap={12} paddingVertical={12} paddingHorizontal={16}>
                    <FontAwesome
                      name={page.icon}
                      size={16}
                      color={isActive ? themeColors.color : themeColors.placeholderColor}
                    />
                    <Text
                      fontSize={14}
                      fontWeight={isActive ? '600' : '400'}
                      color={isActive ? '$color' : '$placeholderColor'}
                    >
                      {page.label}
                    </Text>
                  </XStack>
                </Pressable>
              )
            })}
          </YStack>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalItem: {
    borderRadius: 8,
  },
})
