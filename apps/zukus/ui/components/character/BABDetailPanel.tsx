import { Text, YStack, XStack, Card } from 'tamagui'
import type { SourceValue } from '@zukus/core'
import { SourceValuesTable } from './SourceValuesTable'

export type BABDetailPanelProps = {
  totalValue: number
  multipleAttacks?: number[]
  sourceValues?: SourceValue[]
}

const BAB_DESCRIPTION = 'Base Attack Bonus (BAB) represents your base combat proficiency. It determines your accuracy with weapons and how many attacks you can make per round. At higher levels, a high BAB grants additional attacks at reduced bonuses.'

function formatBAB(totalValue: number, multipleAttacks?: number[]): string {
  if (multipleAttacks && multipleAttacks.length > 1) {
    return multipleAttacks.map(v => (v >= 0 ? `+${v}` : `${v}`)).join('/')
  }
  return totalValue >= 0 ? `+${totalValue}` : `${totalValue}`
}

/**
 * Panel de detalle de Base Attack Bonus.
 * Muestra el valor total (con ataques multiples si aplica) y el desglose de modificadores.
 * Compartido entre mobile (DetailScreen) y desktop (SidePanel).
 */
export function BABDetailPanel({
  totalValue,
  multipleAttacks,
  sourceValues = [],
}: BABDetailPanelProps) {
  const hasMultipleAttacks = multipleAttacks && multipleAttacks.length > 1

  return (
    <YStack gap={16} padding={4}>
      <Card
        padding={16}
        backgroundColor="$background"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius={4}
      >
        <YStack alignItems="center" gap={8}>
          <Text fontSize={24} fontWeight="700" color="$color">
            Base Attack Bonus
          </Text>
          <Text fontSize={48} fontWeight="700" color="$color">
            {formatBAB(totalValue, multipleAttacks)}
          </Text>
          {hasMultipleAttacks && (
            <Text fontSize={12} color="$placeholderColor">
              {multipleAttacks.length} attacks per round
            </Text>
          )}
        </YStack>
      </Card>

      {hasMultipleAttacks && (
        <Card
          padding={16}
          backgroundColor="$background"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius={4}
        >
          <Text fontSize={14} fontWeight="700" marginBottom={12} color="$color">
            ATAQUES POR RONDA
          </Text>
          <YStack gap={8}>
            {multipleAttacks.map((attack, index) => (
              <XStack key={index} justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color="$placeholderColor">
                  Ataque {index + 1}
                </Text>
                <Text fontSize={16} fontWeight="700" color="$color">
                  {attack >= 0 ? '+' : ''}{attack}
                </Text>
              </XStack>
            ))}
          </YStack>
        </Card>
      )}

      <Card
        padding={16}
        backgroundColor="$background"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius={4}
      >
        <Text fontSize={14} fontWeight="700" marginBottom={12} color="$color">
          MODIFICADORES
        </Text>
        <SourceValuesTable sourceValues={sourceValues} />
      </Card>

      <Card
        padding={16}
        backgroundColor="$background"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius={4}
      >
        <Text fontSize={14} fontWeight="700" marginBottom={12} color="$color">
          DESCRIPCION
        </Text>
        <Text fontSize={14} color="$placeholderColor" lineHeight={22}>
          {BAB_DESCRIPTION}
        </Text>
      </Card>
    </YStack>
  )
}
