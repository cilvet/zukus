import { Pressable } from 'react-native'
import { Text, XStack, YStack, Card } from 'tamagui'
import { ABILITY_INFO, type Ability, type Skill } from './data'

export function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <XStack alignItems="center" gap={8} marginBottom={12}>
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
  )
}

export function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <YStack
      padding={12}
      backgroundColor="$background"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius={4}
      gap={12}
      width="100%"
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
}: {
  name: string
  level: number
  race: string
  characterClass: string
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
        <Text fontSize={32}>🧙</Text>
      </YStack>
      <YStack alignItems="center" gap={4}>
        <Text fontSize={20} fontWeight="800" color="$color">
          {name}
        </Text>
        <Text fontSize={12} color="$placeholderColor">
          Level {level} {race} {characterClass}
        </Text>
      </YStack>
    </YStack>
  )
}

export function HpBar({ current, max }: { current: number; max: number }) {
  return (
    <SectionCard>
      <SectionHeader icon="❤️" title="Hit Points" />
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
            width={`${(current / max) * 100}%`}
            backgroundColor="#4ade80"
            borderRadius={4}
          />
        </YStack>
      </YStack>
    </SectionCard>
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
        <Text fontSize={20}>🧙</Text>
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

export function AbilityDetailPanel({
  abilityKey,
  ability,
}: {
  abilityKey: string
  ability: Ability
}) {
  const info = ABILITY_INFO[abilityKey]

  return (
    <YStack gap={16} padding={4}>
      <Card
        padding={16}
        backgroundColor="$background"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius={4}
      >
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
      </Card>

      <Card
        padding={16}
        backgroundColor="$background"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius={4}
      >
        <Text fontSize={14} fontWeight="700" marginBottom={12} color="$color">
          DESCRIPCION
        </Text>
        <Text fontSize={14} color="$placeholderColor" lineHeight={22}>
          {info?.description}
        </Text>
      </Card>
    </YStack>
  )
}

export function GenericDetailPanel({ title }: { title: string }) {
  return (
    <YStack gap={16} padding={4}>
      <Card
        padding={16}
        backgroundColor="$background"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius={4}
      >
        <Text fontSize={18} fontWeight="700" color="$color">
          {title}
        </Text>
        <Text fontSize={14} color="$placeholderColor" marginTop={8}>
          Detalle del item seleccionado. En una implementacion real, aqui iria la informacion
          completa del objeto, conjuro, etc.
        </Text>
      </Card>
    </YStack>
  )
}
