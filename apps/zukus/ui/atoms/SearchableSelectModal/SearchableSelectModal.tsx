import { useState, useMemo } from 'react'
import { Modal, TextInput, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { useTheme } from '../../contexts/ThemeContext'

const SEARCH_THRESHOLD = 15

type SelectOption = {
  value: string
  label: string
  description?: string
}

type SearchableSelectModalProps = {
  visible: boolean
  onClose: () => void
  title: string
  options: SelectOption[]
  selectedValue?: string
  onSelect: (value: string) => void
  placeholder?: string
}

export function SearchableSelectModal({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
  placeholder = 'Search...',
}: SearchableSelectModalProps) {
  'use no memo'
  const { themeColors } = useTheme()
  const [search, setSearch] = useState('')

  const showSearch = options.length > SEARCH_THRESHOLD

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options
    const query = search.toLowerCase()
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.value.toLowerCase().includes(query) ||
        opt.description?.toLowerCase().includes(query)
    )
  }, [options, search])

  const handleSelect = (value: string) => {
    onSelect(value)
    setSearch('')
    onClose()
  }

  const handleClose = () => {
    setSearch('')
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={handleClose} />

        {/* Bottom sheet content */}
        <View
          style={[
            styles.sheetContent,
            { backgroundColor: themeColors.background },
          ]}
        >
        {/* Handle bar */}
        <XStack justifyContent="center" paddingVertical={10}>
          <YStack
            width={36}
            height={4}
            backgroundColor="$placeholderColor"
            borderRadius={2}
            opacity={0.5}
          />
        </XStack>

        {/* Header */}
        <XStack
          paddingHorizontal={16}
          paddingBottom={12}
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Text fontSize={17} fontWeight="600" color="$color">
            {title}
          </Text>
          <Pressable onPress={handleClose}>
            <Text fontSize={15} color="$accent">
              Cancel
            </Text>
          </Pressable>
        </XStack>

        {/* Search - solo si hay más de 15 opciones */}
        {showSearch && (
          <YStack padding={16} paddingBottom={8}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={placeholder}
              placeholderTextColor={themeColors.placeholderColor}
              autoFocus
              style={[
                styles.searchInput,
                {
                  backgroundColor: themeColors.uiBackgroundColor,
                  color: themeColors.color,
                  borderColor: themeColors.borderColor,
                },
              ]}
            />
          </YStack>
        )}

        {/* Options list */}
        <ScrollView contentContainerStyle={styles.listContent}>
          {filteredOptions.length === 0 ? (
            <YStack padding={32} alignItems="center">
              <Text fontSize={14} color="$placeholderColor">
                No options found
              </Text>
            </YStack>
          ) : (
            filteredOptions.map((item, index) => {
              const isSelected = item.value === selectedValue
              return (
                <Pressable key={item.value} onPress={() => handleSelect(item.value)}>
                  {({ pressed }) => (
                    <YStack
                      paddingVertical={14}
                      paddingHorizontal={12}
                      backgroundColor={pressed ? '$uiBackgroundColor' : 'transparent'}
                      opacity={pressed ? 0.8 : 1}
                      borderBottomWidth={index < filteredOptions.length - 1 ? 1 : 0}
                      borderBottomColor="$borderColor"
                    >
                      <XStack alignItems="center" justifyContent="space-between">
                        <YStack flex={1} gap={2}>
                          <Text
                            fontSize={15}
                            fontWeight={isSelected ? '600' : '400'}
                            color={isSelected ? '$accent' : '$color'}
                          >
                            {item.label}
                          </Text>
                          {item.description && (
                            <Text fontSize={12} color="$placeholderColor" numberOfLines={1}>
                              {item.description}
                            </Text>
                          )}
                        </YStack>
                        {isSelected && (
                          <Text fontSize={16} color="$accent">
                            ✓
                          </Text>
                        )}
                      </XStack>
                    </YStack>
                  )}
                </Pressable>
              )
            })
          )}
        </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingBottom: 32,
  },
  searchInput: {
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: 16,
  },
})
