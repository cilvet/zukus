import { Pressable, ScrollView, StyleSheet } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import type { EntityInstance } from '@zukus/core'
import { getLocalizedEntity, type LocalizationContext } from '@zukus/core'
import { useActiveLocale } from '../../ui/stores/translationStore'

export type SelectionBarProps = {
  selectedEntities: EntityInstance[]
  onDeselect: (instanceId: string) => void
  current: number
  max: number
  min: number
  label?: string
  accentColor: string
  placeholderColor: string
}

/**
 * Altura fija del SelectionBar - usar para calcular padding del contenido.
 */
export const SELECTION_BAR_HEIGHT = 56

/**
 * Fixed bar at the bottom showing selected entity chips with remove buttons.
 * Identical positioning pattern to CounterBar (YStack + style absolute + safe area).
 */
export function SelectionBar({
  selectedEntities,
  onDeselect,
  current,
  max,
  min,
  accentColor,
  placeholderColor,
}: SelectionBarProps) {
  'use no memo'

  const locale = useActiveLocale()

  const ctx: LocalizationContext = { locale, compendiumLocale: 'en' }
  const localizedEntities = selectedEntities.map((instance) => ({
    ...instance,
    entity: getLocalizedEntity(instance.entity, ctx),
  }))

  if (localizedEntities.length === 0) return null

  const isMinMet = current >= min

  return (
    <YStack
      style={[styles.container, { paddingBottom: 8 }]}
      backgroundColor="$background"
      borderTopWidth={1}
      borderTopColor="$borderColor"
      testID="selection-bar"
    >
      <XStack
        paddingHorizontal={16}
        paddingVertical={8}
        alignItems="center"
        gap={12}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {localizedEntities.map((instance) => (
            <XStack
              key={instance.instanceId}
              backgroundColor="$uiBackgroundColor"
              borderRadius={8}
              paddingHorizontal={10}
              paddingVertical={6}
              borderWidth={1}
              borderColor="$borderColor"
              alignItems="center"
              gap={6}
              marginRight={8}
            >
              <Text fontSize={13} color="$color" numberOfLines={1}>
                {instance.entity.name}
              </Text>
              <Pressable
                onPress={() => onDeselect(instance.instanceId)}
                hitSlop={8}
                testID={`selection-bar-chip-remove-${instance.entity.id}`}
              >
                {({ pressed }) => (
                  <FontAwesome6
                    name="xmark"
                    size={14}
                    color={placeholderColor}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </XStack>
          ))}
        </ScrollView>

        {/* Badge with progress */}
        <XStack
          backgroundColor={isMinMet ? '$green9' : '$yellow9'}
          paddingHorizontal={8}
          paddingVertical={2}
          borderRadius={12}
          testID="selection-bar-badge"
        >
          <Text fontSize={12} color="white" fontWeight="600">
            {current}/{max}
          </Text>
        </XStack>
      </XStack>
    </YStack>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
})
