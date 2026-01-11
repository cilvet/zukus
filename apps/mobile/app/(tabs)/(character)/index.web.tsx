import { useWindowDimensions } from 'react-native'
import { CharacterScreen, CharacterScreenDesktop } from '../../../screens'

const DESKTOP_BREAKPOINT = 768

export default function CharacterScreenWeb() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= DESKTOP_BREAKPOINT

  if (isDesktop) {
    return <CharacterScreenDesktop />
  }

  return <CharacterScreen />
}
