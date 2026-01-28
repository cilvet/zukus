import { ScrollView } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import type { StandardEntity } from '@zukus/core'
import { useTheme, useCompendiumContext, EntityImage } from '../../ui'

/** Change type from entity.changes array */
type EntityChange = NonNullable<StandardEntity['changes']>[number]

const HEADER_IMAGE_SIZE = 100

export type CompendiumEntityDetailProps = {
  entityId: string
}

/**
 * Generic entity detail panel.
 * Shows entity information based on available fields.
 */
export function CompendiumEntityDetail({ entityId }: CompendiumEntityDetailProps) {
  const { themeColors } = useTheme()
  const compendium = useCompendiumContext()

  const entity = compendium.getEntityById(entityId)

  if (!entity) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding={16}>
        <Text color="$placeholderColor" textAlign="center">
          Entidad no encontrada: {entityId}
        </Text>
      </YStack>
    )
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: themeColors.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      <YStack gap={20}>
        {/* Header: Image + Name + Tags */}
        <EntityHeader entity={entity} />

        {/* Description */}
        {entity.description && (
          <Section title="Descripcion">
            <Text fontSize={14} color="$color" lineHeight={22}>
              {entity.description}
            </Text>
          </Section>
        )}

        {/* Dynamic properties */}
        <EntityProperties entity={entity} />

        {/* Effects/Changes */}
        {entity.changes && entity.changes.length > 0 && (
          <Section title={`Efectos (${entity.changes.length})`}>
            <YStack
              backgroundColor="$backgroundHover"
              padding={12}
              borderRadius={8}
              gap={8}
            >
              {entity.changes.map((change, index) => (
                <ChangeRow key={index} change={change} />
              ))}
            </YStack>
          </Section>
        )}
      </YStack>
    </ScrollView>
  )
}

// =============================================================================
// Sub-components
// =============================================================================

function EntityHeader({ entity }: { entity: StandardEntity }) {
  return (
    <XStack gap={16} alignItems="flex-start">
      <EntityImage
        image={entity.image}
        fallbackText={entity.name}
        size={HEADER_IMAGE_SIZE}
      />

      <YStack flex={1} gap={8} paddingTop={4}>
        <Text fontSize={22} fontWeight="700" color="$color">
          {entity.name}
        </Text>

        {entity.tags && entity.tags.length > 0 && (
          <XStack gap={6} flexWrap="wrap">
            {entity.tags.map((tag) => (
              <YStack
                key={tag}
                backgroundColor="$backgroundHover"
                paddingHorizontal={8}
                paddingVertical={4}
                borderRadius={4}
              >
                <Text fontSize={11} color="$placeholderColor">
                  {tag}
                </Text>
              </YStack>
            ))}
          </XStack>
        )}
      </YStack>
    </XStack>
  )
}

type SectionProps = {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <YStack gap={8}>
      <Text fontSize={13} fontWeight="600" color="$placeholderColor" textTransform="uppercase">
        {title}
      </Text>
      {children}
    </YStack>
  )
}

/**
 * Shows entity-specific properties that are not in the standard fields.
 */
function EntityProperties({ entity }: { entity: StandardEntity }) {
  // Fields to skip (already shown elsewhere or internal)
  const skipFields = new Set([
    'id',
    'entityType',
    'name',
    'description',
    'image',
    'tags',
    'changes',
    'specialChanges',
    'legacy_changes',
    'legacy_contextualChanges',
    'legacy_specialChanges',
    'effects',
    'suppression',
  ])

  const entries = Object.entries(entity).filter(
    ([key, value]) => !skipFields.has(key) && value !== undefined && value !== null
  )

  if (entries.length === 0) return null

  return (
    <Section title="Propiedades">
      <YStack gap={12}>
        {entries.map(([key, value]) => (
          <PropertyRow key={key} label={formatLabel(key)} value={value} />
        ))}
      </YStack>
    </Section>
  )
}

type PropertyRowProps = {
  label: string
  value: unknown
}

function PropertyRow({ label, value }: PropertyRowProps) {
  const formattedValue = formatValue(value)

  // For long values, show label above
  if (formattedValue.length > 50) {
    return (
      <YStack gap={4}>
        <Text fontSize={12} color="$placeholderColor" fontWeight="500">
          {label}
        </Text>
        <Text fontSize={14} color="$color" lineHeight={20}>
          {formattedValue}
        </Text>
      </YStack>
    )
  }

  // For short values, show inline
  return (
    <XStack justifyContent="space-between" alignItems="flex-start" gap={12}>
      <Text fontSize={13} color="$placeholderColor" flexShrink={0}>
        {label}
      </Text>
      <Text fontSize={13} color="$color" textAlign="right" flex={1}>
        {formattedValue}
      </Text>
    </XStack>
  )
}

function ChangeRow({ change }: { change: EntityChange }) {
  const { themeInfo } = useTheme()

  // Build description based on change type
  let description = change.type
  if ('target' in change && change.target) {
    description += ` → ${change.target}`
  }
  if ('value' in change && change.value !== undefined) {
    const sign = typeof change.value === 'number' && change.value > 0 ? '+' : ''
    description += `: ${sign}${change.value}`
  }
  if ('formula' in change && change.formula) {
    description += `: ${change.formula}`
  }

  const bonusType = change.bonusTypeId && change.bonusTypeId !== 'UNTYPED'
    ? change.bonusTypeId
    : null

  return (
    <XStack alignItems="center" gap={8}>
      <YStack
        width={6}
        height={6}
        borderRadius={3}
        backgroundColor={themeInfo.colors.accent}
      />
      <Text fontSize={13} color="$color" flex={1}>
        {description}
      </Text>
      {bonusType && (
        <Text fontSize={11} color="$placeholderColor">
          ({bonusType})
        </Text>
      )}
    </XStack>
  )
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Converts camelCase/snake_case to readable label.
 */
function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim()
}

/**
 * Formats a value for display.
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Si' : 'No'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    if (value.length === 0) return '-'
    // Check if array of objects
    if (typeof value[0] === 'object') {
      return value.map((v) => formatValue(v)).join(', ')
    }
    return value.join(', ')
  }
  if (typeof value === 'object') {
    // Handle classData specially (common in spells)
    if ('classLevels' in value && typeof value.classLevels === 'object') {
      const levels = value.classLevels as Record<string, number>
      return Object.entries(levels)
        .map(([cls, lvl]) => `${formatLabel(cls)} ${lvl}`)
        .join(', ')
    }
    // Generic object
    return JSON.stringify(value)
  }
  return String(value)
}
