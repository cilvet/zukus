import { useEffect } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { EntityTypesScreen } from '../../../../screens/compendiums'
import { useCompendiumActions, useCurrentCompendiumId } from '../../../../ui/stores'

export default function CompendiumEntityTypesRoute() {
  const { compendiumId } = useLocalSearchParams<{ compendiumId: string }>()
  const currentCompendiumId = useCurrentCompendiumId()
  const { selectCompendium } = useCompendiumActions()

  // Si navegamos directamente a esta ruta, cargar el compendio
  useEffect(() => {
    if (compendiumId && compendiumId !== currentCompendiumId) {
      selectCompendium(compendiumId)
    }
  }, [compendiumId, currentCompendiumId, selectCompendium])

  return <EntityTypesScreen />
}
