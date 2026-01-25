import { useIsDesktop } from '../../navigation'
import { EditCharacterScreenDesktop } from './EditCharacterScreenDesktop'
import { EditCharacterScreenMobile } from './EditCharacterScreenMobile'

export function EditCharacterScreen() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <EditCharacterScreenDesktop /> : <EditCharacterScreenMobile />
}
