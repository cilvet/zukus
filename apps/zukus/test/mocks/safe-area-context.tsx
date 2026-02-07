/**
 * Minimal react-native-safe-area-context mock.
 */
import React from 'react'

export function SafeAreaProvider({ children }: any) {
  return <>{children}</>
}

export function SafeAreaView({ children }: any) {
  return <div>{children}</div>
}

export function useSafeAreaInsets() {
  return { top: 0, right: 0, bottom: 0, left: 0 }
}

export function useSafeAreaFrame() {
  return { x: 0, y: 0, width: 390, height: 844 }
}
