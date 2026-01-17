import { XStack } from 'tamagui'
import { useCharacterSavingThrows } from '../../stores/characterStore'
import { useNavigateToDetail } from '../../../navigation'
import { SavingThrowCard } from './SavingThrowCard'

const SAVING_THROW_ORDER = ['fortitude', 'reflex', 'will'] as const

/**
 * Sección de Saving Throws - 3 cards horizontales.
 * Usa selector de Zustand para re-render granular.
 * Compartido entre mobile y desktop.
 */
export function SavingThrowsSection() {
  const savingThrows = useCharacterSavingThrows()
  const navigateToDetail = useNavigateToDetail()

  if (!savingThrows) {
    return null
  }

  const handlePress = (savingThrowKey: string) => {
    navigateToDetail('savingThrow', savingThrowKey)
  }

  return (
    <XStack gap={8}>
      {SAVING_THROW_ORDER.map((key) => {
        const savingThrow = savingThrows[key]
        return (
          <SavingThrowCard
            key={key}
            savingThrowKey={key}
            totalValue={savingThrow.totalValue}
            onPress={() => handlePress(key)}
          />
        )
      })}
    </XStack>
  )
}
