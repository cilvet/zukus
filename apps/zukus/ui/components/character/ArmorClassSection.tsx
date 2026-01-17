import { useCharacterArmorClass } from '../../stores/characterStore'
import { useNavigateToDetail } from '../../../navigation'
import { ArmorClassCard } from './ArmorClassCard'

/**
 * Sección de Armor Class - 3 mini-cards horizontales.
 * Usa selector de Zustand para re-render granular.
 * Compartido entre mobile y desktop.
 */
export function ArmorClassSection() {
  const armorClass = useCharacterArmorClass()
  const navigateToDetail = useNavigateToDetail()

  if (!armorClass) {
    return null
  }

  const handlePress = () => {
    navigateToDetail('armorClass', 'armorClass')
  }

  return (
    <ArmorClassCard
      totalAC={armorClass.totalAc.totalValue}
      touchAC={armorClass.touchAc.totalValue}
      flatFootedAC={armorClass.flatFootedAc.totalValue}
      onPress={handlePress}
    />
  )
}
