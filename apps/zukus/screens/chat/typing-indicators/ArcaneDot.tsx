import { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

export function ArcaneDot() {
  "use no memo"
  const ringScale = useRef(new Animated.Value(0.9)).current
  const ringOpacity = useRef(new Animated.Value(0.4)).current
  const color = '#8FB3FF'

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale, { toValue: 1.5, duration: 900, useNativeDriver: true }),
          Animated.timing(ringScale, { toValue: 0.9, duration: 900, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, { toValue: 0.15, duration: 900, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.4, duration: 900, useNativeDriver: true }),
        ]),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [ringOpacity, ringScale])

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
      <View
        style={{
          width: 7,
          height: 7,
          borderRadius: 3.5,
          backgroundColor: color,
        }}
      />
    </View>
  )
}
