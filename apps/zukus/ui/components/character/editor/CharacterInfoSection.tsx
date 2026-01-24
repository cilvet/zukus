import { TextInput, StyleSheet } from 'react-native'
import { YStack, Text } from 'tamagui'
import type { Alignment } from '@zukus/core'
import { useTheme } from '../../../contexts/ThemeContext'
import {
  useCharacterStore,
  useCharacterName,
  useCharacterDescription,
  useCharacterAlignment,
} from '../../../stores/characterStore'
import { AlignmentGrid } from './AlignmentGrid'
import { ImagePlaceholder } from './ImagePlaceholder'
import { CharacterFieldsSection } from './CharacterFieldsSection'
import { BackgroundSection } from './BackgroundSection'

/**
 * Seccion de informacion completa del personaje.
 * Incluye imagen, identidad, alineamiento, datos fisicos y trasfondo.
 */
export function CharacterInfoSection() {
  const { themeColors } = useTheme()
  const name = useCharacterName()
  const description = useCharacterDescription()
  const alignment = useCharacterAlignment()

  const updateName = useCharacterStore((state) => state.updateName)
  const updateDescription = useCharacterStore((state) => state.updateDescription)
  const updateAlignment = useCharacterStore((state) => state.updateAlignment)

  const handleNameChange = (value: string) => {
    updateName(value)
  }

  const handleDescriptionChange = (value: string) => {
    updateDescription(value)
  }

  const handleAlignmentChange = (newAlignment: Alignment | null) => {
    updateAlignment(newAlignment)
  }

  const inputStyle = [
    styles.input,
    {
      backgroundColor: themeColors.uiBackgroundColor,
      color: themeColors.color,
      borderColor: themeColors.borderColor,
    },
  ]

  return (
    <YStack gap={24} padding={16}>
      {/* Imagen del personaje */}
      <ImagePlaceholder />

      {/* Identidad */}
      <YStack gap={12}>
        <Text fontSize={13} fontWeight="600" color="$placeholderColor">
          Identidad
        </Text>

        {/* Nombre */}
        <YStack gap={6}>
          <Text fontSize={12} color="$placeholderColor">
            Nombre
          </Text>
          <TextInput
            value={name}
            onChangeText={handleNameChange}
            placeholder="Nombre del personaje"
            placeholderTextColor={themeColors.placeholderColor}
            style={inputStyle}
          />
        </YStack>

        {/* Descripcion */}
        <YStack gap={6}>
          <Text fontSize={12} color="$placeholderColor">
            Descripcion
          </Text>
          <TextInput
            value={description}
            onChangeText={handleDescriptionChange}
            placeholder="Descripcion del personaje..."
            placeholderTextColor={themeColors.placeholderColor}
            multiline
            numberOfLines={4}
            style={[inputStyle, styles.textArea]}
          />
        </YStack>
      </YStack>

      {/* Alineamiento */}
      <YStack gap={12}>
        <Text fontSize={13} fontWeight="600" color="$placeholderColor">
          Alineamiento
        </Text>
        <AlignmentGrid value={alignment} onChange={handleAlignmentChange} />
      </YStack>

      {/* Datos Fisicos */}
      <CharacterFieldsSection />

      {/* Trasfondo */}
      <BackgroundSection />
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
})
