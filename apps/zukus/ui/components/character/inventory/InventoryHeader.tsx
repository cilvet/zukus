import { Pressable } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import type { CurrencyState } from '@zukus/core'

type InventoryHeaderProps = {
  currentWeight: number
  maxWeight: number
  currencies?: CurrencyState
  onCurrenciesPress?: () => void
}

type WeightStatus = 'light' | 'medium' | 'heavy' | 'overloaded'

function getWeightStatus(current: number, max: number): WeightStatus {
  const ratio = current / max
  if (ratio <= 0.33) return 'light'
  if (ratio <= 0.66) return 'medium'
  if (ratio <= 1) return 'heavy'
  return 'overloaded'
}

function getWeightColor(status: WeightStatus): string {
  switch (status) {
    case 'light':
      return '$green10'
    case 'medium':
      return '$yellow10'
    case 'heavy':
      return '$orange10'
    case 'overloaded':
      return '$red10'
  }
}

function WeightIndicator({ current, max }: { current: number; max: number }) {
  const status = getWeightStatus(current, max)
  const color = getWeightColor(status)
  const ratio = Math.min(current / max, 1) * 100

  return (
    <YStack gap={4}>
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize={11} color="$placeholderColor" textTransform="uppercase">
          Peso
        </Text>
        <Text fontSize={12} fontWeight="600" color={color}>
          {current.toFixed(1)} / {max} lb
        </Text>
      </XStack>
      <XStack
        height={4}
        borderRadius={2}
        backgroundColor="$backgroundHover"
        overflow="hidden"
      >
        <YStack
          width={`${ratio}%`}
          height="100%"
          backgroundColor={color}
          borderRadius={2}
        />
      </XStack>
    </YStack>
  )
}

type CurrencyDisplayProps = {
  currencies: CurrencyState
  onPress?: () => void
}

const CURRENCY_ORDER = ['pp', 'gp', 'sp', 'cp']
const CURRENCY_LABELS: Record<string, string> = {
  pp: 'pp',
  gp: 'gp',
  sp: 'sp',
  cp: 'cp',
}

function CurrencyDisplay({ currencies, onPress }: CurrencyDisplayProps) {
  const displayCurrencies = CURRENCY_ORDER.filter(
    (id) => currencies[id] !== undefined
  )

  if (displayCurrencies.length === 0) {
    return null
  }

  const content = (
    <XStack gap={12} paddingVertical={8}>
      {displayCurrencies.map((id) => (
        <YStack key={id} alignItems="center" gap={2}>
          <Text fontSize={14} fontWeight="600" color="$color">
            {currencies[id]}
          </Text>
          <Text fontSize={10} color="$placeholderColor">
            {CURRENCY_LABELS[id] ?? id}
          </Text>
        </YStack>
      ))}
    </XStack>
  )

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <XStack
            padding={8}
            borderRadius={6}
            backgroundColor="$uiBackgroundColor"
            borderWidth={1}
            borderColor="$borderColor"
            opacity={pressed ? 0.7 : 1}
          >
            {content}
          </XStack>
        )}
      </Pressable>
    )
  }

  return (
    <XStack
      padding={8}
      borderRadius={6}
      backgroundColor="$uiBackgroundColor"
      borderWidth={1}
      borderColor="$borderColor"
    >
      {content}
    </XStack>
  )
}

export function InventoryHeader({
  currentWeight,
  maxWeight,
  currencies,
  onCurrenciesPress,
}: InventoryHeaderProps) {
  return (
    <YStack gap={12}>
      <WeightIndicator current={currentWeight} max={maxWeight} />
      {currencies && Object.keys(currencies).length > 0 ? (
        <CurrencyDisplay currencies={currencies} onPress={onCurrenciesPress} />
      ) : null}
    </YStack>
  )
}
