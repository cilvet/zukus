import { YStack, Text } from 'tamagui'
import type { CalculatedAttack } from '@zukus/core'
import { AttackCard } from './AttackCard'

export type AttacksSectionProps = {
  attacks: CalculatedAttack[]
  onAttackPress?: (attack: CalculatedAttack) => void
  /** Si es false, no se disparan animaciones de glow. Default: true */
  glowEnabled?: boolean
}

/**
 * Seccion de ataques del character sheet.
 * Lista los ataques disponibles separados por tipo (melee/ranged).
 */
export function AttacksSection({ attacks, onAttackPress, glowEnabled = true }: AttacksSectionProps) {
  const meleeAttacks = attacks.filter(a => a.type === 'melee')
  const rangedAttacks = attacks.filter(a => a.type === 'ranged')
  const otherAttacks = attacks.filter(a => a.type !== 'melee' && a.type !== 'ranged')

  const hasNoAttacks = attacks.length === 0

  if (hasNoAttacks) {
    return (
      <YStack padding={16}>
        <Text fontSize={13} color="$placeholderColor" fontStyle="italic" textAlign="center">
          Sin ataques disponibles
        </Text>
      </YStack>
    )
  }

  return (
    <YStack gap={16}>
      {meleeAttacks.length > 0 && (
        <YStack gap={8}>
          <Text fontSize={12} fontWeight="600" color="$placeholderColor" textTransform="uppercase">
            Melee
          </Text>
          {meleeAttacks.map((attack) => (
            <AttackCard
              key={attack.weaponUniqueId ?? attack.name}
              attack={attack}
              onPress={() => onAttackPress?.(attack)}
              glowEnabled={glowEnabled}
            />
          ))}
        </YStack>
      )}

      {rangedAttacks.length > 0 && (
        <YStack gap={8}>
          <Text fontSize={12} fontWeight="600" color="$placeholderColor" textTransform="uppercase">
            Ranged
          </Text>
          {rangedAttacks.map((attack) => (
            <AttackCard
              key={attack.weaponUniqueId ?? attack.name}
              attack={attack}
              onPress={() => onAttackPress?.(attack)}
              glowEnabled={glowEnabled}
            />
          ))}
        </YStack>
      )}

      {otherAttacks.length > 0 && (
        <YStack gap={8}>
          <Text fontSize={12} fontWeight="600" color="$placeholderColor" textTransform="uppercase">
            Other
          </Text>
          {otherAttacks.map((attack) => (
            <AttackCard
              key={attack.weaponUniqueId ?? attack.name}
              attack={attack}
              onPress={() => onAttackPress?.(attack)}
              glowEnabled={glowEnabled}
            />
          ))}
        </YStack>
      )}
    </YStack>
  )
}
