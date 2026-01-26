// @ts-nocheck
import { useEffect } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
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
import { useTheme } from '../../contexts/ThemeContext'
import { useGlowOnChange } from '../../../hooks'
import { ANIMATIONS_ENABLED } from '../../constants/animations'

const AC_TYPE_NAMES: Record<string, string> = { total: 'AC', touch: 'Touch', flatFooted: 'FF' }

type MiniACCardProps = { label: string; value: number; onPress?: () => void; glowEnabled?: boolean }

const MiniACCardStatic: React.FC<MiniACCardProps> = ({ label, value, onPress }) => {
  const { themeInfo } = useTheme()
  const colors = themeInfo.colors

  return (
    <View style={[styles.miniCardWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Pressable onPress={onPress} android_ripple={{ color: `${colors.accent}50` }} style={styles.pressable}>
        {({ pressed }) => (
          <YStack paddingVertical={16} paddingHorizontal={4} justifyContent="center" alignItems="center" opacity={pressed ? 0.7 : 1}>
            <Text fontFamily="$label" fontSize={11} fontWeight="700" color={colors.primary} textAlign="center">{label}</Text>
            <Text fontSize={22} fontWeight="800" color="#ffffff" textAlign="center" marginTop={4}>{value}</Text>
          </YStack>
        )}
      </Pressable>
    </View>
  )
}

const MiniACCardAnimated: React.FC<MiniACCardProps> = ({ label, value, onPress, glowEnabled = true }) => {
  "use no memo"
  const glowTrigger = useGlowOnChange(value, { enabled: glowEnabled })
  const { themeInfo } = useTheme()
  const colors = themeInfo.colors

  const glowProgress = useSharedValue(0)
  const shinePosition = useSharedValue(-80)
  const numberScale = useSharedValue(1)
  const numberTranslateY = useSharedValue(0)

  const CARD_WIDTH = 75
  const SHINE_WIDTH = 40

  useEffect(() => {
    if (glowTrigger > 0) {
      glowProgress.value = withSequence(withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) }), withTiming(0, { duration: 1200, easing: Easing.out(Easing.cubic) }))
      shinePosition.value = -SHINE_WIDTH * 2
      shinePosition.value = withDelay(50, withTiming(CARD_WIDTH + SHINE_WIDTH, { duration: 350, easing: Easing.in(Easing.quad) }))
      numberScale.value = withSequence(withTiming(1.25, { duration: 150, easing: Easing.out(Easing.cubic) }), withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }))
      numberTranslateY.value = withSequence(withTiming(-3, { duration: 150, easing: Easing.out(Easing.cubic) }), withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }))
    }
  }, [glowTrigger, glowProgress, shinePosition, numberScale, numberTranslateY])

  const animatedBorderStyle = useAnimatedStyle(() => ({ borderColor: interpolateColor(glowProgress.value, [0, 1], [colors.border, '#ffffff']) }), [colors])
  const animatedShineStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shinePosition.value }, { rotate: '-20deg' }], opacity: glowProgress.value > 0 ? 1 : 0 }), [])
  const animatedBackgroundGlowStyle = useAnimatedStyle(() => ({ opacity: glowProgress.value * 0.25 }), [])
  const animatedNumberStyle = useAnimatedStyle(() => ({ transform: [{ scale: numberScale.value }, { translateY: numberTranslateY.value }] }), [])

  return (
    <Animated.View style={[styles.miniCardWrapper, animatedBorderStyle, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.backgroundGlow, animatedBackgroundGlowStyle]} />
      <Animated.View style={[styles.shineContainer, animatedShineStyle]}>
        <LinearGradient colors={['transparent', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)', 'transparent']} locations={[0, 0.15, 0.35, 0.5, 0.65, 0.85, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.shineGradient} />
      </Animated.View>
      <Pressable onPress={onPress} android_ripple={{ color: `${colors.accent}50` }} style={styles.pressable}>
        {({ pressed }) => (
          <YStack paddingVertical={16} paddingHorizontal={4} justifyContent="center" alignItems="center" opacity={pressed ? 0.7 : 1}>
            <Text fontFamily="$label" fontSize={11} fontWeight="700" color={colors.primary} textAlign="center">{label}</Text>
            <Animated.View style={animatedNumberStyle}>
              <Text fontSize={22} fontWeight="800" color="#ffffff" textAlign="center" marginTop={4}>{value}</Text>
            </Animated.View>
          </YStack>
        )}
      </Pressable>
    </Animated.View>
  )
}

const MiniACCard = ANIMATIONS_ENABLED ? MiniACCardAnimated : MiniACCardStatic

export type ArmorClassCardProps = { totalAC: number; touchAC: number; flatFootedAC: number; onPress?: () => void; glowEnabled?: boolean }

export const ArmorClassCard: React.FC<ArmorClassCardProps> = ({ totalAC, touchAC, flatFootedAC, onPress, glowEnabled = true }) => (
  <XStack gap={8}>
    <MiniACCard label={AC_TYPE_NAMES.total} value={totalAC} onPress={onPress} glowEnabled={glowEnabled} />
    <MiniACCard label={AC_TYPE_NAMES.touch} value={touchAC} onPress={onPress} glowEnabled={glowEnabled} />
    <MiniACCard label={AC_TYPE_NAMES.flatFooted} value={flatFootedAC} onPress={onPress} glowEnabled={glowEnabled} />
  </XStack>
)

const styles = StyleSheet.create({
  miniCardWrapper: { flex: 1, borderRadius: 8, borderWidth: 1.5, overflow: 'hidden' },
  backgroundGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#ffffff', borderRadius: 6 },
  shineContainer: { position: 'absolute', top: -30, bottom: -30, width: 40, zIndex: 10, pointerEvents: 'none' },
  shineGradient: { flex: 1, width: '100%' },
  pressable: { width: '100%' },
})
