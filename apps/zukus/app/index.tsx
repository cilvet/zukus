import { Redirect } from 'expo-router'
import { Platform, useWindowDimensions } from 'react-native'

const DESKTOP_BREAKPOINT = 768

export default function Index() {
  const { width } = useWindowDimensions()
  const isWebDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT

  // Desktop web: redirigir a personajes (navegacion via Topbar)
  if (isWebDesktop) {
    return <Redirect href="/characters" />
  }

  // Mobile: redirigir a /home
  return <Redirect href="/home" />
}
