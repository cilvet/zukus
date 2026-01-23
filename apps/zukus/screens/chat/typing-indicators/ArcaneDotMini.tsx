import { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

const COLOR = '#8FB3FF'

type Props = {
  size: number
}

export function ArcaneDotMini({ size }: Props) {
  "use no memo"
  const rotate = useRef(new Animated.Value(0)).current
  const pulse = useRef(new Animated.Value(0)).current

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

  // All sizes proportional to container
  const ringSize = size * 0.82
  const runeContainerSize = size * 0.73
  const runeBarShort = size * 0.09
  const runeBarLong = size * 0.18
  const centerRuneSize = size * 0.39

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer ring */}
      <Animated.View
        style={{
          position: 'absolute',
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          borderWidth: 1,
          borderColor: COLOR,
          opacity: ringOpacity,
          transform: [{ scale: ringScale }],
        }}
      />
      {/* Rotating runes */}
      <Animated.View
        style={{
          position: 'absolute',
          width: runeContainerSize,
          height: runeContainerSize,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate: rotateMain }],
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 0,
            width: runeBarShort,
            height: runeBarLong,
            borderRadius: runeBarShort / 2,
            backgroundColor: COLOR,
            opacity: 0.9,
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: 0,
            width: runeBarLong,
            height: runeBarShort,
            borderRadius: runeBarShort / 2,
            backgroundColor: COLOR,
            opacity: 0.8,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: runeBarShort,
            height: runeBarLong,
            borderRadius: runeBarShort / 2,
            backgroundColor: COLOR,
            opacity: 0.7,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 0,
            width: runeBarLong,
            height: runeBarShort,
            borderRadius: runeBarShort / 2,
            backgroundColor: COLOR,
            opacity: 0.8,
          }}
        />
      </Animated.View>
      {/* Center rune */}
      <Animated.View
        style={{
          width: centerRuneSize,
          height: centerRuneSize,
          borderRadius: centerRuneSize * 0.23,
          borderWidth: 1,
          borderColor: COLOR,
          opacity: 0.9,
          transform: [{ rotate: rotateReverse }, { scale: runeScale }],
        }}
      />
    </View>
  )
}
