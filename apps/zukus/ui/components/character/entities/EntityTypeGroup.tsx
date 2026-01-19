import { YStack, Text, XStack } from 'tamagui'
import type { ComputedEntity } from '@zukus/core'
import { EntityCard } from './EntityCard'

type EntityTypeGroupProps = {
  entityType: string
  entities: ComputedEntity[]
  onEntityPress: (entity: ComputedEntity) => void
}

function formatEntityTypeName(entityType: string): string {
  return entityType
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function EntityTypeHeader({ entityType, count }: { entityType: string; count: number }) {
  const displayName = formatEntityTypeName(entityType)

  return (
    <XStack alignItems="center" gap={8} paddingBottom={8}>
      <Text fontSize={13} fontWeight="700" color="$color" textTransform="uppercase">
        {displayName}
      </Text>
      <YStack
        paddingVertical={2}
        paddingHorizontal={6}
        borderRadius={10}
        backgroundColor="$backgroundHover"
      >
        <Text fontSize={11} fontWeight="600" color="$placeholderColor">
          {count}
        </Text>
      </YStack>
    </XStack>
  )
}

export function EntityTypeGroup({ entityType, entities, onEntityPress }: EntityTypeGroupProps) {
  if (entities.length === 0) {
    return null
  }

  return (
    <YStack gap={8}>
      <EntityTypeHeader entityType={entityType} count={entities.length} />
      <YStack gap={6}>
        {entities.map((entity, index) => (
          <EntityCard
            key={`${entity.id}-${index}`}
            entity={entity}
            onPress={() => onEntityPress(entity)}
          />
        ))}
      </YStack>
    </YStack>
  )
}
