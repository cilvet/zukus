import { useState } from 'react'
import { Text, YStack, Card } from 'tamagui'
import type { CalculatedAttack, CalculatedAttackData, SourceValue, BonusTypes } from '@zukus/core'
import { Collapsible } from '../../../atoms'
import { SourceValuesTable } from '../SourceValuesTable'
import { ContextualChangeToggle } from './ContextualChangeToggle'
import { useAttackContext } from '../../../../hooks'

export type AttackDetailPanelProps = {
  attack: CalculatedAttack
  attackData: CalculatedAttackData | null
}

function formatAttackBonus(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}

function formatDamage(damage: CalculatedAttack['damage']): string {
  if (!damage) return '-'
  // DamageFormula puede ser ComplexDamageSection o SimpleDamageSectionWithType
  const d = damage as { type?: string; name?: string; baseDamage?: { name?: string }; formula?: { expression?: string } }
  if (d.type === 'complex' && d.baseDamage) {
    return d.name ?? d.baseDamage.name ?? 'Damage'
  }
  if (d.type === 'simple' && d.formula) {
    return d.formula.expression ?? d.name ?? 'Damage'
  }
  return d.name ?? '-'
}

function getDamageSourceValues(damage: CalculatedAttack['damage']): SourceValue[] {
  if (!damage) return []

  const sourceValues: SourceValue[] = []

  // Cast a tipo genérico para acceder a las propiedades
  const d = damage as {
    type?: string
    baseDamage?: { sources?: SourceValue[]; name?: string }
    additionalDamageSections?: Array<{ sources?: SourceValue[]; name?: string }>
    sources?: SourceValue[]
  }

  // Para ComplexDamageSection, extraer sources si existen
  if (d.type === 'complex' && d.baseDamage) {
    // Base damage sources
    if (d.baseDamage.sources) {
      sourceValues.push(...d.baseDamage.sources)
    } else if (d.baseDamage.name) {
      sourceValues.push({
        value: 0,
        sourceUniqueId: 'base-damage',
        sourceName: d.baseDamage.name,
        bonusTypeId: 'BASE' as BonusTypes,
        relevant: true,
      })
    }

    // Additional sections sources
    if (d.additionalDamageSections) {
      for (const section of d.additionalDamageSections) {
        if (section.sources) {
          sourceValues.push(...section.sources)
        }
      }
    }
  }

  // Para SimpleDamageSection, extraer sources si existen
  if (d.type === 'simple' && d.sources) {
    sourceValues.push(...d.sources)
  }

  return sourceValues
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
    toggleChange,
    updateVariable,
  } = useAttackContext(attack, attackData)

  const attackBonusValue = formatAttackBonus(calculatedAttack.attackBonus.totalValue)
  const damageValue = formatDamage(calculatedAttack.damage)
  const damageSourceValues = getDamageSourceValues(calculatedAttack.damage)

  const isMelee = calculatedAttack.type === 'melee'
  const hasContextualChanges = availableContextualChanges.length > 0

  return (
    <YStack gap={16} padding={4}>
      {/* Header */}
      <Card
        padding={16}
        backgroundColor="$background"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius={4}
      >
        <YStack alignItems="center" gap={8}>
          <Text fontSize={12} color="$placeholderColor" textTransform="uppercase">
            {isMelee ? 'Melee Attack' : 'Ranged Attack'}
          </Text>
          <Text fontSize={24} fontWeight="700" color="$color">
            {attack.name}
          </Text>
        </YStack>
      </Card>

      {/* Attack Bonus - Colapsable */}
        <Collapsible
          title="Attack Bonus"
          value={attackBonusValue}
          isExpanded={attackBonusExpanded}
          onToggle={() => setAttackBonusExpanded(!attackBonusExpanded)}
          showExpandIcon={calculatedAttack.attackBonus.sourceValues.length > 1}
        >
          <Card
            padding={16}
            backgroundColor="$background"
            borderWidth={1}
            borderTopWidth={0}
            borderColor="$borderColor"
            borderTopLeftRadius={0}
            borderTopRightRadius={0}
            borderBottomLeftRadius={4}
            borderBottomRightRadius={4}
          >
            <SourceValuesTable sourceValues={calculatedAttack.attackBonus.sourceValues} />
          </Card>
        </Collapsible>

      {/* Damage - Colapsable */}
      <Collapsible
        title="Damage"
        value={damageValue}
        isExpanded={damageExpanded}
        onToggle={() => setDamageExpanded(!damageExpanded)}
        showExpandIcon={damageSourceValues.length > 1}
      >
        <Card
          padding={16}
          backgroundColor="$background"
          borderWidth={1}
          borderTopWidth={0}
          borderColor="$borderColor"
          borderTopLeftRadius={0}
          borderTopRightRadius={0}
          borderBottomLeftRadius={4}
          borderBottomRightRadius={4}
        >
          <SourceValuesTable sourceValues={damageSourceValues} />
        </Card>
      </Collapsible>

      {/* Contextual Changes */}
      {hasContextualChanges && (
        <Card
          padding={16}
          backgroundColor="$background"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius={4}
        >
          <Text fontSize={14} fontWeight="700" marginBottom={12} color="$color">
            MODIFIERS
          </Text>
          <YStack gap={8}>
            {availableContextualChanges.map((change, index) => (
              <ContextualChangeToggle
                key={`${change.name}-${index}`}
                contextualChange={change}
                isSelected={selectedChanges.has(change.name)}
                onToggle={() => toggleChange(change.name)}
                variables={variables[change.name]}
                onVariableChange={(varId, value) =>
                  updateVariable(change.name, varId, value)
                }
              />
            ))}
          </YStack>
        </Card>
      )}

      {/* Description */}
      <Card
        padding={16}
        backgroundColor="$background"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius={4}
      >
        <Text fontSize={14} fontWeight="700" marginBottom={12} color="$color">
          DESCRIPTION
        </Text>
        <Text fontSize={14} color="$placeholderColor" lineHeight={22}>
          {isMelee
            ? 'Melee attacks use Strength modifier for attack and damage rolls by default. Two-handed weapons apply 1.5x Strength bonus to damage.'
            : 'Ranged attacks use Dexterity modifier for attack rolls. Damage bonuses from Strength are not applied unless the weapon has the Mighty property.'}
        </Text>
      </Card>
    </YStack>
  )
}
