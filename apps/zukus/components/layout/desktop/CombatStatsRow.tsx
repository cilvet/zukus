import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

type CombatStatCardProps = {
  label: string
  value: number | string
  subValues?: { label: string; value: number | string }[]
  onPress?: () => void
}

function CombatStatCard({ label, value, subValues, onPress }: CombatStatCardProps) {
  const content = (
    <YStack
      alignItems="center"
      paddingVertical={12}
      paddingHorizontal={16}
      backgroundColor="$uiBackgroundColor"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius={8}
      minWidth={100}
    >
      <Text fontSize={10} fontWeight="700" color="$placeholderColor" letterSpacing={0.5} textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize={28} fontWeight="700" color="$color">
        {typeof value === 'number' && value >= 0 ? `+${value}` : value}
      </Text>
      {subValues && subValues.length > 0 ? (
        <XStack gap={8} marginTop={4}>
          {subValues.map((sv, i) => (
            <YStack key={i} alignItems="center">
              <Text fontSize={9} color="$placeholderColor">
                {sv.label}
              </Text>
              <Text fontSize={12} fontWeight="600" color="$placeholderColor">
                {typeof sv.value === 'number' && sv.value >= 0 ? `+${sv.value}` : sv.value}
              </Text>
            </YStack>
          ))}
        </XStack>
      ) : null}
    </YStack>
  )

  if (!onPress) {
    return content
  }

  return (
    <Pressable onPress={onPress}>
      {({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => (
        <YStack
          alignItems="center"
          paddingVertical={12}
          paddingHorizontal={16}
          backgroundColor={pressed ? '$backgroundHover' : hovered ? '$backgroundHover' : '$uiBackgroundColor'}
          borderWidth={1}
          borderColor={hovered ? '$accentColor' : '$borderColor'}
          borderRadius={8}
          minWidth={100}
          cursor="pointer"
        >
          <Text fontSize={10} fontWeight="700" color="$placeholderColor" letterSpacing={0.5} textTransform="uppercase">
            {label}
          </Text>
          <Text fontSize={28} fontWeight="700" color="$color">
            {typeof value === 'number' && value >= 0 ? `+${value}` : value}
          </Text>
          {subValues && subValues.length > 0 ? (
            <XStack gap={8} marginTop={4}>
              {subValues.map((sv, i) => (
                <YStack key={i} alignItems="center">
                  <Text fontSize={9} color="$placeholderColor">
                    {sv.label}
                  </Text>
                  <Text fontSize={12} fontWeight="600" color="$placeholderColor">
                    {typeof sv.value === 'number' && sv.value >= 0 ? `+${sv.value}` : sv.value}
                  </Text>
                </YStack>
              ))}
            </XStack>
          ) : null}
        </YStack>
      )}
    </Pressable>
  )
}

type CombatStatsRowProps = {
  armorClass?: {
    total: number
    touch: number
    flatFooted: number
  }
  initiative?: number
  bab?: {
    total: number
    attacks: number[]
  }
  savingThrows?: {
    fortitude: number
    reflex: number
    will: number
  }
  onArmorClassPress?: () => void
  onInitiativePress?: () => void
  onBABPress?: () => void
  onSavingThrowPress?: (key: string) => void
}

/**
 * Horizontal row of combat stat cards.
 * Shows AC, Initiative, BAB, and Saving Throws.
 */
export function CombatStatsRow({
  armorClass,
  initiative,
  bab,
  savingThrows,
  onArmorClassPress,
  onInitiativePress,
  onBABPress,
  onSavingThrowPress,
}: CombatStatsRowProps) {
  return (
    <XStack
      alignItems="flex-start"
      gap={12}
      flexWrap="wrap"
    >
      {/* Armor Class */}
      {armorClass ? (
        <CombatStatCard
          label="Armor Class"
          value={armorClass.total}
          subValues={[
            { label: 'Touch', value: armorClass.touch },
            { label: 'Flat', value: armorClass.flatFooted },
          ]}
          onPress={onArmorClassPress}
        />
      ) : null}

      {/* Initiative */}
      {typeof initiative === 'number' ? (
        <CombatStatCard
          label="Initiative"
          value={initiative}
          onPress={onInitiativePress}
        />
      ) : null}

      {/* BAB */}
      {bab ? (
        <CombatStatCard
          label="BAB"
          value={bab.total}
          subValues={
            bab.attacks.length > 1
              ? [{ label: 'Attacks', value: bab.attacks.map(a => a >= 0 ? `+${a}` : a).join('/') }]
              : undefined
          }
          onPress={onBABPress}
        />
      ) : null}

      {/* Saving Throws */}
      {savingThrows ? (
        <>
          <CombatStatCard
            label="Fortitude"
            value={savingThrows.fortitude}
            onPress={onSavingThrowPress ? () => onSavingThrowPress('fortitude') : undefined}
          />
          <CombatStatCard
            label="Reflex"
            value={savingThrows.reflex}
            onPress={onSavingThrowPress ? () => onSavingThrowPress('reflex') : undefined}
          />
          <CombatStatCard
            label="Will"
            value={savingThrows.will}
            onPress={onSavingThrowPress ? () => onSavingThrowPress('will') : undefined}
          />
        </>
      ) : null}
    </XStack>
  )
}
