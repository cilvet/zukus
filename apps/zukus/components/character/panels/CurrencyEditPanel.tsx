/**
 * CurrencyEditPanel
 *
 * Panel para editar las currencies del personaje.
 * Muestra cada currency con controles para ajustar cantidades.
 */

import { useState } from 'react'
import { Pressable } from 'react-native'
import { XStack, YStack, Text, Input, ScrollView } from 'tamagui'
import { useCharacterStore, useInventoryState } from '../../../ui/stores/characterStore'
import type { CurrencyDefinition } from '@zukus/core'

// Default D&D 3.5 currency definitions
const DEFAULT_CURRENCY_DEFS: CurrencyDefinition[] = [
  {
    id: 'pp',
    entityType: 'currency',
    name: 'Platinum',
    abbreviation: 'pp',
    conversionToBase: 10,
    weightPerUnit: 0.02,
  },
  {
    id: 'gp',
    entityType: 'currency',
    name: 'Gold',
    abbreviation: 'gp',
    conversionToBase: 1,
    weightPerUnit: 0.02,
  },
  {
    id: 'sp',
    entityType: 'currency',
    name: 'Silver',
    abbreviation: 'sp',
    conversionToBase: 0.1,
    weightPerUnit: 0.02,
  },
  {
    id: 'cp',
    entityType: 'currency',
    name: 'Copper',
    abbreviation: 'cp',
    conversionToBase: 0.01,
    weightPerUnit: 0.02,
  },
]

type CurrencyRowProps = {
  currencyDef: CurrencyDefinition
  amount: number
  onAmountChange: (amount: number) => void
}

function CurrencyRow({ currencyDef, amount, onAmountChange }: CurrencyRowProps) {
  const [inputValue, setInputValue] = useState(amount.toString())

  const handleInputChange = (text: string) => {
    setInputValue(text)
    const parsed = parseInt(text, 10)
    if (!isNaN(parsed) && parsed >= 0) {
      onAmountChange(parsed)
    }
  }

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue, 10)
    if (isNaN(parsed) || parsed < 0) {
      setInputValue(amount.toString())
    }
  }

  const handleAdjust = (delta: number) => {
    const newAmount = Math.max(0, amount + delta)
    onAmountChange(newAmount)
    setInputValue(newAmount.toString())
  }

  return (
    <XStack
      paddingVertical={12}
      paddingHorizontal={16}
      alignItems="center"
      gap={12}
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      <YStack flex={1}>
        <Text fontSize={16} fontWeight="600" color="$color">
          {currencyDef.name}
        </Text>
        <Text fontSize={12} color="$placeholderColor">
          {currencyDef.abbreviation}
        </Text>
      </YStack>

      <XStack alignItems="center" gap={8}>
        <Pressable onPress={() => handleAdjust(-10)}>
          {({ pressed }) => (
            <XStack
              width={36}
              height={36}
              borderRadius={6}
              backgroundColor="$backgroundHover"
              alignItems="center"
              justifyContent="center"
              opacity={pressed ? 0.7 : 1}
            >
              <Text fontSize={14} color="$color">
                -10
              </Text>
            </XStack>
          )}
        </Pressable>

        <Pressable onPress={() => handleAdjust(-1)}>
          {({ pressed }) => (
            <XStack
              width={36}
              height={36}
              borderRadius={6}
              backgroundColor="$backgroundHover"
              alignItems="center"
              justifyContent="center"
              opacity={pressed ? 0.7 : 1}
            >
              <Text fontSize={18} color="$color">
                -
              </Text>
            </XStack>
          )}
        </Pressable>

        <Input
          width={80}
          height={40}
          textAlign="center"
          fontSize={16}
          fontWeight="600"
          backgroundColor="$uiBackgroundColor"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius={6}
          value={inputValue}
          onChangeText={handleInputChange}
          onBlur={handleInputBlur}
          keyboardType="numeric"
        />

        <Pressable onPress={() => handleAdjust(1)}>
          {({ pressed }) => (
            <XStack
              width={36}
              height={36}
              borderRadius={6}
              backgroundColor="$backgroundHover"
              alignItems="center"
              justifyContent="center"
              opacity={pressed ? 0.7 : 1}
            >
              <Text fontSize={18} color="$color">
                +
              </Text>
            </XStack>
          )}
        </Pressable>

        <Pressable onPress={() => handleAdjust(10)}>
          {({ pressed }) => (
            <XStack
              width={36}
              height={36}
              borderRadius={6}
              backgroundColor="$backgroundHover"
              alignItems="center"
              justifyContent="center"
              opacity={pressed ? 0.7 : 1}
            >
              <Text fontSize={14} color="$color">
                +10
              </Text>
            </XStack>
          )}
        </Pressable>
      </XStack>
    </XStack>
  )
}

function calculateTotalWealth(
  currencies: Record<string, number>,
  currencyDefs: CurrencyDefinition[]
): number {
  let total = 0
  for (const [id, amount] of Object.entries(currencies)) {
    const def = currencyDefs.find((c) => c.id === id)
    if (def) {
      total += amount * def.conversionToBase
    }
  }
  return total
}

function calculateTotalWeight(
  currencies: Record<string, number>,
  currencyDefs: CurrencyDefinition[]
): number {
  let total = 0
  for (const [id, amount] of Object.entries(currencies)) {
    const def = currencyDefs.find((c) => c.id === id)
    if (def) {
      total += amount * def.weightPerUnit
    }
  }
  return total
}

export function CurrencyEditPanel() {
  const inventoryState = useInventoryState()
  const { addCurrency, spendCurrency } = useCharacterStore()

  const currencies = inventoryState?.currencies ?? {}
  const currencyDefs = DEFAULT_CURRENCY_DEFS

  const totalWealth = calculateTotalWealth(currencies, currencyDefs)
  const totalWeight = calculateTotalWeight(currencies, currencyDefs)

  const handleAmountChange = (currencyId: string, newAmount: number) => {
    const currentAmount = currencies[currencyId] ?? 0
    const delta = newAmount - currentAmount

    if (delta > 0) {
      addCurrency(currencyId, delta)
    } else if (delta < 0) {
      spendCurrency(currencyId, Math.abs(delta))
    }
  }

  return (
    <ScrollView flex={1}>
      <YStack>
        {/* Summary */}
        <YStack
          paddingVertical={16}
          paddingHorizontal={16}
          backgroundColor="$uiBackgroundColor"
          gap={8}
        >
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={14} color="$placeholderColor">
              Riqueza Total
            </Text>
            <Text fontSize={18} fontWeight="700" color="$color">
              {totalWealth.toFixed(2)} gp
            </Text>
          </XStack>
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={14} color="$placeholderColor">
              Peso Monedas
            </Text>
            <Text fontSize={14} color="$color">
              {totalWeight.toFixed(2)} lb
            </Text>
          </XStack>
        </YStack>

        {/* Currency rows */}
        <YStack marginTop={16}>
          <Text
            fontSize={11}
            color="$placeholderColor"
            textTransform="uppercase"
            paddingHorizontal={16}
            marginBottom={8}
          >
            Monedas
          </Text>
          {currencyDefs.map((def) => (
            <CurrencyRow
              key={def.id}
              currencyDef={def}
              amount={currencies[def.id] ?? 0}
              onAmountChange={(amount) => handleAmountChange(def.id, amount)}
            />
          ))}
        </YStack>

        {/* Quick add section */}
        <YStack marginTop={24} paddingHorizontal={16} gap={8}>
          <Text
            fontSize={11}
            color="$placeholderColor"
            textTransform="uppercase"
            marginBottom={4}
          >
            Acciones Rapidas
          </Text>
          <XStack gap={8} flexWrap="wrap">
            <QuickAddButton label="+100 gp" onPress={() => addCurrency('gp', 100)} />
            <QuickAddButton label="+50 gp" onPress={() => addCurrency('gp', 50)} />
            <QuickAddButton label="+10 gp" onPress={() => addCurrency('gp', 10)} />
            <QuickAddButton label="+100 sp" onPress={() => addCurrency('sp', 100)} />
            <QuickAddButton label="+100 cp" onPress={() => addCurrency('cp', 100)} />
          </XStack>
        </YStack>
      </YStack>
    </ScrollView>
  )
}

function QuickAddButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <XStack
          paddingVertical={8}
          paddingHorizontal={12}
          borderRadius={6}
          backgroundColor="$backgroundHover"
          opacity={pressed ? 0.7 : 1}
        >
          <Text fontSize={14} color="$color">
            {label}
          </Text>
        </XStack>
      )}
    </Pressable>
  )
}
