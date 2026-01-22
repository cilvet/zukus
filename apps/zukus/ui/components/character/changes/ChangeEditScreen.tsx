import { useState, useEffect } from 'react'
import { TextInput, StyleSheet, Pressable } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { useTheme } from '../../../contexts/ThemeContext'
import { SearchableSelectModal } from '../../../atoms'
import { getFormulaExpression, type AnyChange } from './changeHelpers'

type ChangeEditScreenProps = {
  change: AnyChange | null
  isNew: boolean
  onSave: (change: AnyChange) => void
  onDelete?: () => void
  onCancel: () => void
}

// Tipos de cambio disponibles
const CHANGE_TYPE_OPTIONS = [
  { value: 'ABILITY_SCORE', label: 'Ability Score', description: 'Modify an ability score (STR, DEX, etc.)' },
  { value: 'AC', label: 'Armor Class', description: 'Modify armor class' },
  { value: 'NATURAL_AC', label: 'Natural AC', description: 'Modify natural armor' },
  { value: 'SAVING_THROW', label: 'Saving Throw', description: 'Modify a saving throw' },
  { value: 'SKILL', label: 'Skill', description: 'Modify a specific skill' },
  { value: 'ABILITY_SKILLS', label: 'Ability Skills', description: 'Modify all skills of an ability' },
  { value: 'BAB', label: 'BAB', description: 'Modify base attack bonus' },
  { value: 'INITIATIVE', label: 'Initiative', description: 'Modify initiative' },
  { value: 'SPEED', label: 'Speed', description: 'Modify movement speed' },
  { value: 'ATTACK_ROLLS', label: 'Attack Rolls', description: 'Modify all attack rolls' },
  { value: 'DAMAGE', label: 'Damage', description: 'Modify damage rolls' },
  { value: 'TEMPORARY_HP', label: 'Temporary HP', description: 'Add temporary hit points' },
  { value: 'SIZE', label: 'Size', description: 'Modify creature size' },
  { value: 'CUSTOM_VARIABLE', label: 'Custom Variable', description: 'Modify a custom variable' },
]

// Tipos de bonus disponibles
const BONUS_TYPE_OPTIONS = [
  { value: 'UNTYPED', label: 'Untyped', description: 'Stacks with everything' },
  { value: 'ENHANCEMENT', label: 'Enhancement', description: 'Magic item bonuses' },
  { value: 'MORALE', label: 'Morale', description: 'From inspiration or courage' },
  { value: 'LUCK', label: 'Luck', description: 'Fortune-based bonuses' },
  { value: 'INSIGHT', label: 'Insight', description: 'Premonition or sixth sense' },
  { value: 'COMPETENCE', label: 'Competence', description: 'Training or expertise' },
  { value: 'PROFANE', label: 'Profane', description: 'Evil divine power' },
  { value: 'DIVINE', label: 'Divine', description: 'Holy power' },
  { value: 'SACRED', label: 'Sacred', description: 'Good divine power' },
  { value: 'RESISTANCE', label: 'Resistance', description: 'Saving throw bonuses' },
  { value: 'CIRCUMSTANCE', label: 'Circumstance', description: 'Situational bonuses' },
  { value: 'DODGE', label: 'Dodge', description: 'AC from dodging' },
  { value: 'DEFLECTION', label: 'Deflection', description: 'AC from force effects' },
  { value: 'SIZE', label: 'Size', description: 'From creature size' },
  { value: 'RACIAL', label: 'Racial', description: 'From race' },
]

// Abilities para selectors
const ABILITY_OPTIONS = [
  { value: 'strength', label: 'Strength', description: 'Physical power' },
  { value: 'dexterity', label: 'Dexterity', description: 'Agility and reflexes' },
  { value: 'constitution', label: 'Constitution', description: 'Health and stamina' },
  { value: 'intelligence', label: 'Intelligence', description: 'Learning and reasoning' },
  { value: 'wisdom', label: 'Wisdom', description: 'Perception and insight' },
  { value: 'charisma', label: 'Charisma', description: 'Force of personality' },
]

// Saving throws para selectors
const SAVING_THROW_OPTIONS = [
  { value: 'FORTITUDE', label: 'Fortitude', description: 'Physical resilience' },
  { value: 'REFLEX', label: 'Reflex', description: 'Dodge and evade' },
  { value: 'WILL', label: 'Will', description: 'Mental resistance' },
  { value: 'ALL', label: 'All', description: 'All saving throws' },
]

type SelectFieldProps = {
  label: string
  value: string
  displayValue: string
  onPress: () => void
}

function SelectField({ label, value, displayValue, onPress }: SelectFieldProps) {
  return (
    <YStack gap={8}>
      <Text fontSize={13} fontWeight="600" color="$placeholderColor">
        {label}
      </Text>
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <XStack
            paddingVertical={12}
            paddingHorizontal={14}
            backgroundColor="$uiBackgroundColor"
            borderRadius={8}
            borderWidth={1}
            borderColor="$borderColor"
            justifyContent="space-between"
            alignItems="center"
            opacity={pressed ? 0.7 : 1}
          >
            <Text fontSize={15} color="$color">
              {displayValue || 'Select...'}
            </Text>
            <Text fontSize={14} color="$placeholderColor">
              ›
            </Text>
          </XStack>
        )}
      </Pressable>
    </YStack>
  )
}

export function ChangeEditScreen({
  change,
  isNew,
  onSave,
  onDelete,
  onCancel,
}: ChangeEditScreenProps) {
  'use no memo'
  const { themeColors } = useTheme()

  // Estado del formulario
  const [changeType, setChangeType] = useState<string>('ABILITY_SCORE')
  const [bonusType, setBonusType] = useState<string>('UNTYPED')
  const [formula, setFormula] = useState('')

  // Campos específicos según tipo
  const [abilityId, setAbilityId] = useState('strength')
  const [savingThrowId, setSavingThrowId] = useState('FORTITUDE')
  const [skillId, setSkillId] = useState('')
  const [speedId, setSpeedId] = useState('land')
  const [customVariableId, setCustomVariableId] = useState('')

  // Estado de modales
  const [activeModal, setActiveModal] = useState<string | null>(null)

  // Sincronizar con el change cuando cambia
  useEffect(() => {
    if (change) {
      setChangeType(change.type)
      setBonusType(change.bonusTypeId)
      setFormula(getFormulaExpression(change.formula))

      if ('abilityUniqueId' in change) {
        setAbilityId((change as { abilityUniqueId: string }).abilityUniqueId)
      }
      if ('savingThrowUniqueId' in change) {
        setSavingThrowId((change as { savingThrowUniqueId: string }).savingThrowUniqueId)
      }
      if ('skillUniqueId' in change) {
        setSkillId((change as { skillUniqueId: string }).skillUniqueId)
      }
      if ('speedUniqueId' in change) {
        setSpeedId((change as { speedUniqueId: string }).speedUniqueId)
      }
      if (change.type === 'CUSTOM_VARIABLE' && 'uniqueId' in change) {
        setCustomVariableId((change as { uniqueId: string }).uniqueId)
      }
    }
  }, [change])

  const handleSave = () => {
    const baseChange = {
      formula: { expression: formula },
      bonusTypeId: bonusType,
      type: changeType,
    }

    let finalChange: AnyChange

    switch (changeType) {
      case 'ABILITY_SCORE':
        finalChange = { ...baseChange, type: 'ABILITY_SCORE', abilityUniqueId: abilityId } as AnyChange
        break
      case 'ABILITY_SKILLS':
        finalChange = { ...baseChange, type: 'ABILITY_SKILLS', abilityUniqueId: abilityId } as AnyChange
        break
      case 'SAVING_THROW':
        finalChange = { ...baseChange, type: 'SAVING_THROW', savingThrowUniqueId: savingThrowId } as AnyChange
        break
      case 'SKILL':
        finalChange = { ...baseChange, type: 'SKILL', skillUniqueId: skillId } as AnyChange
        break
      case 'SPEED':
        finalChange = { ...baseChange, type: 'SPEED', speedUniqueId: speedId } as AnyChange
        break
      case 'CUSTOM_VARIABLE':
        finalChange = { ...baseChange, type: 'CUSTOM_VARIABLE', uniqueId: customVariableId } as AnyChange
        break
      default:
        finalChange = { ...baseChange, type: changeType } as AnyChange
    }

    onSave(finalChange)
  }

  const getChangeTypeLabel = () => {
    return CHANGE_TYPE_OPTIONS.find((opt) => opt.value === changeType)?.label ?? changeType
  }

  const getBonusTypeLabel = () => {
    return BONUS_TYPE_OPTIONS.find((opt) => opt.value === bonusType)?.label ?? bonusType
  }

  const getAbilityLabel = () => {
    return ABILITY_OPTIONS.find((opt) => opt.value === abilityId)?.label ?? abilityId
  }

  const getSavingThrowLabel = () => {
    return SAVING_THROW_OPTIONS.find((opt) => opt.value === savingThrowId)?.label ?? savingThrowId
  }

  // Renderizar campos específicos según el tipo de change
  const renderTypeSpecificFields = () => {
    switch (changeType) {
      case 'ABILITY_SCORE':
      case 'ABILITY_SKILLS':
        return (
          <SelectField
            label="Ability"
            value={abilityId}
            displayValue={getAbilityLabel()}
            onPress={() => setActiveModal('ability')}
          />
        )

      case 'SAVING_THROW':
        return (
          <SelectField
            label="Saving Throw"
            value={savingThrowId}
            displayValue={getSavingThrowLabel()}
            onPress={() => setActiveModal('savingThrow')}
          />
        )

      case 'SKILL':
        return (
          <YStack gap={8}>
            <Text fontSize={13} fontWeight="600" color="$placeholderColor">
              Skill ID
            </Text>
            <TextInput
              value={skillId}
              onChangeText={setSkillId}
              placeholder="e.g., stealth, perception"
              placeholderTextColor={themeColors.placeholderColor}
              style={[
                styles.input,
                {
                  backgroundColor: themeColors.uiBackgroundColor,
                  color: themeColors.color,
                  borderColor: themeColors.borderColor,
                },
              ]}
            />
          </YStack>
        )

      case 'SPEED':
        return (
          <YStack gap={8}>
            <Text fontSize={13} fontWeight="600" color="$placeholderColor">
              Speed Type
            </Text>
            <TextInput
              value={speedId}
              onChangeText={setSpeedId}
              placeholder="e.g., land, fly, swim"
              placeholderTextColor={themeColors.placeholderColor}
              style={[
                styles.input,
                {
                  backgroundColor: themeColors.uiBackgroundColor,
                  color: themeColors.color,
                  borderColor: themeColors.borderColor,
                },
              ]}
            />
          </YStack>
        )

      case 'CUSTOM_VARIABLE':
        return (
          <YStack gap={8}>
            <Text fontSize={13} fontWeight="600" color="$placeholderColor">
              Variable ID
            </Text>
            <TextInput
              value={customVariableId}
              onChangeText={setCustomVariableId}
              placeholder="e.g., sneakAttackDice"
              placeholderTextColor={themeColors.placeholderColor}
              style={[
                styles.input,
                {
                  backgroundColor: themeColors.uiBackgroundColor,
                  color: themeColors.color,
                  borderColor: themeColors.borderColor,
                },
              ]}
            />
          </YStack>
        )

      default:
        return null
    }
  }

  return (
    <YStack gap={20} padding={16}>
      {/* Tipo de cambio */}
      <SelectField
        label="Change Type"
        value={changeType}
        displayValue={getChangeTypeLabel()}
        onPress={() => setActiveModal('changeType')}
      />

      {/* Campos específicos del tipo */}
      {renderTypeSpecificFields()}

      {/* Tipo de bonus */}
      <SelectField
        label="Bonus Type"
        value={bonusType}
        displayValue={getBonusTypeLabel()}
        onPress={() => setActiveModal('bonusType')}
      />

      {/* Formula */}
      <YStack gap={8}>
        <Text fontSize={13} fontWeight="600" color="$placeholderColor">
          Formula / Value
        </Text>
        <TextInput
          value={formula}
          onChangeText={setFormula}
          placeholder="e.g., 4, 1d6, @level"
          placeholderTextColor={themeColors.placeholderColor}
          style={[
            styles.input,
            {
              backgroundColor: themeColors.uiBackgroundColor,
              color: themeColors.color,
              borderColor: themeColors.borderColor,
            },
          ]}
        />
        <Text fontSize={11} color="$placeholderColor">
          Use @ to reference variables (e.g., @level, @ability.strength.modifier)
        </Text>
      </YStack>

      {/* Botones de accion */}
      <XStack gap={12} marginTop={8}>
        {onDelete && !isNew && (
          <XStack
            flex={1}
            paddingVertical={12}
            paddingHorizontal={16}
            backgroundColor="$destructiveBackground"
            borderRadius={8}
            justifyContent="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={onDelete}
          >
            <Text fontSize={14} fontWeight="600" color="$destructiveColor">
              Delete
            </Text>
          </XStack>
        )}
        <XStack
          flex={2}
          paddingVertical={12}
          paddingHorizontal={16}
          backgroundColor="$accent"
          borderRadius={8}
          justifyContent="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={handleSave}
        >
          <Text fontSize={14} fontWeight="600" color="$accentContrastText">
            {isNew ? 'Add Change' : 'Save Changes'}
          </Text>
        </XStack>
      </XStack>

      {/* Modales de selección */}
      <SearchableSelectModal
        visible={activeModal === 'changeType'}
        onClose={() => setActiveModal(null)}
        title="Select Change Type"
        options={CHANGE_TYPE_OPTIONS}
        selectedValue={changeType}
        onSelect={setChangeType}
        placeholder="Search change types..."
      />

      <SearchableSelectModal
        visible={activeModal === 'bonusType'}
        onClose={() => setActiveModal(null)}
        title="Select Bonus Type"
        options={BONUS_TYPE_OPTIONS}
        selectedValue={bonusType}
        onSelect={setBonusType}
        placeholder="Search bonus types..."
      />

      <SearchableSelectModal
        visible={activeModal === 'ability'}
        onClose={() => setActiveModal(null)}
        title="Select Ability"
        options={ABILITY_OPTIONS}
        selectedValue={abilityId}
        onSelect={setAbilityId}
        placeholder="Search abilities..."
      />

      <SearchableSelectModal
        visible={activeModal === 'savingThrow'}
        onClose={() => setActiveModal(null)}
        title="Select Saving Throw"
        options={SAVING_THROW_OPTIONS}
        selectedValue={savingThrowId}
        onSelect={setSavingThrowId}
        placeholder="Search saving throws..."
      />
    </YStack>
  )
}

const styles = StyleSheet.create({
  input: {
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
})
