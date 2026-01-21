import { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

export function FrostDot() {
  "use no memo"
  const ringScale = useRef(new Animated.Value(0.7)).current
  const ringOpacity = useRef(new Animated.Value(0.7)).current
  const dotScale = useRef(new Animated.Value(0.9)).current
  const color = '#BFE7FF'

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale, { toValue: 1.4, duration: 700, useNativeDriver: true }),
          Animated.timing(ringScale, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, { toValue: 0.2, duration: 700, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dotScale, { toValue: 1.05, duration: 700, useNativeDriver: true }),
          Animated.timing(dotScale, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        ]),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [dotScale, ringOpacity, ringScale])

  return (
    <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: 14,
          height: 14,
          borderRadius: 7,
          borderWidth: 1,
          borderColor: color,
          opacity: ringOpacity,
          transform: [{ scale: ringScale }],
        }}
      />
      <Animated.View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
          transform: [{ scale: dotScale }],
        }}
      />
    </View>
  )
}
