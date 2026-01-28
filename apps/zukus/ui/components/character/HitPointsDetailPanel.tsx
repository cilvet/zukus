import { Button, Input, Text, XStack, YStack } from 'tamagui'

export type HitPointsDetailPanelProps = {
  currentHp: number
  maxHp: number
  constitutionScore: number
  constitutionModifier: number
  currentHpInput: string
  onCurrentHpChange: (value: string) => void
  onCurrentHpBlur: () => void
  onCurrentHpFocus: () => void
  hpChange: string
  onHpChange: (value: string) => void
  onHeal: () => void
  onDamage: () => void
  onRest: () => void
}

function clampPercentage(value: number) {
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

export function HitPointsDetailPanel({
  currentHp,
  maxHp,
  constitutionScore,
  constitutionModifier,
  currentHpInput,
  onCurrentHpChange,
  onCurrentHpBlur,
  onCurrentHpFocus,
  hpChange,
  onHpChange,
  onHeal,
  onDamage,
  onRest,
}: HitPointsDetailPanelProps) {
  const safeMaxHp = Math.max(maxHp, 1)
  const hpPercentage = clampPercentage((currentHp / safeMaxHp) * 100)
  const formattedConMod = constitutionModifier >= 0 ? `+${constitutionModifier}` : String(constitutionModifier)

  return (
    <YStack gap={16}>
      <Text fontSize={22} fontWeight="700" color="$color" textAlign="center">
        Hit Points
      </Text>

      <YStack>
        <YStack gap={12}>
          <XStack justifyContent="space-between" alignItems="center">
            <XStack alignItems="baseline" gap={6}>
              <Input
                value={currentHpInput}
                onChangeText={onCurrentHpChange}
                onBlur={onCurrentHpBlur}
                onFocus={onCurrentHpFocus}
                selectTextOnFocus
                keyboardType="numeric"
                width={64}
                fontSize={22}
                fontWeight="400"
                textAlign="center"
                paddingHorizontal={6}
              />
              <Text fontSize={22} fontWeight="400" color="$placeholderColor">
                / {maxHp}
              </Text>
            </XStack>
            <Text fontSize={12} color="$placeholderColor">
              CON: {constitutionScore} ({formattedConMod})
            </Text>
          </XStack>

          <YStack
            height={10}
            backgroundColor="$uiBackgroundColor"
            borderRadius={5}
            overflow="hidden"
          >
            <YStack
              height="100%"
              width={`${hpPercentage}%`}
              backgroundColor="$color"
              borderRadius={5}
            />
          </YStack>

          <Input
            placeholder="Cambio de vida"
            keyboardType="numeric"
            value={hpChange}
            onChangeText={onHpChange}
          />

          <XStack gap={8}>
            <Button onPress={onHeal} backgroundColor="#22c55e" color="$white" flex={1}>
              Heal
            </Button>
            <Button onPress={onDamage} backgroundColor="#ef4444" color="$white" flex={1}>
              Damage
            </Button>
          </XStack>

          <Button onPress={onRest}>
            Full Rest
          </Button>
        </YStack>
      </YStack>

      <YStack>
        <YStack gap={8}>
          <Text fontSize={14} fontWeight="700" color="$color">
            TEMPORARY EFFECTS
          </Text>
          <Text fontSize={13} color="$placeholderColor">
            No temporary effects
          </Text>
        </YStack>
      </YStack>
    </YStack>
  )
}
