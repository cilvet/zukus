import { YStack, XStack, Text } from 'tamagui'
import type { Buff } from '@zukus/core'
import { Checkbox, Button } from '../../atoms'
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

  const summary = getChangeSummary(change)
  // Extraer el valor numérico si existe para destacarlo
  const match = summary.match(/([+-]?\d+)/)
  const value = match ? match[1] : null

  return (
    <XStack
      paddingVertical={10}
      paddingHorizontal={14}
      backgroundColor="$uiBackgroundColor"
      borderRadius={8}
      borderWidth={1}
      borderColor="$borderColor"
      alignItems="center"
      gap={10}
    >
      {value && (
        <Text
          fontSize={15}
          fontWeight="700"
          color={colors.accent}
          minWidth={36}
        >
          {value.startsWith('-') ? value : `+${value.replace('+', '')}`}
        </Text>
      )}
      <Text fontSize={13} color={colors.primary} flex={1}>
        {summary.replace(/[+-]?\d+\s*/, '').trim()}
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
    <YStack gap={24} padding={16}>
      {/* Header con nombre y estado */}
      <YStack gap={12}>
        <XStack alignItems="flex-start" justifyContent="space-between" gap={16}>
          <YStack flex={1} gap={6}>
            <Text fontSize={22} fontWeight="700" color={colors.primary}>
              {buff.name}
            </Text>
            <XStack alignItems="center" gap={8}>
              <Text
                fontSize={11}
                fontWeight="600"
                color={colors.accent}
                textTransform="uppercase"
                letterSpacing={0.5}
              >
                {buff.originType}
              </Text>
            </XStack>
          </YStack>
          <XStack
            alignItems="center"
            gap={10}
            paddingVertical={8}
            paddingHorizontal={12}
            backgroundColor="$uiBackgroundColor"
            borderRadius={8}
          >
            <Text
              fontSize={12}
              fontWeight="600"
              color={buff.active ? colors.accent : '$placeholderColor'}
            >
              {buff.active ? 'Active' : 'Inactive'}
            </Text>
            <Checkbox
              checked={buff.active}
              onCheckedChange={onToggleActive}
              size="small"
              variant="diamond"
            />
          </XStack>
        </XStack>

        {/* Descripcion inline si existe */}
        {buff.description ? (
          <Text fontSize={14} color="$placeholderColor" lineHeight={20}>
            {buff.description}
          </Text>
        ) : null}
      </YStack>

      {/* Changes */}
      {hasChanges ? (
        <YStack gap={12}>
          <XStack alignItems="center" gap={8}>
            <Text fontSize={13} fontWeight="600" color={colors.accent}>
              Effects
            </Text>
            <Text fontSize={12} color="$placeholderColor">
              ({buff.changes!.length})
            </Text>
          </XStack>
          <YStack gap={8}>
            {buff.changes!.map((change, index) => (
              <ChangeItem key={`change-${index}`} change={change} />
            ))}
          </YStack>
        </YStack>
      ) : (
        <YStack
          padding={16}
          backgroundColor="$uiBackgroundColor"
          borderRadius={8}
          borderWidth={1}
          borderColor="$borderColor"
          borderStyle="dashed"
          alignItems="center"
        >
          <Text fontSize={13} color="$placeholderColor">
            No effects defined
          </Text>
        </YStack>
      )}

      {/* Contextual Changes */}
      {hasContextualChanges ? (
        <YStack gap={8}>
          <Text fontSize={13} fontWeight="600" color={colors.accent}>
            Contextual Effects
          </Text>
          <XStack
            padding={12}
            backgroundColor="$uiBackgroundColor"
            borderRadius={8}
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Text fontSize={12} color="$placeholderColor">
              {buff.contextualChanges!.length} contextual effect(s)
            </Text>
          </XStack>
        </YStack>
      ) : null}

      {/* Special Changes */}
      {hasSpecialChanges ? (
        <YStack gap={8}>
          <Text fontSize={13} fontWeight="600" color={colors.accent}>
            Special Effects
          </Text>
          <XStack
            padding={12}
            backgroundColor="$uiBackgroundColor"
            borderRadius={8}
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Text fontSize={12} color="$placeholderColor">
              {buff.specialChanges!.length} special effect(s)
            </Text>
          </XStack>
        </YStack>
      ) : null}

      {/* Botones de accion */}
      {(onEdit || onDelete) ? (
        <XStack gap={12} marginTop={8}>
          {onDelete ? (
            <Button variant="destructive" onPress={onDelete} size="small">
              Delete
            </Button>
          ) : null}
          <XStack flex={1} justifyContent="flex-end">
            {onEdit ? (
              <Button variant="primary" onPress={onEdit}>
                Edit Buff
              </Button>
            ) : null}
          </XStack>
        </XStack>
      ) : null}
    </YStack>
  )
}
