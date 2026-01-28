import { Text, YStack } from 'tamagui'
import type { SourceValue } from '@zukus/core'
import { SourceValuesTable } from './SourceValuesTable'

export type InitiativeDetailPanelProps = {
  totalValue: number
  sourceValues?: SourceValue[]
}

const INITIATIVE_DESCRIPTION = 'Initiative determines the order in which characters act during combat. At the start of a battle, each combatant makes an initiative check. The higher the result, the sooner the character acts. Apply your Dexterity modifier to your initiative check.'

/**
 * Panel de detalle de Initiative.
 * Muestra el valor total y el desglose de modificadores.
 * Compartido entre mobile (DetailScreen) y desktop (SidePanel).
 */
export function InitiativeDetailPanel({
  totalValue,
  sourceValues = [],
}: InitiativeDetailPanelProps) {
  return (
    <YStack gap={16}>
      <YStack>
        <YStack alignItems="center" gap={8}>
          <Text fontSize={24} fontWeight="700" color="$color">
            Initiative
          </Text>
          <Text fontSize={48} fontWeight="700" color="$color">
            {totalValue >= 0 ? '+' : ''}{totalValue}
          </Text>
        </YStack>
      </YStack>

      <YStack>
        <Text fontSize={14} fontWeight="700" marginBottom={12} color="$color">
          MODIFICADORES
        </Text>
        <SourceValuesTable sourceValues={sourceValues} />
      </YStack>

      <YStack>
        <Text fontSize={14} fontWeight="700" marginBottom={12} color="$color">
          DESCRIPCION
        </Text>
        <Text fontSize={14} color="$placeholderColor" lineHeight={22}>
          {INITIATIVE_DESCRIPTION}
        </Text>
      </YStack>
    </YStack>
  )
}
