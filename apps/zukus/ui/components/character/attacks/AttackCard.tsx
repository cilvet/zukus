import { useEffect } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolateColor,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '../../../contexts/ThemeContext'
import { useGlowOnChange } from '../../../../hooks'
import type { CalculatedAttack } from '@zukus/core'

export type AttackCardProps = {
  attack: CalculatedAttack
  onPress?: () => void
}

function formatAttackBonus(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}

function formatDamage(damage: CalculatedAttack['damage']): string {
  if (!damage) return '-'
  // DamageFormula puede ser ComplexDamageSection o SimpleDamageSectionWithType
  // Simplificamos mostrando el nombre o una representación básica
  const d = damage as { type?: string; name?: string; baseDamage?: { name?: string }; formula?: { expression?: string } }
  if (d.type === 'complex' && d.baseDamage) {
    return d.name ?? d.baseDamage.name ?? 'Damage'
  }
  if (d.type === 'simple' && d.formula) {
    return d.formula.expression ?? d.name ?? 'Damage'
  }
  return d.name ?? '-'
}

/**
 * Tarjeta de ataque individual.
 * Muestra nombre del arma, bono de ataque y daño.
 */
export function AttackCard({ attack, onPress }: AttackCardProps) {
  "use no memo";
  const glowTrigger = useGlowOnChange(attack.attackBonus.totalValue)
  const { themeInfo } = useTheme()
  const colors = themeInfo.colors

  const glowProgress = useSharedValue(0)
  const shinePosition = useSharedValue(-80)
  const numberScale = useSharedValue(1)

  const CARD_WIDTH = 300
  const SHINE_WIDTH = 40

  useEffect(() => {
    if (glowTrigger > 0) {
      glowProgress.value = withSequence(
        withTiming(1, {
          duration: 250,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(0, {
          duration: 1200,
          easing: Easing.out(Easing.cubic),
        })
      )

      shinePosition.value = -SHINE_WIDTH * 2
      shinePosition.value = withDelay(
        50,
        withTiming(CARD_WIDTH + SHINE_WIDTH, {
          duration: 400,
          easing: Easing.in(Easing.quad),
        })
      )

      numberScale.value = withSequence(
        withTiming(1.15, { duration: 150, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
      )
    }
  }, [glowTrigger, glowProgress, shinePosition, numberScale])

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(glowProgress.value, [0, 1], [colors.border, '#ffffff'])
    return { borderColor }
  }, [colors])

  const animatedShineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shinePosition.value }, { rotate: '-20deg' }],
      opacity: glowProgress.value > 0 ? 1 : 0,
    }
  }, [])

  const animatedBackgroundGlowStyle = useAnimatedStyle(() => {
    return { opacity: glowProgress.value * 0.25 }
  }, [])

  const animatedNumberStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: numberScale.value }],
    }
  }, [])

  const attackBonus = formatAttackBonus(attack.attackBonus.totalValue)
  const damageText = formatDamage(attack.damage)
  const isMelee = attack.type === 'melee'

  return (
    <Animated.View
      style={[styles.cardWrapper, animatedBorderStyle, { backgroundColor: colors.background }]}
    >
      <Animated.View style={[styles.backgroundGlow, animatedBackgroundGlowStyle]} />
      <Animated.View style={[styles.shineContainer, animatedShineStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255, 255, 255, 0.05)',
            'rgba(255, 255, 255, 0.15)',
            'rgba(255, 255, 255, 0.3)',
            'rgba(255, 255, 255, 0.15)',
            'rgba(255, 255, 255, 0.05)',
            'transparent',
          ]}
          locations={[0, 0.15, 0.35, 0.5, 0.65, 0.85, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.shineGradient}
        />
      </Animated.View>
      <Pressable
        onPress={onPress}
        android_ripple={{ color: `${colors.accent}50` }}
        style={styles.pressable}
      >
        {({ pressed }) => (
          <XStack
            paddingVertical={12}
            paddingHorizontal={16}
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            opacity={pressed ? 0.7 : 1}
          >
            <YStack flex={1} gap={2}>
              <Text
                fontSize={14}
                fontWeight="600"
                color="#ffffff"
                numberOfLines={1}
              >
                {attack.name}
              </Text>
              <Text
                fontSize={11}
                color={colors.primary}
                textTransform="uppercase"
              >
                {isMelee ? 'Melee' : 'Ranged'}
              </Text>
            </YStack>

            <XStack alignItems="center" gap={16}>
              <Animated.View style={animatedNumberStyle}>
                <YStack alignItems="center">
                  <Text fontSize={18} fontWeight="700" color="#ffffff">
                    {attackBonus}
                  </Text>
                  <Text fontSize={10} color={colors.primary}>
                    ATK
                  </Text>
                </YStack>
              </Animated.View>

              <YStack alignItems="center">
                <Text fontSize={14} fontWeight="600" color="#ffffff">
                  {damageText}
                </Text>
                <Text fontSize={10} color={colors.primary}>
                  DMG
                </Text>
              </YStack>
            </XStack>
          </XStack>
        )}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderRadius: 5,
  },
  shineContainer: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 40,
    zIndex: 10,
    pointerEvents: 'none',
  },
  shineGradient: {
    flex: 1,
    width: '100%',
  },
  pressable: {
    width: '100%',
  },
})
