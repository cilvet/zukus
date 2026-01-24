import { TextInput, StyleSheet } from 'react-native'
import { YStack, Text } from 'tamagui'
import { useTheme } from '../../../contexts/ThemeContext'
import {
  useCharacterStore,
  useCharacterBackgroundInfo,
} from '../../../stores/characterStore'

/**
 * Seccion de trasfondo del personaje.
 * Incluye deidad e historia/background.
 */
export function BackgroundSection() {
  const { themeColors } = useTheme()
  const { deity, background } = useCharacterBackgroundInfo()

  const updateDeity = useCharacterStore((state) => state.updateDeity)
  const updateBackground = useCharacterStore((state) => state.updateBackground)

  const inputStyle = [
    styles.input,
    {
      backgroundColor: themeColors.uiBackgroundColor,
      color: themeColors.color,
      borderColor: themeColors.borderColor,
    },
  ]

  return (
    <YStack gap={12}>
      <Text fontSize={13} fontWeight="600" color="$placeholderColor">
        Trasfondo
      </Text>

      {/* Deidad */}
      <YStack gap={6}>
        <Text fontSize={12} color="$placeholderColor">
          Deidad
        </Text>
        <TextInput
          value={deity}
          onChangeText={updateDeity}
          placeholder="Pelor, Heironeous..."
          placeholderTextColor={themeColors.placeholderColor}
          style={inputStyle}
        />
      </YStack>

      {/* Historia */}
      <YStack gap={6}>
        <Text fontSize={12} color="$placeholderColor">
          Historia
        </Text>
        <TextInput
          value={background}
          onChangeText={updateBackground}
          placeholder="La historia de tu personaje..."
          placeholderTextColor={themeColors.placeholderColor}
          multiline
          numberOfLines={6}
          style={[inputStyle, styles.textArea]}
        />
      </YStack>
    </YStack>
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
})
