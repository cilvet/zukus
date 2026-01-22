import { Pressable } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { ChangeCard } from './ChangeCard'
import type { AnyChange } from './changeHelpers'
import { useNavigateToDetail } from '../../../../navigation'

type ChangesSectionProps = {
  buffId: string
  changes: AnyChange[]
  /** Callback opcional cuando se actualizan los changes (para guardar al store primero) */
  onBeforeNavigate?: () => void
}

/**
 * Sección que muestra la lista de Changes de un buff.
 * Usa navegación para editar changes.
 */
export function ChangesSection({ buffId, changes, onBeforeNavigate }: ChangesSectionProps) {
  'use no memo'
  const navigateToDetail = useNavigateToDetail()

  const handleEditChange = (index: number) => {
    onBeforeNavigate?.()
    navigateToDetail('changeEdit', `${buffId}:${index}`)
  }

  const handleAddNew = () => {
    onBeforeNavigate?.()
    navigateToDetail('changeEdit', `${buffId}:new`, 'New Change')
  }

  return (
    <YStack gap={12}>
      {/* Header */}
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontSize={13} fontWeight="600" color="$placeholderColor">
          Changes
        </Text>
        <Pressable onPress={handleAddNew}>
          {({ pressed }) => (
            <XStack
              paddingVertical={4}
              paddingHorizontal={10}
              backgroundColor="$accent"
              borderRadius={6}
              opacity={pressed ? 0.7 : 1}
            >
              <Text fontSize={12} fontWeight="600" color="$accentContrastText">
                + Add
              </Text>
            </XStack>
          )}
        </Pressable>
      </XStack>

      {/* Lista de changes */}
      {changes.length === 0 ? (
        <YStack
          padding={16}
          backgroundColor="$uiBackgroundColor"
          borderRadius={8}
          borderWidth={1}
          borderColor="$borderColor"
          borderStyle="dashed"
          alignItems="center"
        >
          <Text fontSize={13} color="$placeholderColor">
            No changes yet
          </Text>
          <Text fontSize={12} color="$placeholderColor" marginTop={4}>
            Tap "+ Add" to create one
          </Text>
        </YStack>
      ) : (
        <YStack gap={8}>
          {changes.map((change, index) => (
            <ChangeCard
              key={`change-${index}`}
              change={change}
              onPress={() => handleEditChange(index)}
            />
          ))}
        </YStack>
      )}
    </YStack>
  )
}
