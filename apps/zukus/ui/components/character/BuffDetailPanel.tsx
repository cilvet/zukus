import { YStack, XStack, Text } from 'tamagui'
import type { Buff } from '@zukus/core'
import { Checkbox } from '../../atoms'
import { useTheme } from '../../contexts/ThemeContext'

type BuffDetailPanelProps = {
  buff: Buff
  onToggleActive: () => void
  onEdit?: () => void
  onDelete?: () => void
}

// Tipo local para los changes (evita importar desde paths internos de core)
type AnyChange = NonNullable<Buff['changes']>[number]

/**
 * Extrae la expresión de una formula (maneja diferentes tipos de formula)
 */
function getFormulaExpression(formula: AnyChange['formula']): string {
  if ('expression' in formula) {
    return formula.expression
  }
  if ('type' in formula && formula.type === 'switch') {
    return '[switch]'
  }
  return '[formula]'
}

/**
 * Genera un resumen legible de un Change para mostrar en la UI.
 */
function getChangeSummary(change: AnyChange): string {
  const bonusType = change.bonusTypeId
  const formula = getFormulaExpression(change.formula)

  switch (change.type) {
    case 'ABILITY_SCORE':
      return `${(change as { abilityUniqueId: string }).abilityUniqueId} ${formatBonus(formula)} (${bonusType})`
    case 'AC':
      return `AC ${formatBonus(formula)} (${bonusType})`
    case 'NATURAL_AC':
      return `Natural AC ${formatBonus(formula)} (${bonusType})`
    case 'SAVING_THROW':
      return `${(change as { savingThrowUniqueId: string }).savingThrowUniqueId} save ${formatBonus(formula)} (${bonusType})`
    case 'SKILL':
      return `${(change as { skillUniqueId: string }).skillUniqueId} ${formatBonus(formula)} (${bonusType})`
    case 'ABILITY_SKILLS':
      return `${(change as { abilityUniqueId: string }).abilityUniqueId} skills ${formatBonus(formula)} (${bonusType})`
    case 'BAB':
      return `BAB ${formatBonus(formula)} (${bonusType})`
    case 'INITIATIVE':
      return `Initiative ${formatBonus(formula)} (${bonusType})`
    case 'SPEED':
      return `${(change as { speedUniqueId: string }).speedUniqueId} speed ${formatBonus(formula)} (${bonusType})`
    case 'ATTACK_ROLLS':
      return `Attack ${formatBonus(formula)} (${bonusType})`
    case 'DAMAGE':
      return `Damage ${formatBonus(formula)} (${bonusType})`
    case 'TEMPORARY_HP':
      return `Temp HP ${formatBonus(formula)} (${bonusType})`
    case 'SIZE':
      return `Size ${formatBonus(formula)}`
    case 'WEAPON_SIZE':
      return `Weapon Size ${formatBonus(formula)}`
    case 'CUSTOM_VARIABLE':
      return `${(change as { uniqueId: string }).uniqueId} ${formatBonus(formula)} (${bonusType})`
    default:
      return `${change.type} ${formatBonus(formula)}`
  }
}

function formatBonus(expression: string): string {
  const num = Number(expression)
  if (!Number.isNaN(num) && num >= 0) {
    return `+${expression}`
  }
  return expression
}

function ChangeItem({ change }: { change: AnyChange }) {
  const { themeInfo } = useTheme()
  const colors = themeInfo.colors

  return (
    <XStack
      paddingVertical={8}
      paddingHorizontal={12}
      backgroundColor="$uiBackgroundColor"
      borderRadius={6}
    >
      <Text fontSize={13} color={colors.primary}>
        {getChangeSummary(change)}
      </Text>
    </XStack>
  )
}

/**
 * Panel de detalle de un Buff.
 * Muestra información del buff, toggle de activo, y lista de changes.
 * Compartido entre mobile y desktop.
 */
export function BuffDetailPanel({
  buff,
  onToggleActive,
  onEdit,
  onDelete,
}: BuffDetailPanelProps) {
  const { themeInfo } = useTheme()
  const colors = themeInfo.colors

  const hasChanges = buff.changes && buff.changes.length > 0
  const hasContextualChanges = buff.contextualChanges && buff.contextualChanges.length > 0
  const hasSpecialChanges = buff.specialChanges && buff.specialChanges.length > 0

  return (
    <YStack gap={20}>
      {/* Header con nombre y toggle */}
      <XStack alignItems="center" justifyContent="space-between">
        <YStack flex={1} gap={4}>
          <Text fontSize={24} fontWeight="700" color={colors.primary}>
            {buff.name}
          </Text>
          <Text fontSize={12} color={colors.accent} textTransform="uppercase">
            {buff.originType}
          </Text>
        </YStack>
        <Checkbox
          checked={buff.active}
          onCheckedChange={onToggleActive}
          size="small"
          variant="diamond"
        />
      </XStack>

      {/* Descripcion */}
      {buff.description ? (
        <YStack gap={8}>
          <Text fontSize={13} fontWeight="600" color={colors.accent}>
            Description
          </Text>
          <Text fontSize={14} color={colors.primary} lineHeight={20}>
            {buff.description}
          </Text>
        </YStack>
      ) : null}

      {/* Changes */}
      {hasChanges ? (
        <YStack gap={12}>
          <Text fontSize={13} fontWeight="600" color={colors.accent}>
            Changes
          </Text>
          <YStack gap={6}>
            {buff.changes!.map((change, index) => (
              <ChangeItem key={`change-${index}`} change={change} />
            ))}
          </YStack>
        </YStack>
      ) : null}

      {/* Contextual Changes - solo indicador por ahora */}
      {hasContextualChanges ? (
        <YStack gap={8}>
          <Text fontSize={13} fontWeight="600" color={colors.accent}>
            Contextual Changes
          </Text>
          <Text fontSize={12} color="$placeholderColor">
            {buff.contextualChanges!.length} contextual change(s)
          </Text>
        </YStack>
      ) : null}

      {/* Special Changes - solo indicador por ahora */}
      {hasSpecialChanges ? (
        <YStack gap={8}>
          <Text fontSize={13} fontWeight="600" color={colors.accent}>
            Special Changes
          </Text>
          <Text fontSize={12} color="$placeholderColor">
            {buff.specialChanges!.length} special change(s)
          </Text>
        </YStack>
      ) : null}

      {/* Botones de accion */}
      {(onEdit || onDelete) ? (
        <XStack justifyContent="space-between" paddingTop={8}>
          {onDelete ? (
            <Text
              fontSize={14}
              color="$destructiveColor"
              onPress={onDelete}
              pressStyle={{ opacity: 0.7 }}
            >
              Delete
            </Text>
          ) : <YStack />}
          {onEdit ? (
            <Text
              fontSize={14}
              color={colors.accent}
              onPress={onEdit}
              pressStyle={{ opacity: 0.7 }}
            >
              Edit Buff
            </Text>
          ) : null}
        </XStack>
      ) : null}
    </YStack>
  )
}
