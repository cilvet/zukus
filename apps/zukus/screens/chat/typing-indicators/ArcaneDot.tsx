import { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

export function ArcaneDot() {
  "use no memo"
  const rotate = useRef(new Animated.Value(0)).current
  const pulse = useRef(new Animated.Value(0)).current
  const color = '#8FB3FF'

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.timing(rotate, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [pulse, rotate])

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.3] })
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.1] })
  const runeScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.05] })
  const rotateMain = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  const rotateReverse = rotate.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] })

  return (
    <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: 36,
          height: 36,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: color,
          opacity: ringOpacity,
          transform: [{ scale: ringScale }],
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          width: 32,
          height: 32,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate: rotateMain }],
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 0,
            width: 4,
            height: 8,
            borderRadius: 2,
            backgroundColor: color,
            opacity: 0.9,
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: 0,
            width: 8,
            height: 4,
            borderRadius: 2,
            backgroundColor: color,
            opacity: 0.8,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: 4,
            height: 8,
            borderRadius: 2,
            backgroundColor: color,
            opacity: 0.7,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 0,
            width: 8,
            height: 4,
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
          borderRadius: 3,
          borderWidth: 1,
          borderColor: color,
          opacity: 0.9,
          transform: [{ rotate: rotateReverse }, { scale: runeScale }],
        }}
      />
    </View>
  )
}
