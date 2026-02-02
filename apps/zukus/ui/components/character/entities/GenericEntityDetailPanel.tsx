import { Pressable } from 'react-native'
import { YStack, XStack, Text, Card } from 'tamagui'
import {
  getInstanceFieldsFromCompendium,
  type ComputedEntity,
  type InstanceFieldDefinition,
} from '@zukus/core'
import { Checkbox } from '../../../atoms'
import { EntityImage } from '../../EntityImage'
import { useCompendiumContext } from '../../EntityProvider'

type GenericEntityDetailPanelProps = {
  entity: ComputedEntity
  /**
   * Optional: Override instance fields to render as editable.
   * If not provided, will auto-detect from the entity's schema addons.
   */
  instanceFields?: InstanceFieldDefinition[]
  /**
   * Callback when an instance field value changes.
   */
  onInstanceFieldChange?: (field: string, value: unknown) => void
}

/**
 * Base fields that should always be excluded from the generic field list.
 */
const BASE_EXCLUDED_FIELDS = new Set([
  'id',
  'entityType',
  'name',
  'description',
  '_meta',
  'tags',
  'image',
])

/**
 * Gets the set of excluded fields for a given entity type.
 * Includes base excluded fields plus any instance field names.
 */
function getExcludedFields(instanceFields: InstanceFieldDefinition[]): Set<string> {
  const excluded = new Set(BASE_EXCLUDED_FIELDS)
  for (const field of instanceFields) {
    excluded.add(field.name)
  }
  return excluded
}

function formatFieldLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '-'
  }

  if (typeof value === 'boolean') {
    return value ? 'Si' : 'No'
  }

  if (typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '-'
    }
    return value.map(item => formatValue(item)).join(', ')
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }

  return String(value)
}

function isComplexValue(value: unknown): boolean {
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
    return true
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return true
  }
  return false
}

function TagPill({ tag }: { tag: string }) {
  return (
    <YStack
      paddingVertical={4}
      paddingHorizontal={10}
      borderRadius={12}
      backgroundColor="$backgroundHover"
    >
      <Text fontSize={12} color="$color">
        {tag}
      </Text>
    </YStack>
  )
}

function TagsRow({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return null
  }

  return (
    <XStack flexWrap="wrap" gap={6}>
      {tags.map((tag, index) => (
        <TagPill key={`${tag}-${index}`} tag={tag} />
      ))}
    </XStack>
  )
}

function SimpleFieldRow({ label, value }: { label: string; value: string }) {
  return (
    <XStack
      paddingVertical={10}
      paddingHorizontal={12}
      borderBottomWidth={1}
      borderColor="$borderColor"
      justifyContent="space-between"
      alignItems="center"
    >
      <Text fontSize={13} color="$placeholderColor" flex={1}>
        {label}
      </Text>
      <Text fontSize={13} fontWeight="500" color="$color" flex={2} textAlign="right">
        {value}
      </Text>
    </XStack>
  )
}

function ComplexFieldSection({ label, value }: { label: string; value: unknown }) {
  const formattedValue = formatValue(value)

  return (
    <YStack gap={8} paddingVertical={12}>
      <Text fontSize={13} fontWeight="600" color="$color">
        {label}
      </Text>
      <YStack
        padding={12}
        backgroundColor="$backgroundHover"
        borderRadius={6}
        borderWidth={1}
        borderColor="$borderColor"
      >
        <Text
          fontSize={12}
          color="$placeholderColor"
          whiteSpace="pre-wrap"
        >
          {formattedValue}
        </Text>
      </YStack>
    </YStack>
  )
}

function SourceInfo({ meta }: { meta: ComputedEntity['_meta'] }) {
  // Handle both inventory and standard computed entity sources
  const sourceType = (meta.source as any).originType ?? (meta.source as any).type ?? 'unknown'
  const sourceId = (meta.source as any).originId ?? (meta.source as any).instanceId ?? '-'

  return (
    <Card padding={12} backgroundColor="$uiBackgroundColor" borderRadius={8}>
      <YStack gap={8}>
        <Text fontSize={11} fontWeight="600" color="$placeholderColor" textTransform="uppercase">
          Origen
        </Text>
        <XStack justifyContent="space-between">
          <Text fontSize={12} color="$placeholderColor">Tipo</Text>
          <Text fontSize={12} color="$color">{sourceType}</Text>
        </XStack>
        <XStack justifyContent="space-between">
          <Text fontSize={12} color="$placeholderColor">ID</Text>
          <Text fontSize={12} color="$color" numberOfLines={1} flex={1} textAlign="right">
            {sourceId}
          </Text>
        </XStack>
        {meta.suppressed ? (
          <YStack gap={4} paddingTop={8} borderTopWidth={1} borderColor="$borderColor">
            <Text fontSize={11} fontWeight="600" color="$red10" textTransform="uppercase">
              Suprimido
            </Text>
            {meta.suppressedReason ? (
              <Text fontSize={12} color="$placeholderColor">
                {meta.suppressedReason}
              </Text>
            ) : null}
            {meta.suppressedBy ? (
              <Text fontSize={12} color="$placeholderColor">
                Por: {meta.suppressedBy}
              </Text>
            ) : null}
          </YStack>
        ) : null}
      </YStack>
    </Card>
  )
}

/**
 * Renders editable instance fields section.
 * Shows all fields from the schema, using default values if not present in entity.
 */
function InstanceFieldsSection({
  entity,
  fields,
  onChange,
}: {
  entity: ComputedEntity
  fields: InstanceFieldDefinition[]
  onChange?: (field: string, value: unknown) => void
}) {
  if (fields.length === 0) {
    return null
  }

  return (
    <Card padding={12} backgroundColor="$uiBackgroundColor" borderRadius={8}>
      <YStack gap={12}>
        <Text fontSize={11} fontWeight="600" color="$placeholderColor" textTransform="uppercase">
          Estado
        </Text>
        {fields.map((field) => {
          // Use entity value if present, otherwise use field default
          const entityValue = (entity as Record<string, unknown>)[field.name]
          const value = entityValue !== undefined ? entityValue : field.default

          if (field.type === 'boolean') {
            return (
              <BooleanFieldRow
                key={field.name}
                label={field.label ?? field.name}
                value={Boolean(value)}
                onChange={onChange ? (v) => onChange(field.name, v) : undefined}
              />
            )
          }

          if (field.type === 'number') {
            return (
              <NumberFieldRow
                key={field.name}
                label={field.label ?? field.name}
                value={typeof value === 'number' ? value : 1}
                onChange={onChange ? (v) => onChange(field.name, v) : undefined}
              />
            )
          }

          // For string fields, show as read-only for now
          return (
            <SimpleFieldRow
              key={field.name}
              label={field.label ?? field.name}
              value={formatValue(value)}
            />
          )
        })}
      </YStack>
    </Card>
  )
}

function NumberFieldRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange?: (value: number) => void
}) {
  const handleDecrement = () => {
    if (value > 1 && onChange) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (onChange) {
      onChange(value + 1)
    }
  }

  return (
    <XStack
      paddingVertical={8}
      justifyContent="space-between"
      alignItems="center"
    >
      <Text fontSize={13} color="$color" fontWeight="500">
        {label}
      </Text>
      {onChange ? (
        <XStack alignItems="center" gap={4}>
          <Pressable onPress={handleDecrement} hitSlop={8}>
            {({ pressed }) => (
              <YStack
                width={28}
                height={28}
                borderRadius={6}
                backgroundColor={value <= 1 ? '$backgroundHover' : '$blue4'}
                alignItems="center"
                justifyContent="center"
                opacity={pressed ? 0.7 : 1}
              >
                <Text
                  fontSize={16}
                  fontWeight="700"
                  color={value <= 1 ? '$placeholderColor' : '$blue10'}
                >
                  -
                </Text>
              </YStack>
            )}
          </Pressable>

          <YStack
            minWidth={40}
            paddingVertical={4}
            paddingHorizontal={8}
            alignItems="center"
          >
            <Text fontSize={16} fontWeight="600" color="$color">
              {value}
            </Text>
          </YStack>

          <Pressable onPress={handleIncrement} hitSlop={8}>
            {({ pressed }) => (
              <YStack
                width={28}
                height={28}
                borderRadius={6}
                backgroundColor="$blue4"
                alignItems="center"
                justifyContent="center"
                opacity={pressed ? 0.7 : 1}
              >
                <Text fontSize={16} fontWeight="700" color="$blue10">
                  +
                </Text>
              </YStack>
            )}
          </Pressable>
        </XStack>
      ) : (
        <Text fontSize={16} fontWeight="600" color="$color">
          {value}
        </Text>
      )}
    </XStack>
  )
}

function BooleanFieldRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange?: (value: boolean) => void
}) {
  const content = (
    <XStack
      paddingVertical={8}
      justifyContent="space-between"
      alignItems="center"
    >
      <Text fontSize={13} color="$color" fontWeight="500">
        {label}
      </Text>
      <Checkbox
        checked={value}
        onCheckedChange={onChange ? () => onChange(!value) : undefined}
        size="small"
        variant="diamond"
        disabled={!onChange}
      />
    </XStack>
  )

  if (onChange) {
    return (
      <Pressable onPress={() => onChange(!value)}>
        {content}
      </Pressable>
    )
  }

  return content
}

export function GenericEntityDetailPanel({
  entity,
  instanceFields,
  onInstanceFieldChange,
}: GenericEntityDetailPanelProps) {
  const { compendium } = useCompendiumContext()
  const tags = entity.tags ?? []
  const simpleFields: Array<{ key: string; label: string; value: string }> = []
  const complexFields: Array<{ key: string; label: string; value: unknown }> = []

  // Get instance fields from schema if not provided
  const schemaInstanceFields = getInstanceFieldsFromCompendium(
    entity.entityType,
    compendium
  )
  const fieldsToShow = instanceFields ?? schemaInstanceFields

  // Build excluded fields set (base + instance fields)
  const excludedFields = getExcludedFields(fieldsToShow)

  for (const [key, value] of Object.entries(entity)) {
    if (excludedFields.has(key)) {
      continue
    }

    if (value === null || value === undefined) {
      continue
    }

    const label = formatFieldLabel(key)

    if (isComplexValue(value)) {
      complexFields.push({ key, label, value })
    } else {
      simpleFields.push({ key, label, value: formatValue(value) })
    }
  }

  // Get image from entity (may be a full URL or undefined)
  const entityImage = (entity as any).image as string | undefined

  return (
    <YStack padding={16} gap={16}>
      {/* Header with image */}
      <XStack gap={16} alignItems="flex-start">
        <EntityImage
          image={entityImage}
          fallbackText={entity.name}
          size={80}
        />
        <YStack flex={1} gap={4}>
          <Text fontSize={22} fontWeight="700" color="$color">
            {entity.name}
          </Text>
          <Text fontSize={12} color="$placeholderColor" textTransform="uppercase">
            {entity.entityType.replace(/_/g, ' ')}
          </Text>
          {tags.length > 0 ? <TagsRow tags={tags} /> : null}
        </YStack>
      </XStack>

      {entity.description ? (
        <YStack gap={4}>
          <Text fontSize={14} color="$color" lineHeight={22}>
            {entity.description}
          </Text>
        </YStack>
      ) : null}

      {/* Instance fields section (editable) - prominently placed */}
      <InstanceFieldsSection
        entity={entity}
        fields={fieldsToShow}
        onChange={onInstanceFieldChange}
      />

      {simpleFields.length > 0 ? (
        <Card padding={0} backgroundColor="$uiBackgroundColor" borderRadius={8} overflow="hidden">
          {simpleFields.map((field, index) => (
            <SimpleFieldRow
              key={field.key}
              label={field.label}
              value={field.value}
            />
          ))}
        </Card>
      ) : null}

      {complexFields.map((field) => (
        <ComplexFieldSection
          key={field.key}
          label={field.label}
          value={field.value}
        />
      ))}

      <SourceInfo meta={entity._meta} />
    </YStack>
  )
}
