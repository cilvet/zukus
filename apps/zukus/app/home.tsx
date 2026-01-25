import { Platform, useWindowDimensions } from 'react-native'
import { Redirect } from 'expo-router'
import { HomeScreen } from '../screens'

const DESKTOP_BREAKPOINT = 768

export default function Home() {
  const { width } = useWindowDimensions()
  const isWebDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT

  // Desktop web: redirigir a personajes
  if (isWebDesktop) {
    return <Redirect href="/characters" />
  }

  // Mobile: mostrar HomeScreen
  return <HomeScreen />
}
