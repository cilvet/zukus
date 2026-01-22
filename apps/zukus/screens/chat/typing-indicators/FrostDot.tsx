import { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

export function FrostDot() {
  "use no memo"
  const orbit = useRef(new Animated.Value(0)).current
  const pulse = useRef(new Animated.Value(0)).current
  const sparkle = useRef(new Animated.Value(0)).current
  const color = '#BFE7FF'

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

  return (
    <View style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: 44,
          height: 44,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: color,
          opacity: haloOpacity,
          transform: [{ scale: haloScale }],
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          width: 52,
          height: 52,
          transform: [{ rotate: orbitRotate }],
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 2,
            left: 24,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: color,
            opacity: 0.9,
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: 2,
            top: 24,
            width: 7,
            height: 7,
            borderRadius: 3.5,
            backgroundColor: color,
            opacity: 0.6,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 2,
            left: 24,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: color,
            opacity: 0.4,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 2,
            top: 24,
            width: 7,
            height: 7,
            borderRadius: 3.5,
            backgroundColor: color,
            opacity: 0.7,
          }}
        />
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          width: 30,
          height: 30,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: sparkleOpacity,
          transform: [{ scale: sparkleScale }, { rotate: '45deg' }],
        }}
      >
        <View
          style={{
            position: 'absolute',
            width: 26,
            height: 4,
            borderRadius: 2,
            backgroundColor: color,
            opacity: 0.8,
          }}
        />
        <View
          style={{
            position: 'absolute',
            width: 4,
            height: 26,
            borderRadius: 2,
            backgroundColor: color,
            opacity: 0.8,
          }}
        />
      </Animated.View>
      <Animated.View
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          backgroundColor: color,
          opacity: coreOpacity,
          transform: [{ scale: coreScale }, { rotate: '45deg' }],
        }}
      />
    </View>
  )
}
