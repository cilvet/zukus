import { useEffect, useRef } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { useIsDesktop } from '../../../../../navigation'
import { EntityListScreen, CompendiumsScreenDesktop } from '../../../../../screens/compendiums'
import { useCompendiumBrowserStore } from '../../../../../ui/stores'

export default function EntityListRoute() {
  const { compendiumId, entityType } = useLocalSearchParams<{
    compendiumId: string
    entityType: string
  }>()
  const isDesktop = useIsDesktop()

  const selectCompendium = useCompendiumBrowserStore((s) => s.selectCompendium)
  const selectEntityType = useCompendiumBrowserStore((s) => s.selectEntityType)
  const loadedRef = useRef(false)

  // Cargar datos solo una vez al montar o si cambian los params de URL
  useEffect(() => {
    const currentCompendiumId = useCompendiumBrowserStore.getState().currentCompendiumId
    const currentEntityType = useCompendiumBrowserStore.getState().currentEntityType

    async function loadData() {
      if (compendiumId && compendiumId !== currentCompendiumId) {
        await selectCompendium(compendiumId)
      }
      if (entityType && entityType !== currentEntityType) {
        await selectEntityType(entityType)
      }
    }

    if (!loadedRef.current) {
      loadedRef.current = true
      loadData()
    }
  }, [compendiumId, entityType, selectCompendium, selectEntityType])

  // Desktop: layout unificado de 3 columnas
  // Mobile: pantalla de lista de entidades
  return isDesktop ? <CompendiumsScreenDesktop /> : <EntityListScreen />
}
