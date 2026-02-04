import { Pressable, Image } from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'
import { Text, XStack, YStack, Card } from 'tamagui'
import { ABILITY_INFO, type Ability, type Skill } from './data'

export function SectionHeader({
  icon,
  title,
  action,
}: {
  icon: string
  title: string
  action?: React.ReactNode
}) {
  return (
    <XStack alignItems="center" justifyContent="space-between" marginBottom={12}>
      <XStack alignItems="center" gap={8}>
        <Text fontSize={14}>{icon}</Text>
        <Text
          fontSize={12}
          fontWeight="700"
          color="$color"
          letterSpacing={1.5}
          textTransform="uppercase"
        >
          {title}
        </Text>
      </XStack>
      {action}
    </XStack>
  )
}

export function SectionCard({ children, flex }: { children: React.ReactNode; flex?: number }) {
  return (
    <YStack
      padding={12}
      backgroundColor="$background"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius={4}
      gap={12}
      width="100%"
      flex={flex}
    >
      {children}
    </YStack>
  )
}

export function StatBox({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      paddingVertical={8}
      paddingHorizontal={12}
      backgroundColor="$uiBackgroundColor"
      borderRadius={4}
      borderWidth={1}
      borderColor="$borderColor"
    >
      <XStack alignItems="center" gap={8}>
        <Text fontSize={14}>{icon}</Text>
        <Text fontSize={13} color="$placeholderColor">
          {label}
        </Text>
      </XStack>
      <Text fontSize={16} fontWeight="700" color="$color">
        {value}
      </Text>
    </XStack>
  )
}

export function AbilityCard({
  abilityKey,
  ability,
  onPress,
}: {
  abilityKey: string
  ability: Ability
  onPress: () => void
}) {
  const info = ABILITY_INFO[abilityKey]
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <YStack
          alignItems="center"
          padding={12}
          backgroundColor={pressed ? '$backgroundHover' : '$uiBackgroundColor'}
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius={4}
          minWidth={70}
        >
          <Text fontSize={11} fontWeight="700" color="$placeholderColor">
            {info.abbr}
          </Text>
          <Text fontSize={24} fontWeight="700" color="$color">
            {ability.modifier >= 0 ? `+${ability.modifier}` : ability.modifier}
          </Text>
          <Text fontSize={12} color="$placeholderColor">
            {ability.score}
          </Text>
        </YStack>
      )}
    </Pressable>
  )
}

export function SkillItem({ skill }: { skill: Skill }) {
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      paddingVertical={8}
      paddingHorizontal={12}
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      <XStack alignItems="center" gap={8}>
        <YStack
          width={8}
          height={8}
          borderRadius={4}
          backgroundColor={skill.proficient ? '$color' : 'transparent'}
          borderWidth={1}
          borderColor="$borderColor"
        />
        <Text fontSize={13} color="$color">
          {skill.name}
        </Text>
      </XStack>
      <Text fontSize={14} fontWeight="700" color="$color">
        {skill.modifier >= 0 ? `+${skill.modifier}` : skill.modifier}
      </Text>
    </XStack>
  )
}

export function ItemCard({
  name,
  subtitle,
  onPress,
}: {
  name: string
  subtitle: string
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <YStack
          padding={10}
          backgroundColor={pressed ? '$backgroundHover' : '$uiBackgroundColor'}
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius={4}
        >
          <Text fontSize={13} fontWeight="700" color="$color">
            {name}
          </Text>
          <Text fontSize={11} color="$placeholderColor" marginTop={4}>
            {subtitle}
          </Text>
        </YStack>
      )}
    </Pressable>
  )
}

export function CharacterHeader({
  name,
  level,
  race,
  characterClass,
  imageUrl,
  onFormulaPlaygroundPress,
  onChatPress,
  onRestPress,
  onEditPress,
}: {
  name: string
  level: number
  race: string
  characterClass: string
  imageUrl?: string | null
  onFormulaPlaygroundPress?: () => void
  onChatPress?: () => void
  onRestPress?: () => void
  onEditPress?: () => void
}) {
  return (
    <YStack
      alignItems="center"
      padding={16}
      gap={12}
      backgroundColor="$background"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius={4}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#333',
          }}
        />
      ) : (
        <YStack
          width={80}
          height={80}
          borderRadius={40}
          backgroundColor="$uiBackgroundColor"
          borderWidth={3}
          borderColor="$color"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={28} fontWeight="700" color="$color">
            {name.charAt(0).toUpperCase()}
          </Text>
        </YStack>
      )}
      <YStack alignItems="center" gap={4}>
        <XStack alignItems="center" gap={8}>
          <Text fontSize={20} fontWeight="800" color="$color">
            {name}
          </Text>
          {(onFormulaPlaygroundPress || onChatPress || onRestPress) && (
            <XStack alignItems="center" gap={6}>
              {onRestPress && (
                <Pressable onPress={onRestPress} hitSlop={8}>
                  {({ pressed }) => (
                    <YStack
                      width={28}
                      height={28}
                      backgroundColor={pressed ? '$backgroundHover' : '$uiBackgroundColor'}
                      borderWidth={1}
                      borderColor="$borderColor"
                      borderRadius={6}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <FontAwesome6 name="fire" size={12} color="#f97316" />
                    </YStack>
                  )}
                </Pressable>
              )}
              {onFormulaPlaygroundPress && (
                <Pressable onPress={onFormulaPlaygroundPress} hitSlop={8}>
                  {({ pressed }) => (
                    <YStack
                      width={28}
                      height={28}
                      backgroundColor={pressed ? '$backgroundHover' : '$uiBackgroundColor'}
                      borderWidth={1}
                      borderColor="$borderColor"
                      borderRadius={6}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize={12} fontWeight="700" color="$color">
                        f
                      </Text>
                    </YStack>
                  )}
                </Pressable>
              )}
              {onChatPress && (
                <Pressable onPress={onChatPress} hitSlop={8}>
                  {({ pressed }) => (
                    <YStack
                      width={28}
                      height={28}
                      backgroundColor={pressed ? '$backgroundHover' : '$uiBackgroundColor'}
                      borderWidth={1}
                      borderColor="$borderColor"
                      borderRadius={6}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize={10} fontWeight="700" color="$color">
                        AI
                      </Text>
                    </YStack>
                  )}
                </Pressable>
              )}
            </XStack>
          )}
        </XStack>
        {onEditPress ? (
          <Pressable onPress={onEditPress} hitSlop={8}>
            {({ pressed }) => (
              <XStack
                alignItems="center"
                gap={4}
                paddingHorizontal={8}
                paddingVertical={4}
                borderRadius={4}
                backgroundColor={pressed ? '$backgroundHover' : 'transparent'}
              >
                <Text fontSize={12} color="$placeholderColor">
                  Level {level} {race} {characterClass}
                </Text>
                <Text fontSize={10} color="$placeholderColor">
                  {'>'}
                </Text>
              </XStack>
            )}
          </Pressable>
        ) : (
          <Text fontSize={12} color="$placeholderColor">
            Level {level} {race} {characterClass}
          </Text>
        )}
      </YStack>
    </YStack>
  )
}

export function HpBar({ current, max, onPress }: { current: number; max: number; onPress?: () => void }) {
  const safeMax = Math.max(max, 1)
  const hpPercentage = (current / safeMax) * 100

  const content = (
    <YStack gap={12}>
      <SectionHeader icon="HP" title="Hit Points" />
      <YStack gap={8}>
        <XStack alignItems="baseline" gap={4}>
          <Text fontSize={32} fontWeight="700" color="$color">
            {current}
          </Text>
          <Text fontSize={16} color="$placeholderColor">
            / {max}
          </Text>
        </XStack>
        <YStack
          height={8}
          backgroundColor="$uiBackgroundColor"
          borderRadius={4}
          overflow="hidden"
        >
          <YStack
            height="100%"
            width={`${hpPercentage}%`}
            backgroundColor="$color"
            borderRadius={4}
          />
        </YStack>
      </YStack>
    </YStack>
  )

  if (!onPress) {
    return content
  }

  return (
    <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      {content}
    </Pressable>
  )
}

/**
 * Header compacto para mobile con swipe.
 * Layout: [Nivel+Clase] [Avatar] [HP]
 */
export function CompactCharacterHeader({
  level,
  characterClass,
  hpCurrent,
  hpMax,
}: {
  level: number
  characterClass: string
  hpCurrent: number
  hpMax: number
}) {
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      paddingVertical={12}
      paddingHorizontal={16}
      backgroundColor="$background"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      {/* Izquierda: Nivel + Clase */}
      <YStack alignItems="flex-start" flex={1}>
        <Text fontSize={11} color="$placeholderColor" textTransform="uppercase">
          Nivel {level}
        </Text>
        <Text fontSize={14} fontWeight="700" color="$color">
          {characterClass}
        </Text>
      </YStack>

      {/* Centro: Avatar */}
      <YStack
        width={48}
        height={48}
        borderRadius={24}
        backgroundColor="$uiBackgroundColor"
        borderWidth={2}
        borderColor="$color"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize={20}>CHAR</Text>
      </YStack>

      {/* Derecha: HP */}
      <YStack alignItems="flex-end" flex={1}>
        <Text fontSize={11} color="$placeholderColor" textTransform="uppercase">
          HP
        </Text>
        <XStack alignItems="baseline" gap={2}>
          <Text fontSize={16} fontWeight="700" color="$color">
            {hpCurrent}
          </Text>
          <Text fontSize={12} color="$placeholderColor">
            /{hpMax}
          </Text>
        </XStack>
      </YStack>
    </XStack>
  )
}

import { BonusTypesValues, type SourceValue, type BonusTypes } from '@zukus/core'

function getBonusTypeName(bonusTypeId: BonusTypes): string {
  return BonusTypesValues[bonusTypeId]?.name ?? bonusTypeId
}

function formatValue(value: number): string {
  if (value >= 0) return `+${value}`
  return String(value)
}

function SourceValuesTable({ sourceValues }: { sourceValues: SourceValue[] }) {
  if (sourceValues.length === 0) {
    return (
      <Text fontSize={13} color="$placeholderColor" fontStyle="italic">
        Sin modificadores
      </Text>
    )
  }

  return (
    <YStack>
      {/* Header */}
      <XStack
        paddingVertical={8}
        paddingHorizontal={12}
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Text flex={2} fontSize={11} fontWeight="700" color="$placeholderColor" textTransform="uppercase">
          Origen
        </Text>
        <Text width={50} fontSize={11} fontWeight="700" color="$placeholderColor" textTransform="uppercase" textAlign="center">
          Valor
        </Text>
        <Text flex={1} fontSize={11} fontWeight="700" color="$placeholderColor" textTransform="uppercase" textAlign="right">
          Tipo
        </Text>
      </XStack>

      {/* Rows */}
      {sourceValues.map((sv, index) => (
        <XStack
          key={`${sv.sourceUniqueId}-${index}`}
          paddingVertical={8}
          paddingHorizontal={12}
          borderBottomWidth={index < sourceValues.length - 1 ? 1 : 0}
          borderBottomColor="$borderColor"
          opacity={sv.relevant === false ? 0.4 : 1}
        >
          <Text flex={2} fontSize={13} color="$color" numberOfLines={1}>
            {sv.sourceName}
          </Text>
          <Text width={50} fontSize={13} fontWeight="600" color="$color" textAlign="center">
            {formatValue(sv.value)}
          </Text>
          <Text flex={1} fontSize={12} color="$placeholderColor" textAlign="right" numberOfLines={1}>
            {getBonusTypeName(sv.bonusTypeId)}
          </Text>
        </XStack>
      ))}
    </YStack>
  )
}

export function AbilityDetailPanel({
  abilityKey,
  ability,
  sourceValues = [],
}: {
  abilityKey: string
  ability: Ability
  sourceValues?: SourceValue[]
}) {
  const info = ABILITY_INFO[abilityKey]

  return (
    <YStack gap={16}>
      <YStack>
        <YStack alignItems="center" gap={8}>
          <Text fontSize={24} fontWeight="700" color="$color">
            {info?.abbr}
          </Text>
          <Text fontSize={48} fontWeight="700" color="$color">
            {ability.modifier >= 0 ? '+' : ''}{ability.modifier}
          </Text>
          <Text fontSize={20} color="$placeholderColor">
            Score: {ability.score}
          </Text>
        </YStack>
      </YStack>

      <YStack>
        <Text fontSize={14} fontWeight="700" marginBottom={12} color="$color">
          MODIFICADORES
        </Text>
        <SourceValuesTable sourceValues={sourceValues} />
      </YStack>

      <YStack>
        <Text fontSize={14} fontWeight="700" marginBottom={12} color="$color">
          DESCRIPCION
        </Text>
        <Text fontSize={14} color="$placeholderColor" lineHeight={22}>
          {info?.description}
        </Text>
      </YStack>
    </YStack>
  )
}

export function GenericDetailPanel({ title }: { title: string }) {
  return (
    <YStack gap={16}>
      <YStack>
        <Text fontSize={18} fontWeight="700" color="$color">
          {title}
        </Text>
        <Text fontSize={14} color="$placeholderColor" marginTop={8}>
          Detalle del item seleccionado. En una implementacion real, aqui iria la informacion
          completa del objeto, conjuro, etc.
        </Text>
      </YStack>
    </YStack>
  )
}
