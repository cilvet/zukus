import { useState } from 'react'
import { Text, XStack, YStack } from 'tamagui'
import { BonusTypesValues, type SourceValue, type BonusTypes } from '@zukus/core'

function getBonusTypeName(bonusTypeId: BonusTypes): string {
  return BonusTypesValues[bonusTypeId]?.name ?? bonusTypeId
}

function formatValue(value: number): string {
  if (value >= 0) return `+${value}`
  return String(value)
}

export type SourceValueWithFormula = SourceValue & {
  formula?: string
}

export type SourceValuesTableProps = {
  sourceValues: SourceValueWithFormula[]
  showFormulas?: boolean
  onToggleFormulas?: () => void
}

/**
 * Tabla de desglose de modificadores (sourceValues).
 * Componente compartido entre AbilityDetailPanel, SavingThrowDetailPanel, etc.
 *
 * Si showFormulas es true y hay formulas disponibles, muestra las formulas en lugar de los valores.
 * Al pulsar cualquier fila con formula, se togglean todas las formulas.
 */
export function SourceValuesTable({
  sourceValues,
  showFormulas: controlledShowFormulas,
  onToggleFormulas,
}: SourceValuesTableProps) {
  const [internalShowFormulas, setInternalShowFormulas] = useState(false)

  const showFormulas = controlledShowFormulas !== undefined ? controlledShowFormulas : internalShowFormulas

  const hasAnyFormula = sourceValues.some(sv => sv.formula)

  const handleToggle = () => {
    if (!hasAnyFormula) return

    if (onToggleFormulas) {
      onToggleFormulas()
    } else {
      setInternalShowFormulas(!internalShowFormulas)
    }
  }

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
        paddingHorizontal={16}
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
      {sourceValues.map((sv, index) => {
        const hasFormula = Boolean(sv.formula)
        const displayValue = showFormulas && hasFormula ? sv.formula! : formatValue(sv.value)

        return (
          <XStack
            key={`${sv.sourceUniqueId}-${index}`}
            paddingVertical={8}
            paddingHorizontal={16}
            borderBottomWidth={index < sourceValues.length - 1 ? 1 : 0}
            borderBottomColor="$borderColor"
            opacity={sv.relevant === false ? 0.4 : 1}
            onPress={hasAnyFormula ? handleToggle : undefined}
            cursor={hasAnyFormula ? 'pointer' : 'default'}
            hoverStyle={hasAnyFormula ? { opacity: 0.8 } : undefined}
          >
            <Text flex={2} fontSize={13} color="$color" numberOfLines={1}>
              {sv.sourceName}
            </Text>
            <XStack
              width={50}
              justifyContent="center"
              alignItems="center"
              backgroundColor={hasFormula && hasAnyFormula ? '$borderColor' : 'transparent'}
              borderRadius={4}
              paddingVertical={2}
              paddingHorizontal={4}
            >
              <Text
                fontSize={13}
                fontWeight={showFormulas && hasFormula ? '400' : '600'}
                color="$color"
                textAlign="center"
              >
                {displayValue}
              </Text>
            </XStack>
            <Text flex={1} fontSize={12} color="$placeholderColor" textAlign="right" numberOfLines={1}>
              {getBonusTypeName(sv.bonusTypeId)}
            </Text>
          </XStack>
        )
      })}
    </YStack>
  )
}
