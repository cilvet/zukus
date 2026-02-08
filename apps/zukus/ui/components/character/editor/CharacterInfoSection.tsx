import { TextInput, StyleSheet, Pressable } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import type { Alignment } from '@zukus/core'
import { useTheme } from '../../../contexts/ThemeContext'
import {
  useCharacterStore,
  useCharacterName,
  useCharacterDescription,
  useCharacterAlignment,
  useCharacterBaseData,
} from '../../../stores/characterStore'
import { AlignmentGrid } from './AlignmentGrid'
import { ImagePlaceholder } from './ImagePlaceholder'
import { CharacterFieldsSection } from './CharacterFieldsSection'
import { BackgroundSection } from './BackgroundSection'

export type CharacterInfoSectionProps = {
  onRacePress?: () => void
}

/**
 * Seccion de informacion completa del personaje.
 * Incluye imagen, identidad, raza, alineamiento, datos fisicos y trasfondo.
 */
export function CharacterInfoSection({ onRacePress }: CharacterInfoSectionProps = {}) {
  const { themeColors } = useTheme()
  const name = useCharacterName()
  const description = useCharacterDescription()
  const alignment = useCharacterAlignment()
  const baseData = useCharacterBaseData()

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

      {/* Raza */}
      {onRacePress && (
        <YStack gap={12}>
          <Text fontSize={13} fontWeight="600" color="$placeholderColor">
            Raza
          </Text>
          <Pressable onPress={onRacePress}>
            {({ pressed }) => {
              const hasRace = !!baseData?.raceEntity
              return (
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  paddingVertical={12}
                  paddingHorizontal={12}
                  backgroundColor={hasRace ? '$uiBackgroundColor' : '$yellow3'}
                  borderWidth={1}
                  borderColor={hasRace ? '$borderColor' : '$yellow8'}
                  borderRadius={8}
                  opacity={pressed ? 0.7 : 1}
                >
                  <YStack flex={1}>
                    <Text
                      fontSize={14}
                      fontWeight={hasRace ? '500' : '400'}
                      color={hasRace ? '$color' : '$placeholderColor'}
                    >
                      {baseData?.raceEntity?.name ?? 'Seleccionar raza'}
                    </Text>
                  </YStack>
                  <FontAwesome6 name="chevron-right" size={12} color={themeColors.placeholderColor} />
                </XStack>
              )
            }}
          </Pressable>
        </YStack>
      )}

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
