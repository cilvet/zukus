import { View, useWindowDimensions } from 'react-native'
import { YStack, XStack, Text, Spinner } from 'tamagui'
import { FlashList } from '@shopify/flash-list'
import type { StandardEntity } from '@zukus/core'
import {
  CompendiumSidebar,
  CompendiumBreadcrumbs,
  EntityTypeCard,
  EntityListItem,
  EntityGridCard,
  LayoutToggle,
  CompendiumEntityDetail,
} from '../../components/compendiums'
import { SidePanel, SidePanelContainer } from '../../components/layout'
import { useTheme } from '../../ui'
import { usePanelNavigation } from '../../hooks'
import {
  useCurrentCompendiumId,
  useCurrentCompendiumName,
  useCurrentEntityType,
  useCurrentEntityTypeName,
  useEntityTypes,
  useEntities,
  useSearchQuery,
  useViewMode,
  useIsLoading,
  useIsLoadingEntities,
  useCompendiumError,
  useCompendiumActions,
} from '../../ui/stores'
import { SearchBar } from './SearchBar'

/**
 * Pantalla principal de compendios para desktop.
 * Layout de 3 columnas: Sidebar | Content | SidePanel
 */
export function CompendiumsScreenDesktop() {
  const { themeColors, themeInfo } = useTheme()
  const { height } = useWindowDimensions()

  // State
  const compendiumId = useCurrentCompendiumId()
  const compendiumName = useCurrentCompendiumName()
  const entityType = useCurrentEntityType()
  const entityTypeName = useCurrentEntityTypeName()
  const entityTypes = useEntityTypes()
  const entities = useEntities()
  const searchQuery = useSearchQuery()
  const viewMode = useViewMode()
  const isLoading = useIsLoading()
  const isLoadingEntities = useIsLoadingEntities()
  const error = useCompendiumError()

  // Actions
  const { selectEntityType, setSearchQuery, toggleViewMode } = useCompendiumActions()

  // Panel navigation
  const { currentPanel, isPanelOpen, closePanel, openPanel } = usePanelNavigation('compendiums')

  // Extract entityId from panel path (format: "compendiumEntity/entityId")
  const panelEntityId = currentPanel?.path?.split('/')[1] || null

  // Filter entities by search
  const filteredEntities = searchQuery.trim()
    ? entities.filter((entity) => {
        const query = searchQuery.toLowerCase().trim()
        const nameMatch = entity.name.toLowerCase().includes(query)
        const descMatch = entity.description?.toLowerCase().includes(query)
        const tagsMatch = entity.tags?.some((tag) => tag.toLowerCase().includes(query))
        return nameMatch || descMatch || tagsMatch
      })
    : entities

  const handleEntityTypePress = async (typeName: string) => {
    await selectEntityType(typeName)
  }

  const handleEntityPress = (entity: StandardEntity) => {
    openPanel(`compendiumEntity/${entity.id}`, entity.name)
  }

  const primaryColor = themeInfo.colors.primary
  const contentHeight = height - 60 // Account for topbar

  return (
    <SidePanelContainer>
      <XStack flex={1}>
        {/* Left Sidebar */}
        <CompendiumSidebar />

        {/* Main Content Area */}
        <YStack flex={1} backgroundColor={themeColors.background}>
          {/* Breadcrumbs */}
          <XStack
            paddingHorizontal={24}
            paddingVertical={16}
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
            alignItems="center"
            justifyContent="space-between"
          >
            <CompendiumBreadcrumbs />

            {/* View toggle - only when showing entities */}
            {entityType && (
              <LayoutToggle viewMode={viewMode} onToggle={toggleViewMode} />
            )}
          </XStack>

          {/* Content */}
          <View style={{ flex: 1 }}>
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} />
            ) : !compendiumId ? (
              <EmptyState message="Selecciona un compendio del panel izquierdo para explorar su contenido" />
            ) : !entityType ? (
              <EntityTypesContent
                entityTypes={entityTypes}
                onEntityTypePress={handleEntityTypePress}
              />
            ) : isLoadingEntities ? (
              <LoadingState />
            ) : (
              <EntitiesContent
                entities={filteredEntities}
                viewMode={viewMode}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onEntityPress={handleEntityPress}
                primaryColor={primaryColor}
              />
            )}
          </View>
        </YStack>

        {/* Right SidePanel */}
        <SidePanel
          isOpen={isPanelOpen && !!panelEntityId}
          title={currentPanel?.title || 'Detalle'}
          onClose={closePanel}
        >
          {panelEntityId && <CompendiumEntityDetail entityId={panelEntityId} />}
        </SidePanel>
      </XStack>
    </SidePanelContainer>
  )
}

// =============================================================================
// Sub-components
// =============================================================================

function LoadingState() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center">
      <Spinner size="large" color="$accentColor" />
    </YStack>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
      <Text color="$color" textAlign="center">
        {message}
      </Text>
    </YStack>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
      <Text color="$placeholderColor" textAlign="center" fontSize={15}>
        {message}
      </Text>
    </YStack>
  )
}

type EntityTypesContentProps = {
  entityTypes: Array<{
    typeName: string
    displayName: string
    count: number
    description?: string
  }>
  onEntityTypePress: (typeName: string) => void
}

function EntityTypesContent({ entityTypes, onEntityTypePress }: EntityTypesContentProps) {
  if (entityTypes.length === 0) {
    return <EmptyState message="No hay tipos de entidad en este compendio" />
  }

  return (
    <YStack flex={1} padding={24} gap={16}>
      <Text fontSize={14} color="$placeholderColor">
        Selecciona un tipo de entidad para ver su contenido
      </Text>

      <YStack gap={12} maxWidth={600}>
        {entityTypes.map((entityType) => (
          <EntityTypeCard
            key={entityType.typeName}
            typeName={entityType.typeName}
            displayName={entityType.displayName}
            count={entityType.count}
            description={entityType.description}
            onPress={() => onEntityTypePress(entityType.typeName)}
          />
        ))}
      </YStack>
    </YStack>
  )
}

type EntitiesContentProps = {
  entities: StandardEntity[]
  viewMode: 'grid' | 'list'
  searchQuery: string
  onSearchChange: (query: string) => void
  onEntityPress: (entity: StandardEntity) => void
  primaryColor: string
}

function EntitiesContent({
  entities,
  viewMode,
  searchQuery,
  onSearchChange,
  onEntityPress,
  primaryColor,
}: EntitiesContentProps) {
  if (viewMode === 'grid') {
    return (
      <YStack flex={1} padding={24} gap={16}>
        <SearchBar value={searchQuery} onChangeText={onSearchChange} />

        {entities.length === 0 ? (
          <EmptyState
            message={searchQuery ? 'No se encontraron resultados' : 'No hay entidades'}
          />
        ) : (
          <XStack flexWrap="wrap" gap={16}>
            {entities.map((entity) => (
              <EntityGridCard
                key={entity.id}
                entity={entity}
                onPress={() => onEntityPress(entity)}
                primaryColor={primaryColor}
              />
            ))}
          </XStack>
        )}
      </YStack>
    )
  }

  // List view
  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={entities}
        renderItem={({ item }) => (
          <EntityListItem
            entity={item}
            onPress={() => onEntityPress(item)}
            primaryColor={primaryColor}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <YStack padding={24} paddingBottom={16}>
            <SearchBar value={searchQuery} onChangeText={onSearchChange} />
          </YStack>
        }
        ListEmptyComponent={
          <EmptyState
            message={searchQuery ? 'No se encontraron resultados' : 'No hay entidades'}
          />
        }
      />
    </View>
  )
}
