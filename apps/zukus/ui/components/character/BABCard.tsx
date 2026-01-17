// @ts-nocheck
// Los errores de tipo son debido a incompatibilidades entre @types/react 18 y 19
// El código funciona correctamente en runtime
import { useEffect } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { XStack, Text } from 'tamagui'
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

export type BABCardProps = {
  totalValue: number
  multipleAttacks?: number[]
  onPress?: () => void
}

function formatBAB(totalValue: number, multipleAttacks?: number[]): string {
  if (multipleAttacks && multipleAttacks.length > 1) {
    return multipleAttacks.map(v => (v >= 0 ? `+${v}` : `${v}`)).join('/')
  }
  return totalValue >= 0 ? `+${totalValue}` : `${totalValue}`
}

/**
 * Linea compacta de Base Attack Bonus con animacion de brillo cuando el valor cambia.
 * Layout horizontal: [BAB] [+6/+1]
 */
export const BABCard: React.FC<BABCardProps> = ({
  totalValue,
  multipleAttacks,
  onPress,
}) => {
  "use no memo"; // Reanimated shared values are mutable by design
  const glowTrigger = useGlowOnChange(totalValue)
  const { themeInfo } = useTheme()
  const colors = themeInfo.colors

  const glowProgress = useSharedValue(0)
  const shinePosition = useSharedValue(-80)
  const numberScale = useSharedValue(1)

  const LINE_WIDTH = 200
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
        withTiming(LINE_WIDTH + SHINE_WIDTH, {
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

  return (
    <Animated.View
      style={[styles.lineWrapper, animatedBorderStyle, { backgroundColor: colors.background }]}
    >
      {/* Background glow */}
      <Animated.View style={[styles.backgroundGlow, animatedBackgroundGlowStyle]} />
      {/* Shine effect */}
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
            paddingVertical={10}
            paddingHorizontal={12}
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            opacity={pressed ? 0.7 : 1}
          >
            <Text
              fontSize={14}
              fontWeight="600"
              color={colors.primary}
            >
              BAB
            </Text>
            <Animated.View style={animatedNumberStyle}>
              <Text fontSize={16} fontWeight="700" color="#ffffff">
                {formatBAB(totalValue, multipleAttacks)}
              </Text>
            </Animated.View>
          </XStack>
        )}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  lineWrapper: {
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
