'use no memo'

import { YStack } from 'tamagui'
import { EntitySelectionView } from '../../../../components/entitySelection'
import type { ClassOption } from './levelEditorHelpers'
import type { StandardEntity, EntityInstance, FilterResult } from '@zukus/core'

type QuickBuildClassSelectorProps = {
  availableClasses: ClassOption[]
  currentClassId: string | null
  onSelect: (classId: string) => void
}

/**
 * Full-page class selector using EntitySelectionView in selection mode.
 * Used by QuickBuild on both mobile (Modal) and desktop (SidePanel).
 */
export function QuickBuildClassSelector({
  availableClasses,
  currentClassId,
  onSelect,
}: QuickBuildClassSelectorProps) {
  const classEntities: StandardEntity[] = availableClasses.map((cls) => ({
    id: cls.id,
    entityType: 'class',
    name: cls.name,
    description: `Hit Die: d${cls.hitDie}`,
    tags: [],
  }))

  const selectedEntities: EntityInstance[] = currentClassId
    ? [{
        instanceId: `${currentClassId}@quick-build`,
        entity: classEntities.find((e) => e.id === currentClassId) ?? {
          id: currentClassId,
          entityType: 'class',
          name: currentClassId,
          tags: [],
        },
        applicable: true,
        origin: 'custom',
      }]
    : []

  const eligibleEntities: FilterResult<StandardEntity>[] = classEntities.map((entity) => ({
    entity,
    matches: true,
    evaluatedConditions: [],
  }))

  return (
    <YStack flex={1}>
      <EntitySelectionView
        entities={classEntities}
        modeConfig={{
          mode: 'selection',
          selectedEntities,
          eligibleEntities,
          onSelect: (entityId) => onSelect(entityId),
          onDeselect: () => {},
          min: 1,
          max: 1,
          selectionLabel: 'Clase',
        }}
        onEntityPress={(entity) => onSelect(entity.id)}
        emptyText="No hay clases disponibles"
        resultLabelSingular="clase"
        resultLabelPlural="clases"
      />
    </YStack>
  )
}
