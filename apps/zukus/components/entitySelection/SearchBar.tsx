import { Pressable, TextInput, StyleSheet } from 'react-native'
import { XStack } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'

export type SearchBarProps = {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  textColor: string
  placeholderColor: string
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar...',
  textColor,
  placeholderColor,
}: SearchBarProps) {
  return (
    <XStack
      flex={1}
      backgroundColor="$background"
      borderRadius={10}
      borderWidth={1}
      borderColor="$borderColor"
      paddingHorizontal={12}
      paddingVertical={8}
      alignItems="center"
      gap={8}
    >
      <FontAwesome6 name="magnifying-glass" size={14} color={placeholderColor} />
      <TextInput
        style={[styles.searchInput, { color: textColor }]}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        testID="search-input"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8} testID="search-clear">
          <FontAwesome6 name="xmark" size={14} color={placeholderColor} />
        </Pressable>
      )}
    </XStack>
  )
}

const styles = StyleSheet.create({
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
})
