import { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

type AudioWaveformProps = {
  meteringData: number[]
  color?: string
  barCount?: number
}

const DEFAULT_BAR_COUNT = 24
const BAR_WIDTH = 4
const MAX_BAR_HEIGHT = 28
const MIN_BAR_HEIGHT = 6

export function AudioWaveform({
  meteringData,
  color = '#FF6B6B',
  barCount = DEFAULT_BAR_COUNT,
}: AudioWaveformProps) {
  'use no memo'

  const animatedValues = useRef<Animated.Value[]>(
    Array.from({ length: barCount }, () => new Animated.Value(MIN_BAR_HEIGHT))
  ).current

  useEffect(() => {
    // Distribuir los datos de metering entre las barras
    const dataLength = meteringData.length
    if (dataLength === 0) {
      // Sin datos, animar con valores minimos
      animatedValues.forEach((value) => {
        Animated.timing(value, {
          toValue: MIN_BAR_HEIGHT,
          duration: 100,
          useNativeDriver: false,
        }).start()
      })
      return
    }

    // Usar los ultimos N valores de metering (donde N es el numero de barras)
    const recentData = meteringData.slice(-barCount)

    animatedValues.forEach((animValue, index) => {
      // Si hay suficientes datos, usar el valor correspondiente
      // Si no, usar un valor interpolado o el minimo
      const dataIndex = index - (barCount - recentData.length)
      const normalizedValue = dataIndex >= 0 ? recentData[dataIndex] ?? 0.2 : 0.2

      const targetHeight = MIN_BAR_HEIGHT + normalizedValue * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT)

      Animated.timing(animValue, {
        toValue: targetHeight,
        duration: 80,
        useNativeDriver: false,
      }).start()
    })
  }, [meteringData, animatedValues, barCount])

  return (
    <View
      style={{
        flex: 1,
        height: MAX_BAR_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
      }}
    >
      {animatedValues.map((height, index) => (
        <Animated.View
          key={index}
          style={{
            width: BAR_WIDTH,
            height,
            backgroundColor: color,
            borderRadius: BAR_WIDTH / 2,
          }}
        />
      ))}
    </View>
  )
}
