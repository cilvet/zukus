import { useState, useEffect } from 'react'
import {
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack, XStack, Text, View } from 'tamagui'
import {
  filterVariables,
  parseFormulaToTokens,
  tokensToFormula,
  insertTextInTokens,
  insertVariableToken,
  getTokensVisualLength,
  type VariableDefinition,
  type FormulaToken,
} from './formulaAutocomplete'
import { FormulaToolbar } from './FormulaToolbar'
import { TokenizedFormulaInput } from './TokenizedFormulaInput'

// Datos mock para desarrollo visual - con abreviaturas
const MOCK_VARIABLES: VariableDefinition[] = [
  // Abilities
  { id: 'ability.strength.score', displayName: 'Strength Score', abbreviation: 'STR', category: 'Abilities', value: 16 },
  { id: 'ability.strength.modifier', displayName: 'Strength Modifier', abbreviation: 'STR mod', category: 'Abilities', value: 3 },
  { id: 'ability.dexterity.score', displayName: 'Dexterity Score', abbreviation: 'DEX', category: 'Abilities', value: 14 },
  { id: 'ability.dexterity.modifier', displayName: 'Dexterity Modifier', abbreviation: 'DEX mod', category: 'Abilities', value: 2 },
  { id: 'ability.constitution.score', displayName: 'Constitution Score', abbreviation: 'CON', category: 'Abilities', value: 12 },
  { id: 'ability.constitution.modifier', displayName: 'Constitution Modifier', abbreviation: 'CON mod', category: 'Abilities', value: 1 },
  { id: 'ability.intelligence.score', displayName: 'Intelligence Score', abbreviation: 'INT', category: 'Abilities', value: 10 },
  { id: 'ability.intelligence.modifier', displayName: 'Intelligence Modifier', abbreviation: 'INT mod', category: 'Abilities', value: 0 },
  { id: 'ability.wisdom.score', displayName: 'Wisdom Score', abbreviation: 'WIS', category: 'Abilities', value: 13 },
  { id: 'ability.wisdom.modifier', displayName: 'Wisdom Modifier', abbreviation: 'WIS mod', category: 'Abilities', value: 1 },
  { id: 'ability.charisma.score', displayName: 'Charisma Score', abbreviation: 'CHA', category: 'Abilities', value: 8 },
  { id: 'ability.charisma.modifier', displayName: 'Charisma Modifier', abbreviation: 'CHA mod', category: 'Abilities', value: -1 },
  // Combat
  { id: 'bab.total', displayName: 'Base Attack Bonus', abbreviation: 'BAB', category: 'Combat', value: 5 },
  { id: 'initiative.total', displayName: 'Initiative', abbreviation: 'Init', category: 'Combat', value: 6 },
  { id: 'ac.total', displayName: 'Armor Class', abbreviation: 'AC', category: 'Combat', value: 18 },
  { id: 'ac.touch.total', displayName: 'Touch AC', category: 'Combat', value: 12 },
  { id: 'ac.flatFooted.total', displayName: 'Flat-Footed AC', category: 'Combat', value: 16 },
  // Saving Throws
  { id: 'savingThrow.fortitude.total', displayName: 'Fortitude Save', abbreviation: 'Fort', category: 'Saving Throws', value: 7 },
  { id: 'savingThrow.reflex.total', displayName: 'Reflex Save', abbreviation: 'Ref', category: 'Saving Throws', value: 4 },
  { id: 'savingThrow.will.total', displayName: 'Will Save', abbreviation: 'Will', category: 'Saving Throws', value: 3 },
  // Other
  { id: 'level', displayName: 'Character Level', abbreviation: 'Lvl', category: 'Other', value: 5 },
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
  
  // Estado basado en tokens
  const [tokens, setTokens] = useState<FormulaToken[]>(() =>
    parseFormulaToTokens(initialValue, MOCK_VARIABLES)
  )
  const [cursorPosition, setCursorPosition] = useState(0)
  const [mentionSearch, setMentionSearch] = useState<{ active: boolean; startPos: number; term: string }>({
    active: false,
    startPos: 0,
    term: '',
  })

  // Sincronizar con initialValue cuando cambia
  useEffect(() => {
    setTokens(parseFormulaToTokens(initialValue, MOCK_VARIABLES))
    setCursorPosition(0)
  }, [initialValue])

  const handleApply = () => {
    const formula = tokensToFormula(tokens)
    onApply(formula)
    onClose()
  }

  // Detectar si hay una mención activa (buscando @ en el último token de texto)
  const detectMention = (currentTokens: FormulaToken[], pos: number) => {
    // Convertir tokens a texto para buscar @
    const text = tokensToFormula(currentTokens)
    const lastAtIndex = text.lastIndexOf('@')
    
    if (lastAtIndex === -1) {
      return { active: false, startPos: 0, term: '' }
    }
    
    const textAfterAt = text.slice(lastAtIndex + 1)
    const hasSpaceAfterAt = textAfterAt.includes(' ')
    
    if (hasSpaceAfterAt) {
      return { active: false, startPos: 0, term: '' }
    }
    
    // Verificar que el @ no es parte de una variable ya insertada
    // (las variables se insertan como tokens, no como texto @)
    let isPartOfVariable = false
    let visualPos = 0
    for (const token of currentTokens) {
      if (token.type === 'variable') {
        if (visualPos <= lastAtIndex && lastAtIndex < visualPos + 1) {
          isPartOfVariable = true
          break
        }
        visualPos += 1
      } else {
        visualPos += token.value.length
      }
    }
    
    if (isPartOfVariable) {
      return { active: false, startPos: 0, term: '' }
    }
    
    return {
      active: true,
      startPos: lastAtIndex,
      term: textAfterAt.toLowerCase(),
    }
  }

  const handleTokensChange = (newTokens: FormulaToken[], newPos: number) => {
    setTokens(newTokens)
    setCursorPosition(newPos)
    setMentionSearch(detectMention(newTokens, newPos))
  }

  const handleCursorChange = (newPos: number) => {
    setCursorPosition(newPos)
  }

  const filteredVariables = mentionSearch.active
    ? filterVariables(MOCK_VARIABLES, mentionSearch.term)
    : []

  const handleInsertVariable = (variable: VariableDefinition) => {
    if (mentionSearch.active) {
      // Reemplazar desde @ hasta el cursor con la variable
      const formula = tokensToFormula(tokens)
      const beforeAt = formula.slice(0, mentionSearch.startPos)
      const newFormula = beforeAt
      
      // Parsear de nuevo sin el @ y lo que sigue
      let newTokens = parseFormulaToTokens(newFormula, MOCK_VARIABLES)
      
      // Calcular la posición visual donde insertar
      const insertPos = getTokensVisualLength(newTokens)
      
      // Insertar la variable
      const result = insertVariableToken(newTokens, insertPos, variable)
      
      // Añadir un espacio después
      const withSpace = insertTextInTokens(result.tokens, result.newCursorPosition, ' ')
      
      setTokens(withSpace.tokens)
      setCursorPosition(withSpace.newCursorPosition)
      setMentionSearch({ active: false, startPos: 0, term: '' })
    }
  }

  const handleInsertSymbol = (symbol: string) => {
    const result = insertTextInTokens(tokens, cursorPosition, symbol)
    handleTokensChange(result.tokens, result.newCursorPosition)
  }

  const handleInsertParentheses = () => {
    const result = insertTextInTokens(tokens, cursorPosition, '()')
    // Poner cursor entre paréntesis
    handleTokensChange(result.tokens, result.newCursorPosition - 1)
  }

  const handleInsertFunction = (functionName: string) => {
    const result = insertTextInTokens(tokens, cursorPosition, `${functionName}()`)
    // Poner cursor entre paréntesis
    handleTokensChange(result.tokens, result.newCursorPosition - 1)
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          flex={1}
          backgroundColor="$background"
          paddingTop={insets.top}
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

          <ScrollView
            flex={1}
            contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Input de fórmula con tokens */}
            <TokenizedFormulaInput
              tokens={tokens}
              onTokensChange={handleTokensChange}
              cursorPosition={cursorPosition}
              onCursorChange={handleCursorChange}
              autoFocus={visible}
            />

            {/* Sugerencias debajo del input */}
            {mentionSearch.active && filteredVariables.length > 0 && (
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
                  nestedScrollEnabled
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
            {!mentionSearch.active && (
              <Text fontSize={12} color="$placeholderColor">
                Type @ to autocomplete variables
              </Text>
            )}
          </ScrollView>

          {/* Toolbar de símbolos y funciones - fija al fondo */}
          <FormulaToolbar
            onInsertSymbol={handleInsertSymbol}
            onInsertParentheses={handleInsertParentheses}
            onInsertFunction={handleInsertFunction}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
