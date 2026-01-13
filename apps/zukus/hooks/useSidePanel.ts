import { useCallback, useState } from 'react'

export type SidePanelContent = {
  type: string
  data?: Record<string, unknown>
}

/**
 * Estado mínimo para el SidePanel (solo web).
 *
 * Nota: por ahora es estado local (no URL). Si más adelante queremos deep-linking
 * o back/forward del navegador, lo conectamos con `usePanelNavigation`.
 */
export function useSidePanel() {
  const [currentContent, setCurrentContent] = useState<SidePanelContent | null>(null)

  const openPanel = useCallback((content: SidePanelContent) => {
    setCurrentContent(content)
  }, [])

  const closePanel = useCallback(() => {
    setCurrentContent(null)
  }, [])

  return {
    isOpen: currentContent !== null,
    currentContent,
    openPanel,
    closePanel,
  }
}

