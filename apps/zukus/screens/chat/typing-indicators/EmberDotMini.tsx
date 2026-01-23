import { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

const COLOR = '#FF9B3D'
const COLOR_INNER = '#FFD2A3'

type Props = {
  size: number
}

export function EmberDotMini({ size }: Props) {
  "use no memo"
  const flicker = useRef(new Animated.Value(0)).current
  const spark = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(flicker, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(flicker, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(spark, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(spark, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.delay(200),
        ]),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [flicker, spark])

  const glowScale = flicker.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.25] })
  const glowOpacity = flicker.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.4] })
  const flameScaleX = flicker.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.05] })
  const flameScaleY = flicker.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.18] })
  const flameLift = flicker.interpolate({ inputRange: [0, 1], outputRange: [size * 0.045, -size * 0.045] })
  const flameLean = flicker.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] })
  const sparkY = spark.interpolate({ inputRange: [0, 1], outputRange: [size * 0.27, -size * 0.27] })
  const sparkOpacity = spark.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.7, 0] })

  // All sizes proportional to container
  const glowSize = size * 0.82
  const flameBaseWidth = size * 0.48
  const flameBaseHeight = size * 0.36
  const flameTipSize = size * 0.39
  const flameInnerWidth = size * 0.18
  const flameInnerHeight = size * 0.27
  const sparkSize = size * 0.12

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow ring */}
      <Animated.View
        style={{
          position: 'absolute',
          width: glowSize,
          height: glowSize,
          borderRadius: glowSize / 2,
          borderWidth: 1,
          borderColor: COLOR,
          opacity: glowOpacity,
          transform: [{ scale: glowScale }],
        }}
      />
      {/* Flame */}
      <Animated.View
        style={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          transform: [{ rotate: flameLean }, { translateY: flameLift }],
        }}
      >
        {/* Flame base */}
        <Animated.View
          style={{
            width: flameBaseWidth,
            height: flameBaseHeight,
            borderRadius: flameBaseHeight / 2,
            backgroundColor: COLOR,
            transform: [{ scaleX: flameScaleX }],
          }}
        />
        {/* Flame tip */}
        <Animated.View
          style={{
            position: 'absolute',
            top: -flameBaseHeight,
            width: flameTipSize,
            height: flameTipSize,
            borderRadius: flameTipSize * 0.23,
            backgroundColor: COLOR,
            transform: [
              { translateY: size * 0.045 },
              { rotate: '45deg' },
              { scaleX: flameScaleX },
              { scaleY: flameScaleY },
            ],
          }}
        />
        {/* Flame inner */}
        <Animated.View
          style={{
            position: 'absolute',
            top: -flameInnerHeight,
            width: flameInnerWidth,
            height: flameInnerHeight,
            borderRadius: flameInnerWidth * 0.25,
            backgroundColor: COLOR_INNER,
            opacity: 0.85,
            transform: [{ rotate: '45deg' }, { scaleY: flameScaleY }],
          }}
        />
      </Animated.View>
      {/* Spark */}
      <Animated.View
        style={{
          position: 'absolute',
          width: sparkSize,
          height: sparkSize,
          borderRadius: sparkSize / 2,
          backgroundColor: COLOR,
          opacity: sparkOpacity,
          transform: [{ translateY: sparkY }],
        }}
      />
    </View>
  )
}
