import { Pressable } from 'react-native'
import { YStack, Text } from 'tamagui'
import { useTheme } from '../../../contexts/ThemeContext'
import {
  type AnyChange,
  getFormulaExpression,
  formatBonus,
  getChangeTypeLabel,
  getChangeTarget,
} from './changeHelpers'

type ChangeCardProps = {
  change: AnyChange
  onPress?: () => void
  onDelete?: () => void
}

/**
 * Card compacta que muestra un Change.
 * Diseño:
 * ┌─────────────────────────────────┐
 * │ ABILITY_SCORE                   │
 * │ Strength • Enhancement • +4     │
 * └─────────────────────────────────┘
 */
export function ChangeCard({ change, onPress, onDelete }: ChangeCardProps) {
  'use no memo'
  const { themeColors } = useTheme()

  const typeLabel = getChangeTypeLabel(change)
  const target = getChangeTarget(change)
  const formula = formatBonus(getFormulaExpression(change.formula))
  const bonusType = change.bonusTypeId

  // Construir la línea de detalle
  const detailParts = [target, bonusType, formula].filter(Boolean)
  const detailLine = detailParts.join(' • ')

  const content = (
    <YStack
      gap={2}
      paddingVertical={10}
      paddingHorizontal={12}
      backgroundColor="$uiBackgroundColor"
      borderRadius={8}
      borderWidth={1}
      borderColor="$borderColor"
    >
      <Text fontSize={11} color="$placeholderColor" textTransform="uppercase">
        {typeLabel}
      </Text>
      <Text fontSize={14} color="$color" fontWeight="500">
        {detailLine}
      </Text>
    </YStack>
  )

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <YStack opacity={pressed ? 0.7 : 1}>
            {content}
          </YStack>
        )}
      </Pressable>
    )
  }

  return content
}
