import { Text, YStack } from 'tamagui'
import type { SourceValue } from '@zukus/core'
import { SourceValuesTable } from './SourceValuesTable'

const SAVING_THROW_INFO: Record<string, { name: string; description: string }> = {
  fortitude: {
    name: 'Fortitude',
    description: 'Fortitude saves measure your ability to stand up to physical punishment or attacks against your vitality and health. Apply your Constitution modifier to your Fortitude saving throws.',
  },
  reflex: {
    name: 'Reflex',
    description: 'Reflex saves test your ability to dodge area attacks and unexpected situations. Apply your Dexterity modifier to your Reflex saving throws.',
  },
  will: {
    name: 'Will',
    description: 'Will saves reflect your resistance to mental influence as well as many magical effects. Apply your Wisdom modifier to your Will saving throws.',
  },
}

export type SavingThrowDetailPanelProps = {
  savingThrowKey: string
  totalValue: number
  sourceValues?: SourceValue[]
}

/**
 * Panel de detalle de Saving Throw.
 * Muestra el valor total y el desglose de modificadores.
 * Compartido entre mobile (DetailScreen) y desktop (SidePanel).
 */
export function SavingThrowDetailPanel({
  savingThrowKey,
  totalValue,
  sourceValues = [],
}: SavingThrowDetailPanelProps) {
  const info = SAVING_THROW_INFO[savingThrowKey]

  return (
    <YStack gap={16}>
      <YStack>
        <YStack alignItems="center" gap={8}>
          <Text fontSize={24} fontWeight="700" color="$color">
            {info?.name ?? savingThrowKey}
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
          {info?.description ?? ''}
        </Text>
      </YStack>
    </YStack>
  )
}
