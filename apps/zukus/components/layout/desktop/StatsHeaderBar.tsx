import { Pressable, Image } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import type { CalculatedAbilities } from '@zukus/core'

type StatsHeaderBarProps = {
  name: string
  build: string | null
  imageUrl?: string | null
  abilities: CalculatedAbilities
  currentHp: number
  maxHp: number
  speed?: number
  onAbilityPress: (key: string) => void
  onHpPress?: () => void
  onEditPress?: () => void
  onRestPress?: () => void
  onChatPress?: () => void
}

const ABILITY_ORDER = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const
const ABILITY_ABBR: Record<string, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : String(mod)
}

function AbilityStatBox({
  abilityKey,
  modifier,
  score,
  onPress,
}: {
  abilityKey: string
  modifier: number
  score: number
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => (
        <YStack
          alignItems="center"
          paddingVertical={8}
          paddingHorizontal={12}
          backgroundColor={pressed ? '$backgroundHover' : hovered ? '$backgroundHover' : '$uiBackgroundColor'}
          borderWidth={1}
          borderColor={hovered ? '$accentColor' : '$borderColor'}
          borderRadius={6}
          minWidth={70}
          cursor="pointer"
        >
          <Text fontSize={10} fontWeight="700" color="$placeholderColor" letterSpacing={0.5}>
            {ABILITY_ABBR[abilityKey]}
          </Text>
          <Text fontSize={20} fontWeight="700" color="$color">
            {formatModifier(modifier)}
          </Text>
          <Text fontSize={11} color="$placeholderColor">
            {score}
          </Text>
        </YStack>
      )}
    </Pressable>
  )
}

function KeyStatBox({
  label,
  value,
  subValue,
  onPress,
  highlight,
}: {
  label: string
  value: string | number
  subValue?: string
  onPress?: () => void
  highlight?: boolean
}) {
  const content = (
    <YStack
      alignItems="center"
      paddingVertical={8}
      paddingHorizontal={16}
      backgroundColor={highlight ? '$accentColor' : '$uiBackgroundColor'}
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius={6}
      minWidth={80}
    >
      <Text fontSize={10} fontWeight="700" color={highlight ? '#FFFFFF' : '$placeholderColor'} letterSpacing={0.5}>
        {label}
      </Text>
      <Text fontSize={18} fontWeight="700" color={highlight ? '#FFFFFF' : '$color'}>
        {value}
      </Text>
      {subValue ? (
        <Text fontSize={10} color={highlight ? 'rgba(255,255,255,0.7)' : '$placeholderColor'}>
          {subValue}
        </Text>
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
          paddingVertical={8}
          paddingHorizontal={16}
          backgroundColor={highlight ? '$accentColor' : pressed ? '$backgroundHover' : hovered ? '$backgroundHover' : '$uiBackgroundColor'}
          borderWidth={1}
          borderColor={hovered ? '$accentColor' : '$borderColor'}
          borderRadius={6}
          minWidth={80}
          cursor="pointer"
        >
          <Text fontSize={10} fontWeight="700" color={highlight ? '#FFFFFF' : '$placeholderColor'} letterSpacing={0.5}>
            {label}
          </Text>
          <Text fontSize={18} fontWeight="700" color={highlight ? '#FFFFFF' : '$color'}>
            {value}
          </Text>
          {subValue ? (
            <Text fontSize={10} color={highlight ? 'rgba(255,255,255,0.7)' : '$placeholderColor'}>
              {subValue}
            </Text>
          ) : null}
        </YStack>
      )}
    </Pressable>
  )
}

function ActionButton({
  icon,
  iconColor,
  onPress,
}: {
  icon: string
  iconColor?: string
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      {({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => (
        <YStack
          width={32}
          height={32}
          backgroundColor={pressed ? '$backgroundHover' : hovered ? '$backgroundHover' : '$uiBackgroundColor'}
          borderWidth={1}
          borderColor={hovered ? '$accentColor' : '$borderColor'}
          borderRadius={6}
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
        >
          <FontAwesome6 name={icon as any} size={14} color={iconColor ?? '#888'} />
        </YStack>
      )}
    </Pressable>
  )
}

/**
 * Horizontal stats bar at the top of the desktop character sheet.
 * Shows character identity, ability scores, and key stats (HP, Speed).
 */
export function StatsHeaderBar({
  name,
  build,
  imageUrl,
  abilities,
  currentHp,
  maxHp,
  speed = 30,
  onAbilityPress,
  onHpPress,
  onEditPress,
  onRestPress,
  onChatPress,
}: StatsHeaderBarProps) {
  const hpPercentage = maxHp > 0 ? (currentHp / maxHp) * 100 : 0

  return (
    <XStack
      alignItems="center"
      backgroundColor="$background"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius={8}
      padding={12}
      gap={16}
    >
      {/* Character identity */}
      <XStack alignItems="center" gap={12}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#333',
            }}
          />
        ) : (
          <YStack
            width={56}
            height={56}
            borderRadius={28}
            backgroundColor="$uiBackgroundColor"
            borderWidth={2}
            borderColor="$color"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={22} fontWeight="700" color="$color">
              {name.charAt(0).toUpperCase()}
            </Text>
          </YStack>
        )}
        <YStack>
          <XStack alignItems="center" gap={8}>
            <Text fontSize={18} fontWeight="700" color="$color">
              {name}
            </Text>
            {onEditPress ? (
              <Pressable onPress={onEditPress} hitSlop={8}>
                {({ pressed }) => (
                  <Text fontSize={12} color="$accentColor" opacity={pressed ? 0.7 : 1}>
                    Edit
                  </Text>
                )}
              </Pressable>
            ) : null}
          </XStack>
          <Text fontSize={12} color="$placeholderColor">
            {build ?? 'Sin clase'}
          </Text>
        </YStack>
      </XStack>

      {/* Separator */}
      <YStack width={1} height={40} backgroundColor="$borderColor" />

      {/* Ability scores */}
      <XStack gap={6}>
        {ABILITY_ORDER.map((key) => {
          const ability = abilities[key]
          return (
            <AbilityStatBox
              key={key}
              abilityKey={key}
              modifier={ability.totalModifier}
              score={ability.totalScore}
              onPress={() => onAbilityPress(key)}
            />
          )
        })}
      </XStack>

      {/* Separator */}
      <YStack width={1} height={40} backgroundColor="$borderColor" />

      {/* Key stats */}
      <XStack gap={8}>
        <KeyStatBox
          label="SPEED"
          value={`${speed} ft.`}
        />
      </XStack>

      {/* Spacer */}
      <YStack flex={1} />

      {/* HP */}
      <Pressable onPress={onHpPress}>
        {({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => (
          <XStack
            alignItems="center"
            gap={12}
            paddingVertical={8}
            paddingHorizontal={16}
            backgroundColor={pressed ? '$backgroundHover' : hovered ? '$backgroundHover' : '$uiBackgroundColor'}
            borderWidth={1}
            borderColor={hovered ? '$accentColor' : '$borderColor'}
            borderRadius={6}
            cursor="pointer"
          >
            <YStack alignItems="flex-end">
              <Text fontSize={10} fontWeight="700" color="$placeholderColor" letterSpacing={0.5}>
                HIT POINTS
              </Text>
              <XStack alignItems="baseline" gap={4}>
                <Text fontSize={24} fontWeight="700" color="$color">
                  {currentHp}
                </Text>
                <Text fontSize={14} color="$placeholderColor">
                  / {maxHp}
                </Text>
              </XStack>
            </YStack>
            {/* HP bar */}
            <YStack width={100} height={8} backgroundColor="$borderColor" borderRadius={4} overflow="hidden">
              <YStack
                height="100%"
                width={`${hpPercentage}%`}
                backgroundColor={hpPercentage > 50 ? '$green9' : hpPercentage > 25 ? '$orange9' : '$red9'}
                borderRadius={4}
              />
            </YStack>
          </XStack>
        )}
      </Pressable>

      {/* Action buttons */}
      <XStack gap={6}>
        {onRestPress ? <ActionButton icon="campground" iconColor="#f97316" onPress={onRestPress} /> : null}
        {onChatPress ? <ActionButton icon="robot" iconColor="#8b5cf6" onPress={onChatPress} /> : null}
      </XStack>
    </XStack>
  )
}
