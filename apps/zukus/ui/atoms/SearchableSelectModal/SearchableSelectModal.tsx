import { useState } from 'react'
import { TextInput, Pressable, StyleSheet } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { useTheme } from '../../contexts/ThemeContext'
import { BottomSheet, BottomSheetScrollView } from '../BottomSheet'

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

  const query = search.trim().toLowerCase()
  const filteredOptions = query
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(query) ||
          opt.value.toLowerCase().includes(query) ||
          opt.description?.toLowerCase().includes(query)
      )
    : options

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
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title={title}
      heightPercent={0.7}
      scrollable={false}
    >
      {/* Search - solo si hay mas de 15 opciones */}
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
      <BottomSheetScrollView contentContainerStyle={styles.listContent}>
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
      </BottomSheetScrollView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
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
