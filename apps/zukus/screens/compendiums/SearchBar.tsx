import { View, TextInput, Pressable, StyleSheet } from 'react-native'
import { XStack } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { useTheme } from '../../ui'

type SearchBarProps = {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

/**
 * Barra de busqueda reutilizable.
 */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar...',
}: SearchBarProps) {
  const { themeColors } = useTheme()

  return (
    <XStack
      backgroundColor="$background"
      borderRadius={10}
      borderWidth={1}
      borderColor="$borderColor"
      paddingHorizontal={12}
      paddingVertical={10}
      alignItems="center"
      gap={10}
      maxWidth={400}
    >
      <FontAwesome6
        name="magnifying-glass"
        size={14}
        color={themeColors.placeholderColor}
      />
      <TextInput
        style={[styles.input, { color: themeColors.color }]}
        placeholder={placeholder}
        placeholderTextColor={themeColors.placeholderColor}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <FontAwesome6
            name="xmark"
            size={14}
            color={themeColors.placeholderColor}
          />
        </Pressable>
      )}
    </XStack>
  )
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
})
