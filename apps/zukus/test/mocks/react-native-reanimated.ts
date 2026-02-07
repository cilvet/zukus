/**
 * Minimal react-native-reanimated mock.
 */
export function useSharedValue(initial: any) {
  return { value: initial }
}

export function useAnimatedStyle(fn: () => any) {
  return fn()
}

export function withTiming(value: any) {
  return value
}

export function withSpring(value: any) {
  return value
}

export function withDelay(_delay: number, value: any) {
  return value
}

export function withSequence(...values: any[]) {
  return values[values.length - 1]
}

export function withRepeat(value: any) {
  return value
}

export function runOnJS(fn: Function) {
  return fn
}

export function useAnimatedRef() {
  return { current: null }
}

export function useDerivedValue(fn: () => any) {
  return { value: fn() }
}

export function useAnimatedReaction(
  _prepare: () => any,
  _react: (current: any, previous: any) => void,
  _deps?: any[]
) {}

export function interpolate(value: number, inputRange: number[], outputRange: number[]) {
  return value
}

export function interpolateColor(_value: number, _inputRange: number[], _outputRange: string[]) {
  return _outputRange[0] ?? 'transparent'
}

export const Easing = {
  inOut: (fn: any) => fn,
  ease: 0,
  linear: 0,
}

export function Extrapolation() {}
Extrapolation.CLAMP = 'clamp'

export default {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  runOnJS,
  useAnimatedRef,
  useDerivedValue,
  useAnimatedReaction,
  interpolate,
  interpolateColor,
  Easing,
  Extrapolation,
  createAnimatedComponent: (Component: any) => Component,
  View: 'div',
  Text: 'span',
  ScrollView: 'div',
}
