import { useEffect } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { useIsDesktop } from '../../../../navigation'
import { EntityTypesScreen, CompendiumsScreenDesktop } from '../../../../screens/compendiums'
import { useCompendiumActions, useCurrentCompendiumId } from '../../../../ui/stores'

export default function CompendiumEntityTypesRoute() {
  const { compendiumId } = useLocalSearchParams<{ compendiumId: string }>()
  const currentCompendiumId = useCurrentCompendiumId()
  const { selectCompendium } = useCompendiumActions()
  const isDesktop = useIsDesktop()

  // Si navegamos directamente a esta ruta, cargar el compendio
  useEffect(() => {
    if (compendiumId && compendiumId !== currentCompendiumId) {
      selectCompendium(compendiumId)
    }
  }, [compendiumId, currentCompendiumId, selectCompendium])

  // Desktop: layout unificado de 3 columnas
  // Mobile: pantalla de tipos de entidad
  return isDesktop ? <CompendiumsScreenDesktop /> : <EntityTypesScreen />
}
