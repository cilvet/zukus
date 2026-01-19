import { YStack, XStack, Text, Card } from 'tamagui'
import type { ComputedEntity } from '@zukus/core'

type GenericEntityDetailPanelProps = {
  entity: ComputedEntity
}

const EXCLUDED_FIELDS = new Set([
  'id',
  'entityType',
  'name',
  'description',
  '_meta',
  'tags',
  'image',
])

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
  return (
    <Card padding={12} backgroundColor="$uiBackgroundColor" borderRadius={8}>
      <YStack gap={8}>
        <Text fontSize={11} fontWeight="600" color="$placeholderColor" textTransform="uppercase">
          Origen
        </Text>
        <XStack justifyContent="space-between">
          <Text fontSize={12} color="$placeholderColor">Tipo</Text>
          <Text fontSize={12} color="$color">{meta.source.originType}</Text>
        </XStack>
        <XStack justifyContent="space-between">
          <Text fontSize={12} color="$placeholderColor">ID</Text>
          <Text fontSize={12} color="$color" numberOfLines={1} flex={1} textAlign="right">
            {meta.source.originId}
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

export function GenericEntityDetailPanel({ entity }: GenericEntityDetailPanelProps) {
  const tags = entity.tags ?? []
  const simpleFields: Array<{ key: string; label: string; value: string }> = []
  const complexFields: Array<{ key: string; label: string; value: unknown }> = []

  for (const [key, value] of Object.entries(entity)) {
    if (EXCLUDED_FIELDS.has(key)) {
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

  return (
    <YStack padding={16} gap={16}>
      <YStack gap={8}>
        <Text fontSize={24} fontWeight="700" color="$color">
          {entity.name}
        </Text>
        <Text fontSize={12} color="$placeholderColor" textTransform="uppercase">
          {entity.entityType.replace(/_/g, ' ')}
        </Text>
      </YStack>

      {tags.length > 0 ? <TagsRow tags={tags} /> : null}

      {entity.description ? (
        <YStack gap={4}>
          <Text fontSize={14} color="$color" lineHeight={22}>
            {entity.description}
          </Text>
        </YStack>
      ) : null}

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
