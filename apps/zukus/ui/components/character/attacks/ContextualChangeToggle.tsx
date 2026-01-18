import { XStack, YStack, Text } from 'tamagui'
import type { AttackContextualChange, ContextualVariable } from '@zukus/core'
import { Checkbox } from '../../../atoms'
import { Slider } from '../../../atoms'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

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
      // Trigger haptic feedback cuando se hace clic en el XStack
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
      onToggle()
    }
  }

  const handleSliderChange = (variableId: string, value: number) => {
    // Si no está seleccionado, activarlo automáticamente
    if (!isSelected && !isDisabled) {
      onToggle()
    }
    // Actualizar el valor de la variable
    onVariableChange?.(variableId, value)
  }

  return (
    <YStack
      gap={8}
      opacity={isDisabled ? 0.5 : 1}
      width="100%"
    >
      <XStack 
        alignItems="center" 
        gap={12}
        onPress={handleCheckedChange}
        cursor={isDisabled ? 'default' : 'pointer'}
        hoverStyle={isDisabled ? {} : { opacity: 0.8 }}
        pressStyle={isDisabled ? {} : { opacity: 0.6 }}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleCheckedChange}
          disabled={isDisabled}
          size="small"
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

      {hasVariables && (
        <YStack gap={12} marginLeft={36} paddingBottom={8}>
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
                  onValueChange={(value) => handleSliderChange(variable.identifier, value)}
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
