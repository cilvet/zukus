/**
 * Minimal react-native-gesture-handler mock.
 */
import React from 'react'

export const GestureHandlerRootView = ({ children }: any) => <>{children}</>
export const GestureDetector = ({ children }: any) => <>{children}</>
export function Gesture() {}
Gesture.Pan = () => ({
  onStart: () => Gesture.Pan(),
  onUpdate: () => Gesture.Pan(),
  onEnd: () => Gesture.Pan(),
})

export const PanGestureHandler = ({ children }: any) => <>{children}</>
export const TapGestureHandler = ({ children }: any) => <>{children}</>
export const ScrollView = React.forwardRef<any, any>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>{children}</div>
))
export const FlatList = React.forwardRef<any, any>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>{children}</div>
))
