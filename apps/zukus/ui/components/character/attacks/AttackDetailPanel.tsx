import { useState } from 'react'
import { Text, YStack, XStack } from 'tamagui'
import type { CalculatedAttack, CalculatedAttackData, DamageSectionValue } from '@zukus/core'
import { getDamageFormulaText } from '@zukus/core'
import { SourceValuesTable } from '../SourceValuesTable'
import { DamageSectionTable } from './DamageSectionTable'
import { ContextualChangeToggle } from './ContextualChangeToggle'
import { useAttackContext } from '../../../../hooks'

export type AttackDetailPanelProps = {
  attack: CalculatedAttack
  attackData: CalculatedAttackData | null
}

function formatAttackBonus(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}

function getDamageData(
  damage: CalculatedAttack['damage'], 
  substitutionIndex: Record<string, number>
): { displayText: string; sections: DamageSectionValue[] } {
  "use no memo"
  
  if (!damage) {
    return { displayText: '-', sections: [] }
  }
  
  try {
    const [damageText, damageSections] = getDamageFormulaText(damage, substitutionIndex, true)
    return {
      displayText: damageText || '-',
      sections: damageSections
    }
  } catch (error) {
    console.error('Error formatting damage:', error)
    return { displayText: '-', sections: [] }
  }
}

/**
 * Panel de detalle de un ataque.
 * Muestra bono de ataque y daño con sus source values colapsables.
 * Permite seleccionar contextual changes para modificar el ataque.
 */
export function AttackDetailPanel({ attack, attackData }: AttackDetailPanelProps) {
  "use no memo"
  
  const [attackBonusExpanded, setAttackBonusExpanded] = useState(false)
  const [damageExpanded, setDamageExpanded] = useState(false)

  const {
    calculatedAttack,
    availableContextualChanges,
    selectedChanges,
    variables,
    substitutionIndex,
    toggleChange,
    updateVariable,
  } = useAttackContext(attack, attackData)

  const attackBonusValue = formatAttackBonus(calculatedAttack.attackBonus.totalValue)
  const damageData = getDamageData(calculatedAttack.damage, substitutionIndex)

  const hasContextualChanges = availableContextualChanges.length > 0

  return (
    <YStack>
      {/* Contextual Changes */}
      {hasContextualChanges && (
        <YStack borderBottomWidth={1} borderBottomColor="$borderColor">
          <YStack gap={12} paddingBottom={16} paddingHorizontal={16}>
            <Text fontSize={14} fontWeight="700" color="$color">
              MODIFIERS
            </Text>
            <XStack flexWrap="wrap" gap={8}>
              {availableContextualChanges
                .slice()
                .sort((a, b) => {
                  // Primero los que NO tienen variables, luego los que SÍ tienen
                  const aHasVars = a.variables.length > 0
                  const bHasVars = b.variables.length > 0
                  if (aHasVars === bHasVars) return 0
                  return aHasVars ? 1 : -1
                })
                .map((change, index) => {
                  const hasVariables = change.variables.length > 0
                  const isSelected = selectedChanges.has(change.name)
                  // Si tiene variables, ocupa toda la fila (siempre visible ahora)
                  const width = hasVariables ? "100%" : "48%"
                  
                  return (
                    <XStack 
                      key={`${change.name}-${index}`} 
                      width={width}
                      flexGrow={0}
                      flexShrink={0}
                    >
                      <ContextualChangeToggle
                        contextualChange={change}
                        isSelected={isSelected}
                        onToggle={() => toggleChange(change.name)}
                        variables={variables[change.name]}
                        onVariableChange={(varId, value) =>
                          updateVariable(change.name, varId, value)
                        }
                      />
                    </XStack>
                  )
                })}
            </XStack>
          </YStack>
        </YStack>
      )}

      {/* Attack Bonus - Colapsable */}
      <YStack borderBottomWidth={1} borderBottomColor="$borderColor">
        <XStack
          onPress={() => setAttackBonusExpanded(!attackBonusExpanded)}
          justifyContent="space-between"
          alignItems="center"
          paddingVertical={12}
          paddingHorizontal={16}
          cursor="pointer"
          hoverStyle={{ opacity: 0.8 }}
          pressStyle={{ opacity: 0.6 }}
        >
          <Text fontSize={14} fontWeight="600" color="$color">
            Attack Bonus
          </Text>
          <XStack alignItems="center" gap={8}>
            {calculatedAttack.attackBonus.sourceValues.length > 1 && (
              <Text fontSize={12} color="$placeholderColor">
                {attackBonusExpanded ? '▲' : '▼'}
              </Text>
            )}
            <Text fontSize={18} fontWeight="700" color="$color">
              {attackBonusValue}
            </Text>
          </XStack>
        </XStack>
        {attackBonusExpanded && (
          <YStack paddingVertical={16} backgroundColor="$backgroundStrong">
            <SourceValuesTable sourceValues={calculatedAttack.attackBonus.sourceValues} />
          </YStack>
        )}
      </YStack>

      {/* Damage - Colapsable */}
      <YStack borderBottomWidth={1} borderBottomColor="$borderColor">
        <XStack
          onPress={() => setDamageExpanded(!damageExpanded)}
          justifyContent="space-between"
          alignItems="center"
          paddingVertical={12}
          paddingHorizontal={16}
          cursor="pointer"
          hoverStyle={{ opacity: 0.8 }}
          pressStyle={{ opacity: 0.6 }}
        >
          <Text fontSize={14} fontWeight="600" color="$color">
            Damage
          </Text>
          <XStack alignItems="center" gap={8}>
            {damageData.sections.length > 1 && (
              <Text fontSize={12} color="$placeholderColor">
                {damageExpanded ? '▲' : '▼'}
              </Text>
            )}
            <Text fontSize={18} fontWeight="700" color="$color">
              {damageData.displayText}
            </Text>
          </XStack>
        </XStack>
        {damageExpanded && (
          <YStack paddingVertical={16} backgroundColor="$backgroundStrong">
            <DamageSectionTable damageSections={damageData.sections} />
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}
