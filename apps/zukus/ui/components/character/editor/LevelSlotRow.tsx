import { Pressable } from 'react-native'
import { XStack, Text } from 'tamagui'
import type { LevelSlot, ClassEntity } from '@zukus/core'
import { LevelProgressIndicator } from './LevelProgressIndicator'

type LevelSlotRowProps = {
  levelIndex: number
  slot: LevelSlot
  classLevel: number
  isActive: boolean
  isNextActive: boolean
  isFirstLevel: boolean
  isLastLevel: boolean
  classEntities: Record<string, ClassEntity> | undefined
  onRowPress: (levelIndex: number) => void
  onLevelActivate: (level: number) => void
}

function getClassName(
  classId: string | null,
  classEntities: Record<string, ClassEntity> | undefined
): string {
  if (!classId) {
    return '---'
  }
  if (classEntities && classEntities[classId]) {
    return classEntities[classId].name
  }
  return classId
}

export function LevelSlotRow({
  levelIndex,
  slot,
  classLevel,
  isActive,
  isNextActive,
  isFirstLevel,
  isLastLevel,
  classEntities,
  onRowPress,
  onLevelActivate,
}: LevelSlotRowProps) {
  const levelNumber = levelIndex + 1

  function handleDotPress() {
    onLevelActivate(levelNumber)
  }

  function handleRowPress() {
    onRowPress(levelIndex)
  }

  const opacity = isActive ? 1 : 0.5
  const className = getClassName(slot.classId, classEntities)
  const classDisplay = slot.classId ? `${className} ${classLevel}` : '---'

  return (
    <Pressable onPress={handleRowPress}>
      {({ pressed }) => (
        <XStack
          alignItems="stretch"
          opacity={opacity}
          paddingLeft="$2"
          backgroundColor={pressed ? '$backgroundHover' : 'transparent'}
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <LevelProgressIndicator
            isCompleted={isActive}
            isFirstLevel={isFirstLevel}
            isLastLevel={isLastLevel}
            isNextCompleted={isNextActive}
            onDotPress={handleDotPress}
          />

          <XStack
            flex={1}
            alignItems="center"
            gap="$2"
            paddingVertical="$2"
            paddingRight="$2"
          >
            <XStack alignItems="center" gap="$1" width={80}>
              <Text fontWeight="600" color="$color">
                Nivel {levelNumber}
              </Text>
            </XStack>

            <Text flex={1} color={slot.classId ? '$color' : '$placeholderColor'}>
              {classDisplay}
            </Text>
          </XStack>
        </XStack>
      )}
    </Pressable>
  )
}
