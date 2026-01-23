import { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

const COLOR = '#BFE7FF'

type Props = {
  size: number
}

export function FrostDotMini({ size }: Props) {
  "use no memo"
  const orbit = useRef(new Animated.Value(0)).current
  const pulse = useRef(new Animated.Value(0)).current
  const sparkle = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.timing(orbit, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(sparkle, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(sparkle, { toValue: 0, duration: 900, useNativeDriver: true }),
          Animated.delay(300),
        ]),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [orbit, pulse, sparkle])

  const orbitRotate = orbit.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  const coreScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] })
  const coreOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] })
  const haloScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.35] })
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.05] })
  const sparkleOpacity = sparkle.interpolate({ inputRange: [0, 1], outputRange: [0, 0.9] })
  const sparkleScale = sparkle.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] })

  // All sizes proportional to container
  const haloSize = size * 0.85
  const particleLarge = size * 0.15
  const particleSmall = size * 0.13
  const sparkleSize = size * 0.56
  const sparkleBarWidth = size * 0.51
  const sparkleBarHeight = size * 0.08
  const coreSize = size * 0.36

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Halo */}
      <Animated.View
        style={{
          position: 'absolute',
          width: haloSize,
          height: haloSize,
          borderRadius: haloSize / 2,
          borderWidth: 1,
          borderColor: COLOR,
          opacity: haloOpacity,
          transform: [{ scale: haloScale }],
        }}
      />
      {/* Orbiting particles */}
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          transform: [{ rotate: orbitRotate }],
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: size * 0.03,
            left: size * 0.44,
            width: particleLarge,
            height: particleLarge,
            borderRadius: particleLarge / 2,
            backgroundColor: COLOR,
            opacity: 0.9,
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: size * 0.03,
            top: size * 0.44,
            width: particleSmall,
            height: particleSmall,
            borderRadius: particleSmall / 2,
            backgroundColor: COLOR,
            opacity: 0.6,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: size * 0.03,
            left: size * 0.44,
            width: particleSmall,
            height: particleSmall,
            borderRadius: particleSmall / 2,
            backgroundColor: COLOR,
            opacity: 0.4,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: size * 0.03,
            top: size * 0.44,
            width: particleSmall,
            height: particleSmall,
            borderRadius: particleSmall / 2,
            backgroundColor: COLOR,
            opacity: 0.7,
          }}
        />
      </Animated.View>
      {/* Sparkle cross */}
      <Animated.View
        style={{
          position: 'absolute',
          width: sparkleSize,
          height: sparkleSize,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: sparkleOpacity,
          transform: [{ scale: sparkleScale }, { rotate: '45deg' }],
        }}
      >
        <View
          style={{
            position: 'absolute',
            width: sparkleBarWidth,
            height: sparkleBarHeight,
            borderRadius: sparkleBarHeight / 2,
            backgroundColor: COLOR,
            opacity: 0.8,
          }}
        />
        <View
          style={{
            position: 'absolute',
            width: sparkleBarHeight,
            height: sparkleBarWidth,
            borderRadius: sparkleBarHeight / 2,
            backgroundColor: COLOR,
            opacity: 0.8,
          }}
        />
      </Animated.View>
      {/* Core diamond */}
      <Animated.View
        style={{
          width: coreSize,
          height: coreSize,
          borderRadius: coreSize * 0.2,
          backgroundColor: COLOR,
          opacity: coreOpacity,
          transform: [{ scale: coreScale }, { rotate: '45deg' }],
        }}
      />
    </View>
  )
}
