// @ts-nocheck
// Los errores de tipo son debido a incompatibilidades entre @types/react 18 y 19
// El código funciona correctamente en runtime
import React from 'react'
import { Pressable, Platform, StyleSheet, View } from 'react-native'
import { Text, styled } from 'tamagui'
import Animated, {
  useAnimatedReaction,
  useSharedValue,
  withTiming,
  withSequence,
  withRepeat,
  interpolateColor,
  runOnJS,
  Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import Svg, { Path } from 'react-native-svg'
import { useTheme, type CheckboxVariant } from '../../contexts/ThemeContext'

const CheckboxLabel = styled(Text, {
  name: 'CheckboxLabel',
  color: '$color',
})

export type CheckboxProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: CheckboxVariant
}

const getSizeConfig = (size: 'small' | 'medium' | 'large') => {
  const configs = {
    small: { wrapperSize: 24, shapeSize: 16, innerSize: 8, fontSize: 14 },
    medium: { wrapperSize: 28, shapeSize: 20, innerSize: 10, fontSize: 16 },
    large: { wrapperSize: 34, shapeSize: 26, innerSize: 14, fontSize: 18 },
  }
  return configs[size]
}

// ============ SHAPE COMPONENTS ============

type ShapeProps = {
  size: number
  innerSize: number
  borderColor: string
  backgroundColor: string
  gemColor: string
  glowOpacity: number
  shimmerValue: number
  scale: number
}

// Diamond shape (rotated square)
const DiamondShape: React.FC<ShapeProps> = ({
  size,
  innerSize,
  borderColor,
  backgroundColor,
  gemColor,
  glowOpacity,
  shimmerValue,
  scale,
}) => {
  return (
    <Animated.View
      style={[
        styles.shapeBase,
        {
          width: size,
          height: size,
          borderColor,
          backgroundColor,
          transform: [{ rotate: '45deg' }, { scale }],
        },
      ]}
    >
      <GemCore
        innerSize={innerSize}
        gemColor={gemColor}
        glowOpacity={glowOpacity}
        shimmerValue={shimmerValue}
      />
    </Animated.View>
  )
}

// Circle shape
const CircleShape: React.FC<ShapeProps> = ({
  size,
  innerSize,
  borderColor,
  backgroundColor,
  gemColor,
  glowOpacity,
  shimmerValue,
  scale,
}) => {
  const circleSize = size * 1.2

  return (
    <Animated.View
      style={[
        styles.shapeBase,
        {
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          borderColor,
          backgroundColor,
          transform: [{ scale }],
        },
      ]}
    >
      <GemCore
        innerSize={innerSize}
        gemColor={gemColor}
        glowOpacity={glowOpacity}
        shimmerValue={shimmerValue}
        isRound
      />
    </Animated.View>
  )
}

// Gothic shape (pointy diamond with extended corners)
const GothicShape: React.FC<ShapeProps> = ({
  size,
  innerSize,
  borderColor,
  backgroundColor,
  gemColor,
  glowOpacity,
  shimmerValue,
  scale,
}) => {
  const pointSize = size * 0.3

  return (
    <View style={[styles.gothicContainer, { transform: [{ scale }] }]}>
      <Animated.View
        style={[
          styles.shapeBase,
          {
            width: size,
            height: size,
            borderColor,
            backgroundColor,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      >
        <GemCore
          innerSize={innerSize}
          gemColor={gemColor}
          glowOpacity={glowOpacity}
          shimmerValue={shimmerValue}
        />
      </Animated.View>
      <View
        style={[
          styles.gothicSpike,
          styles.gothicSpikeTop,
          {
            borderBottomColor: borderColor,
            borderLeftWidth: pointSize / 2,
            borderRightWidth: pointSize / 2,
            borderBottomWidth: pointSize,
          },
        ]}
      />
      <View
        style={[
          styles.gothicSpike,
          styles.gothicSpikeBottom,
          {
            borderTopColor: borderColor,
            borderLeftWidth: pointSize / 2,
            borderRightWidth: pointSize / 2,
            borderTopWidth: pointSize,
          },
        ]}
      />
    </View>
  )
}

// Gear shape using SVG
const GearShape: React.FC<ShapeProps> = ({
  size,
  innerSize,
  borderColor,
  backgroundColor,
  gemColor,
  glowOpacity,
  shimmerValue,
  scale,
}) => {
  const svgSize = size * 1.5

  const gearPath = `
    M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z
  `

  return (
    <View style={[styles.gearContainer, { transform: [{ scale }] }]}>
      <Svg width={svgSize} height={svgSize} viewBox="0 0 24 24">
        <Path
          d={gearPath}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <View style={styles.gearCoreOverlay}>
        <GemCore
          innerSize={innerSize}
          gemColor={gemColor}
          glowOpacity={glowOpacity}
          shimmerValue={shimmerValue}
          isRound
        />
      </View>
    </View>
  )
}

// Shield shape using SVG
const ShieldShape: React.FC<ShapeProps> = ({
  size,
  innerSize,
  borderColor,
  backgroundColor,
  gemColor,
  glowOpacity,
  shimmerValue,
  scale,
}) => {
  const svgSize = size * 1.4
  const viewBox = 24

  const shieldPath = `
    M3 2
    L21 2
    L21 10
    Q21 15 12 22
    Q3 15 3 10
    L3 2
    Z
  `

  return (
    <View style={[styles.shieldContainer, { transform: [{ scale }] }]}>
      <Svg width={svgSize} height={svgSize} viewBox={`0 0 ${viewBox} ${viewBox}`}>
        <Path
          d={shieldPath}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </Svg>
      <View style={[styles.shieldCoreOverlay, { marginTop: -4 }]}>
        <GemCore
          innerSize={innerSize}
          gemColor={gemColor}
          glowOpacity={glowOpacity}
          shimmerValue={shimmerValue}
          isRound
        />
      </View>
    </View>
  )
}

// Star shape (4-pointed)
const StarShape: React.FC<ShapeProps> = ({
  size,
  innerSize,
  borderColor,
  backgroundColor,
  gemColor,
  glowOpacity,
  shimmerValue,
  scale,
}) => {
  return (
    <View style={[styles.starContainer, { transform: [{ scale }] }]}>
      <Animated.View
        style={[
          styles.shapeBase,
          {
            width: size * 0.75,
            height: size * 0.75,
            borderColor,
            backgroundColor,
            transform: [{ rotate: '0deg' }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.shapeBase,
          styles.starSecondSquare,
          {
            width: size * 0.75,
            height: size * 0.75,
            borderColor,
            backgroundColor,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
      <View style={styles.starCore}>
        <GemCore
          innerSize={innerSize}
          gemColor={gemColor}
          glowOpacity={glowOpacity}
          shimmerValue={shimmerValue}
        />
      </View>
    </View>
  )
}

// ============ GEM CORE (shared inner glow) ============

type GemCoreProps = {
  innerSize: number
  gemColor: string
  glowOpacity: number
  shimmerValue: number
  isRound?: boolean
}

const GemCore: React.FC<GemCoreProps> = ({
  innerSize,
  gemColor,
  glowOpacity,
  shimmerValue,
  isRound = false,
}) => {
  const coreOpacity = glowOpacity
  const coreScale = 0.4 + glowOpacity * 0.6 + shimmerValue * 0.1
  const outerOpacity = glowOpacity * (0.4 + shimmerValue * 0.3)
  const outerScale = 0.8 + shimmerValue * 0.2
  const shineOpacity = glowOpacity * (0.6 + shimmerValue * 0.4)

  const borderRadius = isRound ? innerSize : 2
  const outerBorderRadius = isRound ? (innerSize + 6) / 2 : 2

  return (
    <>
      <View
        style={[
          styles.outerGlow,
          {
            width: innerSize + 6,
            height: innerSize + 6,
            backgroundColor: gemColor,
            shadowColor: gemColor,
            borderRadius: outerBorderRadius,
            opacity: outerOpacity,
            transform: [{ scale: outerScale }],
          },
        ]}
      />
      <View
        style={[
          styles.innerGlow,
          {
            width: innerSize,
            height: innerSize,
            backgroundColor: gemColor,
            shadowColor: gemColor,
            borderRadius: borderRadius,
            opacity: coreOpacity,
            transform: [{ scale: coreScale }],
          },
        ]}
      />
      <View
        style={[
          styles.shine,
          {
            width: innerSize * 0.4,
            height: innerSize * 0.4,
            backgroundColor: '#ffffff',
            borderRadius: isRound ? innerSize * 0.2 : 1,
            opacity: shineOpacity,
          },
        ]}
      />
    </>
  )
}

// ============ MAIN CHECKBOX COMPONENT ============

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  size = 'medium',
  variant: variantOverride,
}) => {
  const { themeInfo } = useTheme()
  const { colors, checkboxVariant: themeVariant, checkboxColors, checkboxAnimateGlow } = themeInfo
  const variant = variantOverride ?? themeVariant

  const cbColors = {
    frameBorder: checkboxColors?.frameBorder ?? colors.border,
    frameBorderActive: checkboxColors?.frameBorderActive ?? colors.gem,
    frameBackground: checkboxColors?.frameBackground ?? colors.background,
    frameBackgroundActive: checkboxColors?.frameBackgroundActive ?? `${colors.gem}15`,
    gem: checkboxColors?.gem ?? colors.gem,
  }

  const scale = useSharedValue(1)
  const glowOpacity = useSharedValue(checked ? 1 : 0)
  const progress = useSharedValue(checked ? 1 : 0)
  const shimmer = useSharedValue(0)

  React.useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: 200 })
    glowOpacity.value = withTiming(checked ? 1 : 0, { duration: 150 })

    if (checked && checkboxAnimateGlow) {
      shimmer.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    } else {
      shimmer.value = withTiming(0, { duration: 200 })
    }
  }, [checked, checkboxAnimateGlow])

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  const handlePressIn = () => {
    scale.value = withTiming(0.9, { duration: 50 })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 80 })
  }

  const handlePress = () => {
    if (disabled) return

    const newChecked = !checked
    progress.value = withTiming(newChecked ? 1 : 0, { duration: 150 })
    glowOpacity.value = withTiming(newChecked ? 1 : 0, { duration: 120 })

    runOnJS(triggerHaptic)()
    onCheckedChange(newChecked)
  }

  const [animValues, setAnimValues] = React.useState({
    borderColor: cbColors.frameBorder,
    backgroundColor: cbColors.frameBackground,
    scaleValue: 1,
    glowOpacityValue: checked ? 1 : 0,
    shimmerValue: 0,
  })

  // Usar useAnimatedReaction para detectar cambios reales y evitar ciclo infinito
  useAnimatedReaction(
    () => ({
      progress: Math.round(progress.value * 100) / 100,
      scale: Math.round(scale.value * 100) / 100,
      glowOpacity: Math.round(glowOpacity.value * 100) / 100,
      shimmer: Math.round(shimmer.value * 100) / 100,
    }),
    (current, previous) => {
      // Solo actualizar si hay un cambio real (evita actualizaciones en cada frame)
      if (
        !previous ||
        current.progress !== previous.progress ||
        current.scale !== previous.scale ||
        current.glowOpacity !== previous.glowOpacity ||
        current.shimmer !== previous.shimmer
      ) {
        const borderColor = interpolateColor(
          progress.value,
          [0, 1],
          [cbColors.frameBorder, cbColors.frameBorderActive]
        )

        const backgroundColor = interpolateColor(
          progress.value,
          [0, 1],
          [cbColors.frameBackground, cbColors.frameBackgroundActive]
        )

        runOnJS(setAnimValues)({
          borderColor,
          backgroundColor,
          scaleValue: scale.value,
          glowOpacityValue: glowOpacity.value,
          shimmerValue: shimmer.value,
        })
      }
    },
    [cbColors]
  )

  const sizeConfig = getSizeConfig(size)

  const shapeProps: ShapeProps = {
    size: sizeConfig.shapeSize,
    innerSize: sizeConfig.innerSize,
    borderColor: animValues.borderColor,
    backgroundColor: animValues.backgroundColor,
    gemColor: cbColors.gem,
    glowOpacity: animValues.glowOpacityValue,
    shimmerValue: animValues.shimmerValue,
    scale: animValues.scaleValue,
  }

  const renderShape = () => {
    switch (variant) {
      case 'circle':
        return <CircleShape {...shapeProps} />
      case 'gothic':
        return <GothicShape {...shapeProps} />
      case 'gear':
        return <GearShape {...shapeProps} />
      case 'shield':
        return <ShieldShape {...shapeProps} />
      case 'star':
        return <StarShape {...shapeProps} />
      case 'diamond':
      default:
        return <DiamondShape {...shapeProps} />
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={(state) => [
        styles.container,
        {
          backgroundColor: state.pressed
            ? `${cbColors.gem}20`
            : 'hovered' in state && state.hovered
              ? `${cbColors.frameBorderActive}15`
              : 'transparent',
          borderRadius: 6,
          marginHorizontal: -8,
          paddingHorizontal: 8,
        },
        disabled && styles.disabled,
      ]}
    >
      <View
        style={[
          styles.shapeWrapper,
          {
            width: sizeConfig.wrapperSize,
            height: sizeConfig.wrapperSize,
          },
        ]}
      >
        {renderShape()}
      </View>

      {label ? (
        <CheckboxLabel fontSize={sizeConfig.fontSize} marginLeft="$3">
          {label}
        </CheckboxLabel>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 44,
  },
  disabled: {
    opacity: 0.5,
  },
  shapeWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shapeBase: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerGlow: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  innerGlow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 8,
  },
  shine: {
    position: 'absolute',
    top: '15%',
    left: '15%',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  gothicContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gothicSpike: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  gothicSpikeTop: {
    top: -8,
  },
  gothicSpikeBottom: {
    bottom: -8,
  },
  gearContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gearCoreOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldCoreOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  starSecondSquare: {
    position: 'absolute',
  },
  starCore: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
