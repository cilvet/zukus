import { useState, useEffect } from 'react'
import { TextInput, StyleSheet } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import type { Buff } from '@zukus/core'
import { useTheme } from '../../contexts/ThemeContext'
import { ChangesSection } from './changes'

type BuffEditScreenProps = {
  buff: Buff
  /** Guardar y cerrar la pantalla */
  onSave: (buff: Buff) => void
  /** Solo guardar (sin cerrar) - para preservar estado antes de navegar */
  onUpdate: (buff: Buff) => void
  onDelete: () => void
  onCancel: () => void
}

/**
 * Pantalla de edición de buff.
 * Se usa como contenido de una pantalla de navegación normal.
 */
export function BuffEditScreen({
  buff,
  onSave,
  onUpdate,
  onDelete,
  onCancel,
}: BuffEditScreenProps) {
  const { themeColors } = useTheme()

  // Estado local solo para nombre y descripción
  const [name, setName] = useState(buff.name)
  const [description, setDescription] = useState(buff.description)

  // Sincronizar con el buff cuando cambia (ej: al volver de changeEdit)
  useEffect(() => {
    setName(buff.name)
    setDescription(buff.description)
  }, [buff])

  const handleSave = () => {
    const updatedBuff: Buff = {
      ...buff,
      name: name.trim() || buff.name,
      description: description.trim(),
    }
    onSave(updatedBuff)
  }

  // Guardar nombre y descripción al store antes de navegar a changeEdit
  const handleBeforeNavigate = () => {
    const updatedBuff: Buff = {
      ...buff,
      name: name.trim() || buff.name,
      description: description.trim(),
    }
    onUpdate(updatedBuff)
  }

  return (
    <YStack gap={20} padding={16}>
      {/* Nombre */}
      <YStack gap={8}>
        <Text fontSize={13} fontWeight="600" color="$placeholderColor">
          Name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Buff name"
          placeholderTextColor={themeColors.placeholderColor}
          style={[
            styles.input,
            {
              backgroundColor: themeColors.uiBackgroundColor,
              color: themeColors.color,
              borderColor: themeColors.borderColor,
            },
          ]}
        />
      </YStack>

      {/* Descripcion */}
      <YStack gap={8}>
        <Text fontSize={13} fontWeight="600" color="$placeholderColor">
          Description
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="What does this buff do?"
          placeholderTextColor={themeColors.placeholderColor}
          multiline
          numberOfLines={4}
          style={[
            styles.input,
            styles.textArea,
            {
              backgroundColor: themeColors.uiBackgroundColor,
              color: themeColors.color,
              borderColor: themeColors.borderColor,
            },
          ]}
        />
      </YStack>

      {/* Changes section - usa navegación para editar */}
      <ChangesSection
        buffId={buff.uniqueId}
        changes={buff.changes ?? []}
        onBeforeNavigate={handleBeforeNavigate}
      />

      {/* Botones de accion */}
      <XStack gap={12} marginTop={8}>
        <XStack
          flex={1}
          paddingVertical={12}
          paddingHorizontal={16}
          backgroundColor="$destructiveBackground"
          borderRadius={8}
          justifyContent="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={onDelete}
        >
          <Text fontSize={14} fontWeight="600" color="$destructiveColor">
            Delete
          </Text>
        </XStack>
        <XStack
          flex={2}
          paddingVertical={12}
          paddingHorizontal={16}
          backgroundColor="$accent"
          borderRadius={8}
          justifyContent="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={handleSave}
        >
          <Text fontSize={14} fontWeight="600" color="$accentContrastText">
            Save Changes
          </Text>
        </XStack>
      </XStack>
    </YStack>
  )
}

const styles = StyleSheet.create({
  input: {
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
})
