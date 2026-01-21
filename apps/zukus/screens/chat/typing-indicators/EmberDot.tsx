import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

export function EmberDot() {
  "use no memo"
  const scale = useRef(new Animated.Value(0.7)).current
  const opacity = useRef(new Animated.Value(0.9)).current
  const translateY = useRef(new Animated.Value(0)).current
  const color = '#FF9B3D'

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.25, duration: 360, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.7, duration: 360, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.6, duration: 360, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.9, duration: 360, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(translateY, { toValue: -2, duration: 360, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 2, duration: 360, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 360, useNativeDriver: true }),
        ]),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [opacity, scale, translateY])

  return (
    <Animated.View
      style={{
        width: 9,
        height: 9,
        borderRadius: 4.5,
        backgroundColor: color,
        opacity,
        transform: [{ scale }, { translateY }],
      }}
    />
  )
}
