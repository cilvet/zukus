/**
 * ClassSelectorDetail - Panel for selecting a class for a level slot
 *
 * Shows a list of available classes from the compendium.
 * Each row displays the class name and hit die.
 * Selected class shows a green checkmark.
 */

import { YStack, XStack, Text, ScrollView } from 'tamagui'
import FontAwesome from '@expo/vector-icons/FontAwesome'

export type ClassOption = {
  id: string
  name: string
  hitDie: number
}

export type ClassSelectorDetailProps = {
  levelIndex: number
  currentClassId: string | null
  availableClasses: ClassOption[]
  onSelectClass: (classId: string) => void
  onClose: () => void
}

export function ClassSelectorDetail({
  levelIndex,
  currentClassId,
  availableClasses,
  onSelectClass,
  onClose,
}: ClassSelectorDetailProps) {
  const levelNumber = levelIndex + 1

  function handleSelectClass(classId: string) {
    onSelectClass(classId)
    onClose()
  }

  return (
    <ScrollView>
      <YStack padding="$4" gap="$4">
        {/* Header */}
        <YStack gap="$1">
          <Text fontSize={22} fontWeight="700" color="$color">
            Seleccionar Clase
          </Text>
          <Text fontSize={14} color="$placeholderColor">
            Nivel {levelNumber}
          </Text>
        </YStack>

        {/* Class options */}
        <YStack gap="$2">
          <Text fontSize={14} fontWeight="600" color="$placeholderColor">
            Clases disponibles
          </Text>
          <YStack gap="$1">
            {availableClasses.map((classOption) => {
              const isSelected = currentClassId === classOption.id

              return (
                <XStack
                  key={classOption.id}
                  width="100%"
                  paddingVertical="$2"
                  paddingHorizontal="$3"
                  backgroundColor={isSelected ? '$green3' : '$background'}
                  borderRadius="$2"
                  borderWidth={1}
                  borderColor={isSelected ? '$green9' : '$borderColor'}
                  alignItems="center"
                  gap="$2"
                  cursor="pointer"
                  hoverStyle={{ backgroundColor: isSelected ? '$green4' : '$backgroundHover' }}
                  pressStyle={{ backgroundColor: isSelected ? '$green4' : '$backgroundPress' }}
                  onPress={() => handleSelectClass(classOption.id)}
                >
                  {isSelected && <FontAwesome name="check" size={18} color="#22c55e" />}

                  <YStack flex={1}>
                    <Text fontSize={16} fontWeight="500" color="$color">
                      {classOption.name}
                    </Text>
                    <Text fontSize={12} color="$placeholderColor">
                      Hit Die: d{classOption.hitDie}
                    </Text>
                  </YStack>
                </XStack>
              )
            })}
          </YStack>
        </YStack>
      </YStack>
    </ScrollView>
  )
}
