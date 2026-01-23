import { useEffect, useRef } from 'react'
import { Animated, Easing, View } from 'react-native'

const COLOR = '#7FE28A'

type Props = {
  size: number
}

export function VerdantDotMini({ size }: Props) {
  "use no memo"
  const breathe = useRef(new Animated.Value(0)).current
  const spin = useRef(new Animated.Value(0)).current

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

  // All sizes proportional to container
  const stemWidth = size * 0.09
  const stemHeight = size * 0.45
  const leafWidth = size * 0.42
  const leafHeight = size * 0.24
  const leafOffset = size * 0.27

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate: spinRotate }],
        }}
      >
        {/* Stem */}
        <Animated.View
          style={{
            width: stemWidth,
            height: stemHeight,
            borderRadius: stemWidth / 2,
            backgroundColor: COLOR,
            opacity: 0.8,
            transform: [{ scaleY: stemScale }],
          }}
        />
        {/* Left leaf */}
        <Animated.View
          style={{
            position: 'absolute',
            top: size * 0.09,
            left: -leafOffset,
            width: leafWidth,
            height: leafHeight,
            borderRadius: leafHeight * 0.63,
            backgroundColor: COLOR,
            opacity: leafOpacity,
            transform: [{ rotate: '-30deg' }, { scale: leafScale }],
          }}
        />
        {/* Right leaf */}
        <Animated.View
          style={{
            position: 'absolute',
            top: size * 0.09,
            right: -leafOffset,
            width: leafWidth,
            height: leafHeight,
            borderRadius: leafHeight * 0.63,
            backgroundColor: COLOR,
            opacity: leafOpacity,
            transform: [{ rotate: '30deg' }, { scale: leafScale }],
          }}
        />
      </Animated.View>
    </View>
  )
}
