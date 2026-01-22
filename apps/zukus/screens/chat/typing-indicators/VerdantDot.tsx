import { useEffect, useRef } from 'react'
import { Animated, Easing, View } from 'react-native'

export function VerdantDot() {
  "use no memo"
  const breathe = useRef(new Animated.Value(0)).current
  const spin = useRef(new Animated.Value(0)).current
  const color = '#7FE28A'

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1, duration: 520, useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 0, duration: 520, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(spin, {
            toValue: 1,
            duration: 520,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [breathe, spin])

  const leafScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.1] })
  const stemScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.05] })
  const leafOpacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] })
  const spinRotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })

  return (
    <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate: spinRotate }],
        }}
      >
        <Animated.View
          style={{
            width: 4,
            height: 20,
            borderRadius: 2,
            backgroundColor: color,
            opacity: 0.8,
            transform: [{ scaleY: stemScale }],
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            top: 4,
            left: -12,
            width: 18,
            height: 10,
            borderRadius: 6,
            backgroundColor: color,
            opacity: leafOpacity,
            transform: [{ rotate: '-30deg' }, { scale: leafScale }],
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            top: 4,
            right: -12,
            width: 18,
            height: 10,
            borderRadius: 6,
            backgroundColor: color,
            opacity: leafOpacity,
            transform: [{ rotate: '30deg' }, { scale: leafScale }],
          }}
        />
      </Animated.View>
    </View>
  )
}
