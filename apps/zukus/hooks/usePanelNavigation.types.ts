export type PanelState = {
  id: string
  type: string
  name?: string
}

export type PanelNavigationResult = {
  currentPanel: PanelState | null
  isPanelOpen: boolean
  canGoBack: boolean
  openPanel: (id: string, type: string, name?: string) => void
  closePanel: () => void
  goBack: () => void
}
