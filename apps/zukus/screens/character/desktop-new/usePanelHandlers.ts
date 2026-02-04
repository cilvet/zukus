import { useRouter, useLocalSearchParams } from 'expo-router'
import { usePanelNavigation } from '../../../hooks'
import { getDetailTitle, useNavigateToDetail } from '../../../navigation'
import { useCharacterStore } from '../../../ui'
import type { ComputedEntity } from '@zukus/core'

/**
 * Centralizes all panel navigation handlers for the desktop character screen.
 */
export function usePanelHandlers() {
  const { id: characterId } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const navigateToDetail = useNavigateToDetail()
  const rest = useCharacterStore((state) => state.rest)

  const {
    currentPanel,
    isPanelOpen,
    canGoBack,
    openPanel,
    closePanel,
    goBack,
  } = usePanelNavigation('character')

  // Panel handlers
  const handleAbilityPress = (abilityKey: string) => {
    openPanel(`ability/${abilityKey}`, getDetailTitle('ability', abilityKey))
  }

  const handleSavingThrowPress = (savingThrowKey: string) => {
    openPanel(`savingThrow/${savingThrowKey}`, getDetailTitle('savingThrow', savingThrowKey))
  }

  const handleArmorClassPress = () => {
    openPanel('armorClass/armorClass', getDetailTitle('armorClass', 'armorClass'))
  }

  const handleInitiativePress = () => {
    openPanel('initiative/initiative', getDetailTitle('initiative', 'initiative'))
  }

  const handleBABPress = () => {
    openPanel('bab/bab', getDetailTitle('bab', 'bab'))
  }

  const handleEquipmentPress = (itemId: string, itemName: string) => {
    openPanel(`equipment/${itemId}`, itemName)
  }

  const handleInventoryItemPress = (instanceId: string, itemName: string) => {
    openPanel(`inventoryItem/${instanceId}`, itemName)
  }

  const handleAttackPress = (attack: { weaponUniqueId?: string; name: string }) => {
    const id = attack.weaponUniqueId ?? attack.name
    openPanel(`attack/${id}`, attack.name)
  }

  const handleEntityPress = (entity: ComputedEntity) => {
    openPanel(`computedEntity/${entity.id}`, entity.name)
  }

  const handleHitPointsPress = () => {
    navigateToDetail('hitPoints', 'hitPoints')
  }

  const handleChatPress = () => {
    navigateToDetail('chat', 'chat')
  }

  const handleEditPress = () => {
    if (characterId) {
      router.push(`/characters/edit/${characterId}`)
    }
  }

  const handleRestPress = () => {
    const result = rest()
    if (!result.success) {
      console.warn('Failed to rest:', result.error)
    }
  }

  const handleOpenItemBrowser = () => {
    openPanel('itemBrowser/browse', 'Buscar Items')
  }

  const handleOpenCurrencyEdit = () => {
    openPanel('currencyEdit/edit', 'Monedas')
  }

  return {
    // Panel state
    currentPanel,
    isPanelOpen,
    canGoBack,
    openPanel,
    closePanel,
    goBack,
    // Handlers
    handleAbilityPress,
    handleSavingThrowPress,
    handleArmorClassPress,
    handleInitiativePress,
    handleBABPress,
    handleEquipmentPress,
    handleInventoryItemPress,
    handleAttackPress,
    handleEntityPress,
    handleHitPointsPress,
    handleChatPress,
    handleEditPress,
    handleRestPress,
    handleOpenItemBrowser,
    handleOpenCurrencyEdit,
  }
}
