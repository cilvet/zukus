/**
 * ProviderSummaryRow - Compact view of a provider shown in level detail
 *
 * Shows:
 * - For granted: Entity name (clickeable to view detail)
 * - For selector: Selector name + count badge (clickeable to open selection screen)
 * - For selected entities: Names listed under the selector, each clickeable
 */

import { YStack, XStack, Text } from 'tamagui'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import type { EntityProvider, Selector, StandardEntity, EntityInstance } from '@zukus/core'
import { getLocalizedEntity, type LocalizationContext } from '@zukus/core'
import { useActiveLocale } from '../../stores/translationStore'

export type ProviderSummaryRowProps = {
  provider: EntityProvider
  grantedEntities: StandardEntity[]
  selectedEntities: EntityInstance[]
  onSelectorPress: () => void
  onGrantedEntityPress: (entity: StandardEntity) => void
  onSelectedEntityPress: (entityInstance: EntityInstance) => void
}

export function ProviderSummaryRow({
  provider,
  grantedEntities,
  selectedEntities,
  onSelectorPress,
  onGrantedEntityPress,
  onSelectedEntityPress,
}: ProviderSummaryRowProps) {
  'use no memo'

  const locale = useActiveLocale()
  const ctx: LocalizationContext = { locale, compendiumLocale: 'en' }

  const localizedGranted = grantedEntities.map((e) => getLocalizedEntity(e, ctx))

  const localizedSelected = selectedEntities.map((inst) => ({
    ...inst,
    entity: getLocalizedEntity(inst.entity, ctx),
  }))

  const selector = provider.selector
  const hasGranted = localizedGranted.length > 0
  const hasSelector = !!selector

  return (
    <YStack width="100%" gap="$2">
      {/* Granted entities */}
      {hasGranted &&
        localizedGranted.map((entity) => (
          <GrantedEntitySummary
            key={entity.id}
            entity={entity}
            onPress={() => onGrantedEntityPress(entity)}
          />
        ))}

      {/* Selector */}
      {hasSelector && (
        <SelectorSummary
          selector={selector}
          selectedEntities={localizedSelected}
          onSelectorPress={onSelectorPress}
          onSelectedEntityPress={onSelectedEntityPress}
        />
      )}
    </YStack>
  )
}

// =============================================================================
// Sub-components
// =============================================================================

type GrantedEntitySummaryProps = {
  entity: StandardEntity
  onPress: () => void
}

function GrantedEntitySummary({ entity, onPress }: GrantedEntitySummaryProps) {
  return (
    <XStack
      width="100%"
      paddingVertical="$2"
      paddingHorizontal="$3"
      backgroundColor="$backgroundHover"
      borderRadius="$2"
      alignItems="center"
      justifyContent="space-between"
      cursor="pointer"
      hoverStyle={{ backgroundColor: '$backgroundPress' }}
      pressStyle={{ backgroundColor: '$backgroundPress', scale: 0.98 }}
      onPress={onPress}
    >
      <YStack flex={1}>
        <Text fontSize={14} fontWeight="500" color="$color">
          {entity.name}
        </Text>
        {entity.description && (
          <Text fontSize={12} color="$placeholderColor" numberOfLines={1}>
            {entity.description}
          </Text>
        )}
      </YStack>
      <FontAwesome name="chevron-right" size={14} color="#9ca3af" />
    </XStack>
  )
}

type SelectorSummaryProps = {
  selector: Selector
  selectedEntities: EntityInstance[]
  onSelectorPress: () => void
  onSelectedEntityPress: (entityInstance: EntityInstance) => void
}

function SelectorSummary({
  selector,
  selectedEntities,
  onSelectorPress,
  onSelectedEntityPress,
}: SelectorSummaryProps) {
  const selectionCount = selectedEntities.length
  const maxSelections = selector.max
  const isComplete = selectionCount >= maxSelections

  return (
    <YStack width="100%" gap="$1">
      {/* Selector header - clickeable to open selection screen */}
      <XStack
        width="100%"
        paddingVertical="$2"
        paddingHorizontal="$3"
        backgroundColor={isComplete ? '$backgroundHover' : '$yellow3'}
        borderRadius="$2"
        alignItems="center"
        justifyContent="space-between"
        cursor="pointer"
        hoverStyle={{ backgroundColor: isComplete ? '$backgroundPress' : '$yellow4' }}
        pressStyle={{ scale: 0.98 }}
        onPress={onSelectorPress}
      >
        <XStack alignItems="center" gap="$2" flex={1}>
          <Text fontSize={14} fontWeight="500" color="$color">
            {selector.name}
          </Text>
          <XStack
            backgroundColor={isComplete ? '$green9' : '$yellow9'}
            paddingHorizontal={8}
            paddingVertical={2}
            borderRadius={12}
          >
            <Text fontSize={12} color="white" fontWeight="600">
              {selectionCount}/{maxSelections}
            </Text>
          </XStack>
        </XStack>
        <FontAwesome name="chevron-right" size={14} color="#9ca3af" />
      </XStack>

      {/* Selected entities - shown under the selector */}
      {selectedEntities.length > 0 && (
        <XStack width="100%">
          {/* Nesting bar */}
          <YStack
            width={2}
            backgroundColor="$borderColor"
            opacity={0.3}
            marginLeft="$2"
            marginRight="$2"
          />

          {/* Selected entities list */}
          <YStack flex={1} gap="$1" paddingLeft="$1">
            {selectedEntities.map((instance) => (
              <XStack
                key={instance.instanceId}
                width="100%"
                paddingVertical="$1.5"
                paddingHorizontal="$2"
                borderRadius="$2"
                alignItems="center"
                justifyContent="space-between"
                cursor="pointer"
                hoverStyle={{ backgroundColor: '$backgroundHover' }}
                pressStyle={{ scale: 0.98 }}
                onPress={() => onSelectedEntityPress(instance)}
              >
                <Text fontSize={13} color="$color">
                  {instance.entity.name}
                </Text>
                <FontAwesome name="chevron-right" size={12} color="#9ca3af" />
              </XStack>
            ))}
          </YStack>
        </XStack>
      )}
    </YStack>
  )
}
