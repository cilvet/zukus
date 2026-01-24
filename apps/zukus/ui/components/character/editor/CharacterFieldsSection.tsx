import { TextInput, StyleSheet } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { useTheme } from '../../../contexts/ThemeContext'
import {
  useCharacterStore,
  useCharacterPhysicalTraits,
} from '../../../stores/characterStore'

type FieldConfig = {
  key: 'age' | 'gender' | 'height' | 'weight' | 'eyes' | 'hair' | 'skin'
  label: string
  placeholder: string
}

const FIELDS_ROW_1: FieldConfig[] = [
  { key: 'age', label: 'Edad', placeholder: '25' },
  { key: 'gender', label: 'Genero', placeholder: 'Masculino' },
]

const FIELDS_ROW_2: FieldConfig[] = [
  { key: 'height', label: 'Altura', placeholder: "1.75m" },
  { key: 'weight', label: 'Peso', placeholder: '70kg' },
]

const FIELDS_SINGLE: FieldConfig[] = [
  { key: 'eyes', label: 'Ojos', placeholder: 'Marrones' },
  { key: 'hair', label: 'Cabello', placeholder: 'Negro' },
  { key: 'skin', label: 'Piel', placeholder: 'Morena' },
]

/**
 * Seccion de datos fisicos del personaje.
 * Incluye edad, genero, altura, peso, ojos, cabello y piel.
 */
export function CharacterFieldsSection() {
  const { themeColors } = useTheme()
  const traits = useCharacterPhysicalTraits()

  const updateAge = useCharacterStore((state) => state.updateAge)
  const updateGender = useCharacterStore((state) => state.updateGender)
  const updateHeight = useCharacterStore((state) => state.updateHeight)
  const updateWeight = useCharacterStore((state) => state.updateWeight)
  const updateEyes = useCharacterStore((state) => state.updateEyes)
  const updateHair = useCharacterStore((state) => state.updateHair)
  const updateSkin = useCharacterStore((state) => state.updateSkin)

  const updateFns = {
    age: updateAge,
    gender: updateGender,
    height: updateHeight,
    weight: updateWeight,
    eyes: updateEyes,
    hair: updateHair,
    skin: updateSkin,
  }

  const inputStyle = [
    styles.input,
    {
      backgroundColor: themeColors.uiBackgroundColor,
      color: themeColors.color,
      borderColor: themeColors.borderColor,
    },
  ]

  const renderField = (field: FieldConfig, flex?: number) => (
    <YStack key={field.key} gap={6} flex={flex}>
      <Text fontSize={12} color="$placeholderColor">
        {field.label}
      </Text>
      <TextInput
        value={traits[field.key]}
        onChangeText={(value) => updateFns[field.key](value)}
        placeholder={field.placeholder}
        placeholderTextColor={themeColors.placeholderColor}
        style={inputStyle}
      />
    </YStack>
  )

  return (
    <YStack gap={12}>
      <Text fontSize={13} fontWeight="600" color="$placeholderColor">
        Datos Fisicos
      </Text>

      {/* Fila 1: Edad y Genero */}
      <XStack gap={12}>
        {FIELDS_ROW_1.map((field) => renderField(field, 1))}
      </XStack>

      {/* Fila 2: Altura y Peso */}
      <XStack gap={12}>
        {FIELDS_ROW_2.map((field) => renderField(field, 1))}
      </XStack>

      {/* Campos individuales: Ojos, Cabello, Piel */}
      {FIELDS_SINGLE.map((field) => renderField(field))}
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
})
