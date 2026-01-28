import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, Text } from 'tamagui'
import { useComputedEntities, EntityTypeGroup } from '../../../ui'
import { SectionHeader } from '../CharacterComponents'
import { useNavigateToDetail } from '../../../navigation'
import type { ComputedEntity } from '@zukus/core'

function groupEntitiesByType(entities: readonly ComputedEntity[]): Record<string, ComputedEntity[]> {
  const groups: Record<string, ComputedEntity[]> = {}

  for (const entity of entities) {
    const type = entity.entityType
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(entity)
  }

  return groups
}

export function EntitiesSection() {
  const computedEntities = useComputedEntities()
  const navigateToDetail = useNavigateToDetail()

  const entitiesByType = groupEntitiesByType(computedEntities)
  const entityTypes = Object.keys(entitiesByType).sort()

  const handleEntityPress = (entity: ComputedEntity) => {
    navigateToDetail('computedEntity', entity.id, entity.name)
  }

  if (computedEntities.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <YStack padding={16}>
          <YStack gap={12}>
            <SectionHeader icon="E" title="Sin entidades" />
            <Text fontSize={12} color="$placeholderColor" padding={8}>
              No hay entidades computadas para este personaje.
            </Text>
          </YStack>
        </YStack>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }} collapsable={false}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 20 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <SectionHeader icon="E" title="Entidades" />
        {entityTypes.map((entityType) => (
          <EntityTypeGroup
            key={entityType}
            entityType={entityType}
            entities={entitiesByType[entityType]}
            onEntityPress={handleEntityPress}
          />
        ))}
      </ScrollView>
    </View>
  )
}
