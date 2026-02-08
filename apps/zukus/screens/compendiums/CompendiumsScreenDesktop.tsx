import { useState, useEffect, useRef } from 'react'
import { View, Pressable, ScrollView } from 'react-native'
import { YStack, XStack, Text, Spinner } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import type { StandardEntity } from '@zukus/core'
import {
  CompendiumSidebar,
  CompendiumBreadcrumbs,
  EntityTypeCard,
  EntityGridCard,
  LayoutToggle,
  CompendiumEntityDetail,
} from '../../components/compendiums'
import { EntitySelectionView } from '../../components/entitySelection/EntitySelectionView'
import { useTheme } from '../../ui'
import {
  useCurrentCompendiumId,
  useCurrentEntityType,
  useEntityTypes,
  useEntities,
  useViewMode,
  useIsLoading,
  useIsLoadingEntities,
  useCompendiumError,
  useSelectedEntityId,
  useCompendiumActions,
} from '../../ui/stores'

const MIN_DETAIL_WIDTH = 200
const DEFAULT_DETAIL_WIDTH = 380
const MIN_LIST_WIDTH = 250

/**
 * Pantalla principal de compendios para desktop.
 * Layout de 3 columnas: Sidebar | Lista (flex) | Detalle (resizable)
 * El panel de detalle siempre esta reservado cuando hay entidades visibles.
 */
export function CompendiumsScreenDesktop() {
  'use no memo'

  const { themeColors, themeInfo } = useTheme()

  // State
  const compendiumId = useCurrentCompendiumId()
  const entityType = useCurrentEntityType()
  const entityTypes = useEntityTypes()
  const entities = useEntities()
  const viewMode = useViewMode()
  const isLoading = useIsLoading()
  const isLoadingEntities = useIsLoadingEntities()
  const error = useCompendiumError()
  const selectedEntityId = useSelectedEntityId()

  // Actions
  const { selectEntityType, selectEntity, clearSelectedEntity, toggleViewMode } = useCompendiumActions()

  // Detail panel resize state
  const [detailWidth, setDetailWidth] = useState(DEFAULT_DETAIL_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(DEFAULT_DETAIL_WIDTH)

  const handleEntityTypePress = async (typeName: string) => {
    await selectEntityType(typeName)
  }

  const handleEntityPress = (entity: StandardEntity) => {
    selectEntity(entity.id, entity.name)
  }

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = detailWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      // Dragging left = increasing width (handle is on left edge of detail panel)
      const delta = startXRef.current - e.clientX
      const newWidth = Math.max(MIN_DETAIL_WIDTH, startWidthRef.current + delta)
      setDetailWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  const accentColor = themeInfo.colors.accent

  // Determinar que contenido mostrar
  const showEntities = !!entityType
  const showEntityTypes = !!compendiumId && !entityType
  const showWelcome = !compendiumId

  // El panel de detalle se muestra cuando hay entidades visibles (browse o grid)
  const showDetailPanel = showEntities && !isLoadingEntities

  return (
    <XStack flex={1}>
      {/* Left Sidebar - navegacion */}
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

          <XStack gap={8} alignItems="center">
            {/* View toggle - only when showing entities in grid mode */}
            {showEntities && viewMode === 'grid' && (
              <LayoutToggle viewMode={viewMode} onToggle={toggleViewMode} />
            )}
          </XStack>
        </XStack>

        {/* Content area: Lista | Detalle */}
        <XStack flex={1}>
          {/* Lista / contenido principal */}
          <View style={{ flex: 1, minWidth: MIN_LIST_WIDTH }}>
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
            ) : isLoadingEntities ? (
              <LoadingState />
            ) : viewMode === 'grid' ? (
              <GridContent
                entities={entities}
                onEntityPress={handleEntityPress}
              />
            ) : (
              <BrowseContent
                entities={entities}
                onEntityPress={handleEntityPress}
              />
            )}
          </View>

          {/* Panel de detalle - siempre reservado cuando hay entidades */}
          {showDetailPanel && (
            <XStack width={detailWidth} height="100%">
              {/* Resize handle */}
              <DetailResizeHandle onResizeStart={handleResizeStart} />

              {/* Contenido del detalle */}
              <YStack
                flex={1}
                borderLeftWidth={1}
                borderLeftColor="$borderColor"
                backgroundColor="$uiBackgroundColor"
              >
                {selectedEntityId ? (
                  <YStack flex={1}>
                    {/* Header con boton cerrar */}
                    <XStack
                      paddingHorizontal={16}
                      paddingVertical={12}
                      borderBottomWidth={1}
                      borderBottomColor="$borderColor"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Text fontSize={13} fontWeight="600" color="$placeholderColor" textTransform="uppercase">
                        Detalle
                      </Text>
                      <Pressable onPress={clearSelectedEntity} hitSlop={8}>
                        {({ pressed }) => (
                          <FontAwesome6
                            name="xmark"
                            size={14}
                            color={themeColors.placeholderColor}
                            style={{ opacity: pressed ? 0.5 : 1 }}
                          />
                        )}
                      </Pressable>
                    </XStack>
                    <CompendiumEntityDetail entityId={selectedEntityId} />
                  </YStack>
                ) : (
                  <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
                    <FontAwesome6
                      name="book-open"
                      size={32}
                      color={themeColors.placeholderColor}
                      style={{ opacity: 0.3, marginBottom: 12 }}
                    />
                    <Text color="$placeholderColor" textAlign="center" fontSize={13}>
                      Selecciona una entidad para ver su detalle
                    </Text>
                  </YStack>
                )}
              </YStack>
            </XStack>
          )}
        </XStack>
      </YStack>

      {/* Overlay para capturar mouse durante resize */}
      {isResizing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            cursor: 'col-resize',
          }}
        />
      )}
    </XStack>
  )
}

// =============================================================================
// Sub-components
// =============================================================================

const RESIZE_HANDLE_WIDTH = 8

function DetailResizeHandle({ onResizeStart }: { onResizeStart: (e: React.MouseEvent) => void }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseDown={onResizeStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: RESIZE_HANDLE_WIDTH,
        cursor: 'col-resize',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 3,
          height: 40,
          borderRadius: 2,
          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
          transition: 'background-color 0.15s ease',
        }}
      />
    </div>
  )
}

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

type BrowseContentProps = {
  entities: StandardEntity[]
  onEntityPress: (entity: StandardEntity) => void
}

function BrowseContent({ entities, onEntityPress }: BrowseContentProps) {
  return (
    <YStack flex={1}>
      <EntitySelectionView
        entities={entities}
        modeConfig={{ mode: 'browse' }}
        onEntityPress={onEntityPress}
        resultLabelSingular="entidad"
        resultLabelPlural="entidades"
      />
    </YStack>
  )
}

type GridContentProps = {
  entities: StandardEntity[]
  onEntityPress: (entity: StandardEntity) => void
}

function GridContent({ entities, onEntityPress }: GridContentProps) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 32, paddingHorizontal: 48 }}
    >
      <YStack gap={24}>
        {entities.length === 0 ? (
          <EmptyState message="No hay entidades" />
        ) : (
          <XStack flexWrap="wrap" gap={16}>
            {entities.map((entity) => (
              <EntityGridCard
                key={entity.id}
                entity={entity}
                onPress={() => onEntityPress(entity)}
              />
            ))}
          </XStack>
        )}
      </YStack>
    </ScrollView>
  )
}
