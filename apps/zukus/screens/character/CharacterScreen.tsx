import { useWindowDimensions, Platform } from 'react-native'
import { useIsDesktop } from '../../navigation'
import { CharacterScreenDesktop } from './CharacterScreenDesktop'
import { CharacterScreenDesktopNew } from './CharacterScreenDesktopNew'
import { CharacterScreenMobile } from './CharacterScreenMobile'

// Large desktop breakpoint (for new DnD Beyond-style layout)
const LARGE_DESKTOP_BREAKPOINT = 1200

export function CharacterScreen() {
  const isDesktop = useIsDesktop()
  const { width } = useWindowDimensions()

  // Use new layout only on large desktop screens
  const isLargeDesktop = Platform.OS === 'web' && width >= LARGE_DESKTOP_BREAKPOINT

  if (!isDesktop) {
    return <CharacterScreenMobile />
  }

  // Large desktop: new DnD Beyond-style layout
  // Tablet/small desktop: original columns layout
  return isLargeDesktop ? <CharacterScreenDesktopNew /> : <CharacterScreenDesktop />
}
