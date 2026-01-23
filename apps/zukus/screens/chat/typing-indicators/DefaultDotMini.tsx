import { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

type Props = {
  color: string
  size: number
}

export function DefaultDotMini({ color, size }: Props) {
  "use no memo"
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [pulse])

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] })
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] })

  const coreSize = size * 0.45

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          width: coreSize,
          height: coreSize,
          borderRadius: coreSize / 2,
          backgroundColor: color,
          opacity,
          transform: [{ scale }],
        }}
      />
    </View>
  )
}
