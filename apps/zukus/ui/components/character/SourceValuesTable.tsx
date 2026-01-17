import { Text, XStack, YStack } from 'tamagui'
import { BonusTypesValues, type SourceValue, type BonusTypes } from '@zukus/core'

function getBonusTypeName(bonusTypeId: BonusTypes): string {
  return BonusTypesValues[bonusTypeId]?.name ?? bonusTypeId
}

function formatValue(value: number): string {
  if (value >= 0) return `+${value}`
  return String(value)
}

export type SourceValuesTableProps = {
  sourceValues: SourceValue[]
}

/**
 * Tabla de desglose de modificadores (sourceValues).
 * Componente compartido entre AbilityDetailPanel, SavingThrowDetailPanel, etc.
 */
export function SourceValuesTable({ sourceValues }: SourceValuesTableProps) {
  if (sourceValues.length === 0) {
    return (
      <Text fontSize={13} color="$placeholderColor" fontStyle="italic">
        Sin modificadores
      </Text>
    )
  }

  return (
    <YStack>
      {/* Header */}
      <XStack
        paddingVertical={8}
        paddingHorizontal={12}
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Text flex={2} fontSize={11} fontWeight="700" color="$placeholderColor" textTransform="uppercase">
          Origen
        </Text>
        <Text width={50} fontSize={11} fontWeight="700" color="$placeholderColor" textTransform="uppercase" textAlign="center">
          Valor
        </Text>
        <Text flex={1} fontSize={11} fontWeight="700" color="$placeholderColor" textTransform="uppercase" textAlign="right">
          Tipo
        </Text>
      </XStack>

      {/* Rows */}
      {sourceValues.map((sv, index) => (
        <XStack
          key={`${sv.sourceUniqueId}-${index}`}
          paddingVertical={8}
          paddingHorizontal={12}
          borderBottomWidth={index < sourceValues.length - 1 ? 1 : 0}
          borderBottomColor="$borderColor"
          opacity={sv.relevant === false ? 0.4 : 1}
        >
          <Text flex={2} fontSize={13} color="$color" numberOfLines={1}>
            {sv.sourceName}
          </Text>
          <Text width={50} fontSize={13} fontWeight="600" color="$color" textAlign="center">
            {formatValue(sv.value)}
          </Text>
          <Text flex={1} fontSize={12} color="$placeholderColor" textAlign="right" numberOfLines={1}>
            {getBonusTypeName(sv.bonusTypeId)}
          </Text>
        </XStack>
      ))}
    </YStack>
  )
}
