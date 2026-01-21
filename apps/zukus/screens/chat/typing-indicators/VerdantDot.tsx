import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

export function VerdantDot() {
  "use no memo"
  const translateX = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.85)).current
  const color = '#7FE28A'

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(translateX, { toValue: 4, duration: 520, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: -4, duration: 520, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 0, duration: 520, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.1, duration: 520, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.85, duration: 520, useNativeDriver: true }),
        ]),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [scale, translateX])

  return (
    <Animated.View
      style={{
        width: 9,
        height: 9,
        borderRadius: 4.5,
        backgroundColor: color,
        transform: [{ scale }, { translateX }],
      }}
    />
  )
}
