import { XStack, YStack, Text } from 'tamagui'
import type { AttackContextualChange, ContextualVariable } from '@zukus/core'
import { Checkbox } from '../../../atoms'
import { Slider } from '../../../atoms'

export type ContextualChangeToggleProps = {
  contextualChange: AttackContextualChange
  isSelected: boolean
  onToggle: () => void
  variables?: Record<string, number>
  onVariableChange?: (identifier: string, value: number) => void
}

function formatChangeEffect(contextualChange: AttackContextualChange): string {
  const effects: string[] = []

  for (const change of contextualChange.changes) {
    // ContextualizedChange<AttackChange> es AttackChange & ChangeContext
    // El tipo y formula están directamente en change, no en change.change
    if (!change) continue

    // Intenta obtener el valor de la fórmula
    let value = 0
    if ('formula' in change && change.formula) {
      const formula = change.formula as { expression?: string }
      if (formula.expression && typeof formula.expression === 'string') {
        // Si es una expresión simple (número), parseamos
        const parsed = parseInt(formula.expression, 10)
        if (!isNaN(parsed)) {
          value = parsed
        }
      }
    }

    const sign = value >= 0 ? '+' : ''
    const type = (change as { type?: string }).type

    if (type === 'ATTACK_ROLLS') {
      effects.push(`${sign}${value} Attack`)
    } else if (type === 'DAMAGE') {
      effects.push(`${sign}${value} Damage`)
    } else if (type === 'BAB') {
      effects.push(`${sign}${value} BAB`)
    }
  }

  return effects.join(' / ') || contextualChange.name
}

/**
 * Toggle para un contextual change individual.
 * Muestra checkbox, nombre, efecto y opcionalmente un slider para variables.
 */
export function ContextualChangeToggle({
  contextualChange,
  isSelected,
  onToggle,
  variables = {},
  onVariableChange,
}: ContextualChangeToggleProps) {
  const hasVariables = contextualChange.variables.length > 0
  const effectText = formatChangeEffect(contextualChange)
  const isDisabled = !contextualChange.available

  const handleCheckedChange = () => {
    if (!isDisabled) {
      onToggle()
    }
  }

  return (
    <YStack
      gap={8}
      padding={12}
      backgroundColor="$background"
      borderWidth={1}
      borderColor={isSelected ? '$color' : '$borderColor'}
      borderRadius={4}
      opacity={isDisabled ? 0.5 : 1}
    >
      <XStack alignItems="center" gap={12}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleCheckedChange}
          disabled={isDisabled}
          size="medium"
        />

        <YStack flex={1} gap={2}>
          <Text fontSize={14} fontWeight="600" color="$color">
            {contextualChange.name}
          </Text>
          <Text fontSize={12} color="$placeholderColor">
            {effectText}
          </Text>
        </YStack>
      </XStack>

      {hasVariables && isSelected && (
        <YStack gap={8} marginLeft={36}>
          {contextualChange.variables.map((variable: ContextualVariable) => {
            const currentValue = variables[variable.identifier] ?? variable.min

            return (
              <YStack key={variable.identifier} gap={4}>
                <Text fontSize={11} color="$placeholderColor" textTransform="uppercase">
                  {variable.name}
                </Text>
                <Slider
                  value={currentValue}
                  min={variable.min}
                  max={variable.max}
                  step={1}
                  onValueChange={(value) => onVariableChange?.(variable.identifier, value)}
                  showValue
                />
              </YStack>
            )
          })}
        </YStack>
      )}
    </YStack>
  )
}
