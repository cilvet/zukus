// @ts-nocheck
// Los errores de tipo son debido a incompatibilidades entre @types/react 18 y 19
// El código funciona correctamente en runtime
import { useEffect } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { YStack, Text } from 'tamagui'
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
import { useTheme } from '../../contexts/ThemeContext'
import { useGlowOnChange } from '../../../hooks'

const ABILITY_ABBR: Record<string, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

export type AbilityCardProps = {
  abilityKey: string
  score: number
  modifier: number
  onPress?: () => void
}

export const AbilityCard: React.FC<AbilityCardProps> = ({
  abilityKey,
  score,
  modifier,
  onPress,
}) => {
  "use no memo"; // Reanimated shared values are mutable by design
  // Detectar cambios en el score - retorna un contador que se incrementa en cada cambio
  const glowTrigger = useGlowOnChange(score)
  const { themeInfo } = useTheme()
  const colors = themeInfo.colors

  const glowProgress = useSharedValue(0)
  const shinePosition = useSharedValue(-80)
  const numberScale = useSharedValue(1)
  const numberTranslateY = useSharedValue(0)

  const CARD_WIDTH = 65
  const SHINE_WIDTH = 50

  useEffect(() => {
    // glowTrigger > 0 significa que hubo al menos un cambio después del mount
    if (glowTrigger > 0) {
      // Animate border glow and background
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

      // Animate sword shine across the card
      shinePosition.value = -SHINE_WIDTH * 2
      shinePosition.value = withDelay(
        50,
        withTiming(CARD_WIDTH + SHINE_WIDTH, {
          duration: 350,
          easing: Easing.in(Easing.quad),
        })
      )

      // Animate numbers - pop up effect
      numberScale.value = withSequence(
        withTiming(1.25, { duration: 150, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
      )
      numberTranslateY.value = withSequence(
        withTiming(-3, { duration: 150, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) })
      )
    }
  }, [glowTrigger, glowProgress, shinePosition, numberScale, numberTranslateY])

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(glowProgress.value, [0, 1], [colors.border, '#ffffff'])

    return {
      borderColor,
    }
  }, [colors])

  const animatedShineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shinePosition.value }, { rotate: '-20deg' }],
      opacity: glowProgress.value > 0 ? 1 : 0,
    }
  }, [])

  const animatedBackgroundGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowProgress.value * 0.25,
    }
  }, [])

  const animatedNumberStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: numberScale.value }, { translateY: numberTranslateY.value }],
    }
  }, [])

  const handlePress = () => {
    onPress?.()
  }

  const abbr = ABILITY_ABBR[abilityKey] ?? abilityKey.toUpperCase().slice(0, 3)

  return (
    <Animated.View
      style={[styles.cardWrapper, animatedBorderStyle, { backgroundColor: colors.background }]}
    >
      {/* Background glow */}
      <Animated.View style={[styles.backgroundGlow, animatedBackgroundGlowStyle]} />
      {/* Sword shine effect */}
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
        onPress={handlePress}
        android_ripple={{ color: `${colors.accent}50` }}
        style={styles.pressable}
      >
        {({ pressed }) => (
          <YStack
            paddingVertical={16}
            paddingHorizontal={4}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width="100%"
            opacity={pressed ? 0.7 : 1}
          >
            <Text
              fontFamily="$label"
              fontSize={12}
              fontWeight="700"
              color={colors.primary}
              textAlign="center"
            >
              {abbr}
            </Text>
            <Animated.View style={animatedNumberStyle}>
              <Text fontSize={22} fontWeight="800" color="#ffffff" textAlign="center" marginTop={4}>
                {modifier > 0 ? '+' : ''}
                {modifier}
              </Text>
            </Animated.View>
            <Animated.View style={animatedNumberStyle}>
              <Text fontSize={11} color={colors.accent} textAlign="center" marginTop={4}>
                {score}
              </Text>
            </Animated.View>
          </YStack>
        )}
      </Pressable>
    </Animated.View>
  )
}

/**
 * Versión compacta del AbilityCard - una línea horizontal
 */
export const AbilityCardCompact: React.FC<AbilityCardProps> = ({
  abilityKey,
  score,
  modifier,
  onPress,
}) => {
  "use no memo"; // Reanimated shared values are mutable by design
  const glowTrigger = useGlowOnChange(score)
  const { themeInfo } = useTheme()
  const colors = themeInfo.colors

  const glowProgress = useSharedValue(0)
  const numberScale = useSharedValue(1)

  useEffect(() => {
    if (glowTrigger > 0) {
      glowProgress.value = withSequence(
        withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 1200, easing: Easing.out(Easing.cubic) })
      )

      numberScale.value = withSequence(
        withTiming(1.15, { duration: 150, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
      )
    }
  }, [glowTrigger, glowProgress, numberScale])

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(glowProgress.value, [0, 1], [colors.border, '#ffffff'])
    return { borderColor }
  }, [colors])

  const animatedBackgroundGlowStyle = useAnimatedStyle(() => {
    return { opacity: glowProgress.value * 0.2 }
  }, [])

  const animatedNumberStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: numberScale.value }] }
  }, [])

  const abbr = ABILITY_ABBR[abilityKey] ?? abilityKey.toUpperCase().slice(0, 3)

  return (
    <Animated.View
      style={[
        stylesCompact.cardWrapper,
        animatedBorderStyle,
        { backgroundColor: colors.background },
      ]}
    >
      <Animated.View style={[stylesCompact.backgroundGlow, animatedBackgroundGlowStyle]} />
      <Pressable
        onPress={onPress}
        android_ripple={{ color: `${colors.accent}50` }}
        style={stylesCompact.pressable}
      >
        {({ pressed }) => (
          <YStack
            paddingVertical={8}
            paddingHorizontal={12}
            flexDirection="row"
            alignItems="center"
            width="100%"
            opacity={pressed ? 0.7 : 1}
          >
            <Text
              fontFamily="$label"
              fontSize={13}
              fontWeight="700"
              color={colors.primary}
              flex={1}
            >
              {abbr}
            </Text>
            <Animated.View style={[animatedNumberStyle, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
              <Text fontSize={16} fontWeight="800" color="#ffffff" textAlign="right" minWidth={36}>
                {modifier > 0 ? '+' : ''}
                {modifier}
              </Text>
              <Text fontSize={14} color={colors.accent} textAlign="center" minWidth={32}>
                ({score})
              </Text>
            </Animated.View>
          </YStack>
        )}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: 65,
    borderRadius: 8,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  shineContainer: {
    position: 'absolute',
    top: -30,
    bottom: -30,
    width: 50,
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

const stylesCompact = StyleSheet.create({
  cardWrapper: {
    borderRadius: 6,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  pressable: {
    width: '100%',
  },
})
