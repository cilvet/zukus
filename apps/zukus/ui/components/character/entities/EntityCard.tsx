import { Pressable } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import type { ComputedEntity } from '@zukus/core'
import { useLocalizedEntity } from '../../../hooks/useLocalizedEntity'

type EntityCardProps = {
  entity: ComputedEntity
  onPress?: () => void
}

function EntityIcon({ entityType }: { entityType: string }) {
  const label = entityType.slice(0, 2).toUpperCase()

  return (
    <YStack
      width={32}
      height={32}
      borderRadius={6}
      backgroundColor="$backgroundHover"
      borderWidth={1}
      borderColor="$borderColor"
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize={10} fontWeight="600" color="$placeholderColor">
        {label}
      </Text>
    </YStack>
  )
}

function SuppressedBadge() {
  return (
    <YStack
      paddingVertical={2}
      paddingHorizontal={6}
      borderRadius={4}
      backgroundColor="$backgroundPress"
    >
      <Text fontSize={9} color="$placeholderColor">
        Suprimido
      </Text>
    </YStack>
  )
}

export function EntityCard({ entity: rawEntity, onPress }: EntityCardProps) {
  const entity = useLocalizedEntity(rawEntity)
  const isSuppressed = rawEntity._meta.suppressed

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <XStack
          padding={10}
          backgroundColor="$uiBackgroundColor"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius={6}
          alignItems="center"
          gap={10}
          opacity={pressed ? 0.7 : isSuppressed ? 0.5 : 1}
        >
          <EntityIcon entityType={entity.entityType} />
          <YStack flex={1} gap={2}>
            <Text
              fontSize={14}
              fontWeight="600"
              color="$color"
              numberOfLines={1}
              textDecorationLine={isSuppressed ? 'line-through' : 'none'}
            >
              {entity.name}
            </Text>
            {entity.description ? (
              <Text
                fontSize={11}
                color="$placeholderColor"
                numberOfLines={1}
              >
                {entity.description}
              </Text>
            ) : null}
          </YStack>
          {isSuppressed ? <SuppressedBadge /> : null}
          <Text fontSize={16} color="$placeholderColor">
            {'>'}
          </Text>
        </XStack>
      )}
    </Pressable>
  )
}
