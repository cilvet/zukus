import { View, ScrollView } from 'react-native'
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
import { useTheme } from '../../ui'
import {
  useCurrentCompendiumId,
  useCurrentEntityType,
  useEntityTypes,
  useEntities,
  useSearchQuery,
  useViewMode,
  useIsLoading,
  useIsLoadingEntities,
  useCompendiumError,
  useSelectedEntityId,
  useCompendiumActions,
} from '../../ui/stores'
import { SearchBar } from './SearchBar'

/**
 * Pantalla principal de compendios para desktop.
 * Layout de 2 columnas: Sidebar | Content
 * El contenido cambia segun la navegacion (tipos, entidades, o detalle)
 */
export function CompendiumsScreenDesktop() {
  const { themeColors, themeInfo } = useTheme()

  // State
  const compendiumId = useCurrentCompendiumId()
  const entityType = useCurrentEntityType()
  const entityTypes = useEntityTypes()
  const entities = useEntities()
  const searchQuery = useSearchQuery()
  const viewMode = useViewMode()
  const isLoading = useIsLoading()
  const isLoadingEntities = useIsLoadingEntities()
  const error = useCompendiumError()
  const selectedEntityId = useSelectedEntityId()

  // Actions
  const { selectEntityType, selectEntity, setSearchQuery, toggleViewMode } = useCompendiumActions()

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
    selectEntity(entity.id, entity.name)
  }

  const primaryColor = themeInfo.colors.primary

  // Determinar que contenido mostrar
  const showEntityDetail = !!selectedEntityId
  const showEntities = !!entityType && !showEntityDetail
  const showEntityTypes = !!compendiumId && !entityType
  const showWelcome = !compendiumId

  return (
    <XStack flex={1}>
      {/* Left Sidebar */}
      <CompendiumSidebar />

      {/* Main Content Area */}
      <YStack flex={1} backgroundColor={themeColors.background}>
        {/* Breadcrumbs */}
        <XStack
          paddingHorizontal={32}
          paddingVertical={16}
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
          alignItems="center"
          justifyContent="space-between"
        >
          <CompendiumBreadcrumbs />

          {/* View toggle - only when showing entities list */}
          {showEntities && (
            <LayoutToggle viewMode={viewMode} onToggle={toggleViewMode} />
          )}
        </XStack>

        {/* Content */}
        <View style={{ flex: 1 }}>
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : showWelcome ? (
            <EmptyState message="Selecciona un compendio del panel izquierdo para explorar su contenido" />
          ) : showEntityTypes ? (
            <EntityTypesContent
              entityTypes={entityTypes}
              onEntityTypePress={handleEntityTypePress}
            />
          ) : showEntityDetail ? (
            <EntityDetailContent entityId={selectedEntityId} />
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
    </XStack>
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
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 32, paddingHorizontal: 48 }}
    >
      <YStack gap={16} maxWidth={600}>
        <Text fontSize={14} color="$placeholderColor">
          Selecciona un tipo de entidad para ver su contenido
        </Text>

        <YStack gap={12}>
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
    </ScrollView>
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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 32, paddingHorizontal: 48 }}
      >
        <YStack gap={24}>
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
      </ScrollView>
    )
  }

  // List view
  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={entities}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 32 }}>
            <EntityListItem
              entity={item}
              onPress={() => onEntityPress(item)}
              primaryColor={primaryColor}
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <YStack padding={32} paddingBottom={16}>
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

type EntityDetailContentProps = {
  entityId: string
}

function EntityDetailContent({ entityId }: EntityDetailContentProps) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 32, paddingHorizontal: 48 }}
    >
      <YStack maxWidth={700}>
        <CompendiumEntityDetail entityId={entityId} />
      </YStack>
    </ScrollView>
  )
}
