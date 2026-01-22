import { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

export function EmberDot() {
  "use no memo"
  const flicker = useRef(new Animated.Value(0)).current
  const spark = useRef(new Animated.Value(0)).current
  const color = '#FF9B3D'

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
  const flameLift = flicker.interpolate({ inputRange: [0, 1], outputRange: [2, -2] })
  const flameLean = flicker.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] })
  const sparkY = spark.interpolate({ inputRange: [0, 1], outputRange: [12, -12] })
  const sparkOpacity = spark.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.7, 0] })

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
          opacity: glowOpacity,
          transform: [{ scale: glowScale }],
        }}
      />
      <Animated.View
        style={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          transform: [{ rotate: flameLean }, { translateY: flameLift }],
        }}
      >
        <Animated.View
          style={{
            width: 22,
            height: 16,
            borderRadius: 8,
            backgroundColor: color,
            transform: [{ scaleX: flameScaleX }],
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            top: -16,
            width: 18,
            height: 18,
            borderRadius: 3,
            backgroundColor: color,
            transform: [
              { translateY: 2 },
              { rotate: '45deg' },
              { scaleX: flameScaleX },
              { scaleY: flameScaleY },
            ],
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            top: -12,
            width: 9,
            height: 12,
            borderRadius: 2,
            backgroundColor: '#FFD2A3',
            opacity: 0.85,
            transform: [{ rotate: '45deg' }, { scaleY: flameScaleY }],
          }}
        />
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
          opacity: sparkOpacity,
          transform: [{ translateY: sparkY }],
        }}
      />
    </View>
  )
}
