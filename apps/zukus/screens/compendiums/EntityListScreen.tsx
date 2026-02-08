import { View } from 'react-native'
import { YStack, XStack, Text, Spinner } from 'tamagui'
import type { StandardEntity } from '@zukus/core'
import { SafeAreaBottomSpacer, SidePanel } from '../../components/layout'
import { CompendiumEntityDetail } from '../../components/compendiums'
import { EntitySelectionView } from '../../components/entitySelection/EntitySelectionView'
import {
  useEntities,
  useCurrentEntityTypeName,
  useIsLoadingEntities,
  useCompendiumError,
} from '../../ui/stores'
import { useTheme } from '../../ui'
import { useIsDesktop, useNavigateToDetail } from '../../navigation'
import { usePanelNavigation } from '../../hooks'

export function EntityListScreen() {
  'use no memo'

  const { themeColors } = useTheme()
  const isDesktop = useIsDesktop()
  const navigateToDetail = useNavigateToDetail('compendiums')
  const { currentPanel, isPanelOpen, closePanel } = usePanelNavigation('compendiums')

  const entities = useEntities()
  const entityTypeName = useCurrentEntityTypeName()
  const isLoading = useIsLoadingEntities()
  const error = useCompendiumError()

  const backgroundColor = themeColors.background

  const handleEntityPress = (entity: StandardEntity) => {
    navigateToDetail('compendiumEntity', entity.id, entity.name)
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor }}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color="$accentColor" />
        </YStack>
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor }}>
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
          <Text color="$color" textAlign="center">
            {error}
          </Text>
        </YStack>
      </View>
    )
  }

  // Extraer entityId del panel path (formato: "compendiumEntity/entityId")
  const panelEntityId = currentPanel?.path?.split('/')[1] || null

  const listContent = (
    <View style={{ flex: 1, backgroundColor }}>
      {isDesktop && (
        <YStack paddingHorizontal={16} paddingTop={32} paddingBottom={8} gap={4}>
          <Text fontSize={24} fontWeight="700" color="$color">
            {entityTypeName}
          </Text>
        </YStack>
      )}
      <EntitySelectionView
        entities={entities}
        modeConfig={{ mode: 'browse' }}
        onEntityPress={handleEntityPress}
        resultLabelSingular="entidad"
        resultLabelPlural="entidades"
      />
      {!isDesktop && <SafeAreaBottomSpacer />}
    </View>
  )

  // Desktop con SidePanel
  if (isDesktop) {
    return (
      <XStack flex={1}>
        {listContent}
        <SidePanel
          isOpen={isPanelOpen && !!panelEntityId}
          title={currentPanel?.title || 'Detalle'}
          onClose={closePanel}
        >
          {panelEntityId && <CompendiumEntityDetail entityId={panelEntityId} />}
        </SidePanel>
      </XStack>
    )
  }

  return listContent
}
