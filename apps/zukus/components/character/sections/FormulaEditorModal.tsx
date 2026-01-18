import { useState, useRef, useEffect } from 'react'
import {
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack, XStack, Text, View } from 'tamagui'
import {
  getMentionInfo,
  filterVariables,
  insertVariableInFormula,
  type VariableDefinition,
} from './formulaAutocomplete'

// Datos mock para desarrollo visual
const MOCK_VARIABLES: VariableDefinition[] = [
  // Abilities
  { id: 'ability.strength.score', displayName: 'Strength Score', category: 'Abilities', value: 16 },
  { id: 'ability.strength.modifier', displayName: 'Strength Modifier', category: 'Abilities', value: 3 },
  { id: 'ability.dexterity.score', displayName: 'Dexterity Score', category: 'Abilities', value: 14 },
  { id: 'ability.dexterity.modifier', displayName: 'Dexterity Modifier', category: 'Abilities', value: 2 },
  { id: 'ability.constitution.score', displayName: 'Constitution Score', category: 'Abilities', value: 12 },
  { id: 'ability.constitution.modifier', displayName: 'Constitution Modifier', category: 'Abilities', value: 1 },
  { id: 'ability.intelligence.score', displayName: 'Intelligence Score', category: 'Abilities', value: 10 },
  { id: 'ability.intelligence.modifier', displayName: 'Intelligence Modifier', category: 'Abilities', value: 0 },
  { id: 'ability.wisdom.score', displayName: 'Wisdom Score', category: 'Abilities', value: 13 },
  { id: 'ability.wisdom.modifier', displayName: 'Wisdom Modifier', category: 'Abilities', value: 1 },
  { id: 'ability.charisma.score', displayName: 'Charisma Score', category: 'Abilities', value: 8 },
  { id: 'ability.charisma.modifier', displayName: 'Charisma Modifier', category: 'Abilities', value: -1 },
  // Combat
  { id: 'bab.total', displayName: 'Base Attack Bonus', category: 'Combat', value: 5 },
  { id: 'initiative.total', displayName: 'Initiative', category: 'Combat', value: 6 },
  { id: 'ac.total', displayName: 'Armor Class', category: 'Combat', value: 18 },
  { id: 'ac.touch.total', displayName: 'Touch AC', category: 'Combat', value: 12 },
  { id: 'ac.flatFooted.total', displayName: 'Flat-Footed AC', category: 'Combat', value: 16 },
  // Saving Throws
  { id: 'savingThrow.fortitude.total', displayName: 'Fortitude Save', category: 'Saving Throws', value: 7 },
  { id: 'savingThrow.reflex.total', displayName: 'Reflex Save', category: 'Saving Throws', value: 4 },
  { id: 'savingThrow.will.total', displayName: 'Will Save', category: 'Saving Throws', value: 3 },
  // Other
  { id: 'level', displayName: 'Character Level', category: 'Other', value: 5 },
  { id: 'size.modifier', displayName: 'Size Modifier', category: 'Other', value: 0 },
]

type FormulaEditorModalProps = {
  visible: boolean
  onClose: () => void
  initialValue: string
  onApply: (formula: string) => void
}

export function FormulaEditorModal({
  visible,
  onClose,
  initialValue,
  onApply,
}: FormulaEditorModalProps) {
  const insets = useSafeAreaInsets()
  const inputRef = useRef<TextInput>(null)
  const [formula, setFormula] = useState(initialValue)

  // Sincronizar con initialValue cuando cambia
  useEffect(() => {
    setFormula(initialValue)
  }, [initialValue])

  // Auto-focus cuando se abre el modal
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [visible])

  const handleApply = () => {
    onApply(formula)
    onClose()
  }

  const mentionInfo = getMentionInfo(formula)

  const filteredVariables = mentionInfo.active
    ? filterVariables(MOCK_VARIABLES, mentionInfo.searchTerm)
    : []

  const handleInsertVariable = (variable: VariableDefinition) => {
    const newFormula = insertVariableInFormula(formula, mentionInfo, variable.id)
    setFormula(newFormula)

    setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
  }

  // Agrupar por categoría
  const groupedVariables = filteredVariables.reduce(
    (acc, variable) => {
      if (!acc[variable.category]) {
        acc[variable.category] = []
      }
      acc[variable.category].push(variable)
      return acc
    },
    {} as Record<string, VariableDefinition[]>
  )

  const categoryOrder = ['Abilities', 'Combat', 'Saving Throws', 'Other']

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View
        flex={1}
        backgroundColor="$background"
        paddingTop={insets.top}
        paddingBottom={insets.bottom}
      >
        {/* Header */}
        <XStack
          paddingHorizontal={16}
          paddingVertical={12}
          justifyContent="space-between"
          alignItems="center"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Pressable onPress={onClose} hitSlop={8}>
            <Text fontSize={16} color="$color">
              Cancel
            </Text>
          </Pressable>

          <Text fontSize={16} fontWeight="600" color="$color">
            Edit Formula
          </Text>

          <Pressable onPress={handleApply} hitSlop={8}>
            <Text fontSize={16} fontWeight="600" color="$blue10">
              Apply
            </Text>
          </Pressable>
        </XStack>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <YStack flex={1} padding={16} gap={12}>
            {/* Input de fórmula */}
            <TextInput
              ref={inputRef}
              value={formula}
              onChangeText={setFormula}
              placeholder="Type @ to insert variables"
              placeholderTextColor="#666"
              multiline
              style={{
                fontSize: 16,
                lineHeight: 24,
                color: '#fff',
                padding: 0,
                minHeight: 80,
              }}
            />

            {/* Sugerencias debajo del input */}
            {mentionInfo.active && filteredVariables.length > 0 && (
              <YStack
                backgroundColor="$backgroundHover"
                borderRadius={8}
                borderWidth={1}
                borderColor="$borderColor"
                overflow="hidden"
              >
                <ScrollView
                  style={{ maxHeight: 250 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <YStack padding={4}>
                    {categoryOrder.map((category) => {
                      const variables = groupedVariables[category]
                      if (!variables || variables.length === 0) return null

                      return (
                        <YStack key={category}>
                          {/* Category header */}
                          <Text
                            fontSize={10}
                            fontWeight="600"
                            color="$placeholderColor"
                            paddingHorizontal={8}
                            paddingTop={8}
                            paddingBottom={4}
                            textTransform="uppercase"
                            letterSpacing={0.5}
                          >
                            {category}
                          </Text>

                          {/* Variables */}
                          {variables.map((variable) => (
                            <Pressable
                              key={variable.id}
                              onPress={() => handleInsertVariable(variable)}
                            >
                              {({ pressed }) => (
                                <XStack
                                  paddingHorizontal={8}
                                  paddingVertical={8}
                                  backgroundColor={pressed ? '$backgroundPress' : 'transparent'}
                                  borderRadius={4}
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <YStack flex={1} gap={2}>
                                    <Text fontSize={14} color="$color" fontWeight="500">
                                      {variable.displayName}
                                    </Text>
                                    <Text fontSize={11} color="$placeholderColor" fontFamily="$mono">
                                      @{variable.id}
                                    </Text>
                                  </YStack>
                                  <Text
                                    fontSize={13}
                                    color="$placeholderColor"
                                    fontFamily="$mono"
                                    paddingLeft={12}
                                  >
                                    {variable.value}
                                  </Text>
                                </XStack>
                              )}
                            </Pressable>
                          ))}
                        </YStack>
                      )
                    })}
                  </YStack>
                </ScrollView>
              </YStack>
            )}

            {/* Helper text cuando no hay sugerencias */}
            {!mentionInfo.active && (
              <Text fontSize={12} color="$placeholderColor">
                Type @ to autocomplete variables
              </Text>
            )}
          </YStack>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}
