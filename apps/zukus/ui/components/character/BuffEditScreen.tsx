import { TextInput, StyleSheet } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import type { Buff } from '@zukus/core'
import { useTheme } from '../../contexts/ThemeContext'
import { ChangesSection } from './changes'
import { useBuffEditActions } from '../../stores/buffEditStore'
import { Button } from '../../atoms'

type BuffEditScreenProps = {
  buff: Buff
  onSave: () => void
  onDelete: () => void
  onCancel: () => void
}

/**
 * Pantalla de edición de buff.
 * Lee y escribe directamente al buffEditStore (draft).
 */
export function BuffEditScreen({
  buff,
  onSave,
  onDelete,
  onCancel,
}: BuffEditScreenProps) {
  const { themeColors } = useTheme()
  const { updateDraft } = useBuffEditActions()

  const handleNameChange = (value: string) => {
    updateDraft({ name: value })
  }

  const handleDescriptionChange = (value: string) => {
    updateDraft({ description: value })
  }

  const handleSave = () => {
    // Limpiar nombre si esta vacio
    if (!buff.name.trim()) {
      updateDraft({ name: 'Unnamed Buff' })
    }
    onSave()
  }

  return (
    <YStack gap={20} padding={16}>
      {/* Nombre */}
      <YStack gap={8}>
        <Text fontSize={13} fontWeight="600" color="$placeholderColor">
          Name
        </Text>
        <TextInput
          value={buff.name}
          onChangeText={handleNameChange}
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
          value={buff.description}
          onChangeText={handleDescriptionChange}
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
      />

      {/* Botones de accion */}
      <XStack gap={12} marginTop={8}>
        <Button variant="destructive" onPress={onDelete} fullWidth>
          Delete
        </Button>
        <XStack flex={2}>
          <Button variant="primary" onPress={handleSave} fullWidth>
            Save Changes
          </Button>
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
