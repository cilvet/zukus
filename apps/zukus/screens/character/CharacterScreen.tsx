import { useIsDesktop } from '../../navigation'
import { CharacterScreenDesktop } from './CharacterScreenDesktop'
import { CharacterScreenMobile } from './CharacterScreenMobile'

export function CharacterScreen() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <CharacterScreenDesktop /> : <CharacterScreenMobile />
}
