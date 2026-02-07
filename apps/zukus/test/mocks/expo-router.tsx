/**
 * Minimal expo-router mock.
 */
import React from 'react'

export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    back: () => {},
    canGoBack: () => false,
    navigate: () => {},
  }
}

export function useLocalSearchParams() {
  return {}
}

export function useSegments() {
  return []
}

export function usePathname() {
  return '/'
}

export function Link({ children, ...props }: any) {
  return <a {...props}>{children}</a>
}

export function Stack() {
  return null
}

Stack.Screen = () => null
