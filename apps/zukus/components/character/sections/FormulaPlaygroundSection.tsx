import { useState } from 'react'
import { View, Pressable } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, XStack, Text } from 'tamagui'
import { useCharacterSheet } from '../../../ui'
import { SectionHeader } from '../CharacterComponents'
import { FormulaEditorModal } from './FormulaEditorModal'
import {
  substituteExpression,
  getRollExpression,
  getResolvedRollExpression,
} from '@zukus/core'

/**
 * Evalua una expresion de formula y retorna el resultado o un error.
 */
function evaluateFormula(
  formula: string,
  substitutionValues: Record<string, number>
): { result: number; substituted: string } | { error: string } {
  if (!formula.trim()) {
    return { error: 'Formula vacia' }
  }

  try {
    // Paso 1: Sustituir variables (@ability.strength.modifier -> 3)
    const substituted = substituteExpression(formula, substitutionValues)

    // Paso 2: Parsear la expresion
    const rollExpression = getRollExpression(substituted)

    // Paso 3: Evaluar (usa random para dados, pero para pruebas esta bien)
    const randomInteger = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min
    const resolved = getResolvedRollExpression(rollExpression, randomInteger)

    return { result: resolved.result, substituted }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Error desconocido'
    return { error: errorMessage }
  }
}

/**
 * Seccion de playground para probar formulas.
 * Permite escribir una formula y ver su resultado evaluado.
 */
export function FormulaPlaygroundSection() {
  const characterSheet = useCharacterSheet()
  const [formula, setFormula] = useState('')
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  const substitutionValues = characterSheet?.substitutionValues ?? {}

  const evaluation = evaluateFormula(formula, substitutionValues)
  const hasError = 'error' in evaluation

  return (
    <View style={{ flex: 1 }} collapsable={false}>
      <FormulaEditorModal
        visible={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialValue={formula}
        onApply={setFormula}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <YStack gap={12}>
          <SectionHeader icon="f" title="Formula Playground" />

          <YStack gap={12}>
            {/* Input que abre el modal de edición */}
            <YStack gap={4}>
              <Text fontSize={12} color="$placeholderColor">
                Formula:
              </Text>
              <Pressable onPress={() => setIsEditorOpen(true)}>
                {({ pressed }) => (
                  <YStack
                    padding={12}
                    borderRadius={8}
                    borderWidth={1}
                    borderColor={hasError ? '$red10' : '$borderColor'}
                    backgroundColor={pressed ? '$backgroundHover' : '$background'}
                    minHeight={60}
                  >
                    <Text
                      fontSize={14}
                      fontFamily="$mono"
                      color={formula ? '$color' : '$placeholderColor'}
                    >
                      {formula || 'Tap to edit formula...'}
                    </Text>
                  </YStack>
                )}
              </Pressable>
            </YStack>

            {/* Resultado */}
            <YStack
              gap={4}
              padding={12}
              borderRadius={8}
              backgroundColor={hasError ? '$red2' : '$green2'}
            >
              {hasError ? (
                <>
                  <Text fontSize={12} color="$red10" fontWeight="600">
                    Error:
                  </Text>
                  <Text fontSize={14} color="$red11">
                    {evaluation.error}
                  </Text>
                </>
              ) : (
                <>
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize={12} color="$green10" fontWeight="600">
                      Resultado:
                    </Text>
                    <Text fontSize={24} color="$green11" fontWeight="700">
                      {evaluation.result}
                    </Text>
                  </XStack>
                  <Text fontSize={11} color="$green10" opacity={0.8}>
                    Sustituido: {evaluation.substituted}
                  </Text>
                </>
              )}
            </YStack>

            {/* Ejemplos */}
            <YStack gap={8} marginTop={8}>
              <Text fontSize={12} color="$placeholderColor" fontWeight="600">
                Ejemplos de formulas:
              </Text>
              <YStack gap={4}>
                <ExampleFormula
                  formula="@ability.strength.modifier"
                  onPress={setFormula}
                />
                <ExampleFormula
                  formula="@bab.total + @ability.dexterity.modifier"
                  onPress={setFormula}
                />
                <ExampleFormula
                  formula="1d20 + @ability.strength.modifier"
                  onPress={setFormula}
                />
                <ExampleFormula formula="floor(@level / 2)" onPress={setFormula} />
                <ExampleFormula
                  formula="@savingThrow.fortitude.total"
                  onPress={setFormula}
                />
              </YStack>
            </YStack>
          </YStack>
        </YStack>

        {/* Referencia de variables */}
        <YStack gap={12}>
          <SectionHeader icon="?" title="Variables Disponibles" />
          <YStack gap={8}>
            <VariableGroup
              title="Abilities"
              variables={[
                '@ability.strength.score',
                '@ability.strength.modifier',
                '@ability.dexterity.modifier',
                '@ability.constitution.modifier',
                '@ability.intelligence.modifier',
                '@ability.wisdom.modifier',
                '@ability.charisma.modifier',
              ]}
              substitutionValues={substitutionValues}
            />
            <VariableGroup
              title="Combat"
              variables={[
                '@bab.total',
                '@initiative.total',
                '@ac.total',
                '@ac.touch.total',
                '@ac.flatFooted.total',
              ]}
              substitutionValues={substitutionValues}
            />
            <VariableGroup
              title="Saving Throws"
              variables={[
                '@savingThrow.fortitude.total',
                '@savingThrow.reflex.total',
                '@savingThrow.will.total',
              ]}
              substitutionValues={substitutionValues}
            />
            <VariableGroup
              title="Other"
              variables={['@level', '@size.modifier']}
              substitutionValues={substitutionValues}
            />
          </YStack>
        </YStack>
      </ScrollView>
    </View>
  )
}

function ExampleFormula({
  formula,
  onPress,
}: {
  formula: string
  onPress: (formula: string) => void
}) {
  return (
    <Text
      fontSize={12}
      color="$blue10"
      onPress={() => onPress(formula)}
      pressStyle={{ opacity: 0.7 }}
    >
      {formula}
    </Text>
  )
}

function VariableGroup({
  title,
  variables,
  substitutionValues,
}: {
  title: string
  variables: string[]
  substitutionValues: Record<string, number>
}) {
  return (
    <YStack gap={4}>
      <Text fontSize={11} color="$placeholderColor" fontWeight="600">
        {title}
      </Text>
      {variables.map((variable) => {
        const key = variable.replace('@', '')
        const value = substitutionValues[key]
        return (
          <XStack key={variable} justifyContent="space-between">
            <Text fontSize={11} color="$color">
              {variable}
            </Text>
            <Text fontSize={11} color="$placeholderColor">
              = {value ?? 'undefined'}
            </Text>
          </XStack>
        )
      })}
    </YStack>
  )
}
