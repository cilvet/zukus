import { useState, useEffect, useRef, useCallback } from 'react'
import { Pressable, ScrollView, Platform } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { useTheme } from '../../ui'
import {
  useCompendiums,
  useCurrentCompendiumId,
  useCurrentEntityType,
  useEntityTypes,
  useCompendiumActions,
} from '../../ui/stores'

type ExpandedState = Record<string, boolean>

const MIN_SIDEBAR_WIDTH = 140
const DEFAULT_SIDEBAR_WIDTH = 240
const RESIZE_HANDLE_WIDTH = 8

/**
 * Sidebar de navegacion para compendios en desktop.
 * Muestra un arbol de compendios > tipos de entidad.
 * Resizable arrastrando el borde derecho.
 */
export function CompendiumSidebar() {
  'use no memo'

  const { themeColors, themeInfo } = useTheme()
  const compendiums = useCompendiums()
  const currentCompendiumId = useCurrentCompendiumId()
  const currentEntityType = useCurrentEntityType()
  const entityTypes = useEntityTypes()
  const { loadCompendiums, selectCompendium, selectEntityType } = useCompendiumActions()

  // Estado de expansion de cada compendio
  const [expanded, setExpanded] = useState<ExpandedState>({})

  // Resize state
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(DEFAULT_SIDEBAR_WIDTH)

  // Cargar compendios al montar
  useEffect(() => {
    loadCompendiums()
  }, [loadCompendiums])

  // Auto-expandir el compendio seleccionado
  useEffect(() => {
    if (currentCompendiumId && !expanded[currentCompendiumId]) {
      setExpanded((prev) => ({ ...prev, [currentCompendiumId]: true }))
    }
  }, [currentCompendiumId, expanded])

  const toggleExpanded = async (compendiumId: string) => {
    const isExpanding = !expanded[compendiumId]
    setExpanded((prev) => ({ ...prev, [compendiumId]: isExpanding }))

    // Si estamos expandiendo y no es el compendio actual, cargarlo
    if (isExpanding && compendiumId !== currentCompendiumId) {
      await selectCompendium(compendiumId)
    }
  }

  const handleEntityTypePress = async (entityType: string) => {
    await selectEntityType(entityType)
  }

  // Resize handlers (web only)
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = sidebarWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current
      const newWidth = Math.max(MIN_SIDEBAR_WIDTH, startWidthRef.current + delta)
      setSidebarWidth(newWidth)
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

  const primaryColor = themeInfo.colors.primary
  const isWeb = Platform.OS === 'web'

  return (
    <>
      {/* Overlay to capture mouse events during resize */}
      {isResizing && isWeb && (
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
      <YStack
        width={sidebarWidth}
        height="100%"
        backgroundColor="$uiBackgroundColor"
        borderRightWidth={1}
        borderRightColor="$borderColor"
        position="relative"
      >
        {/* Header */}
        <XStack
          paddingHorizontal={16}
          paddingVertical={12}
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Text fontSize={13} fontWeight="600" color="$placeholderColor" textTransform="uppercase">
            Compendios
          </Text>
        </XStack>

        {/* Tree */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <YStack padding={8} gap={2}>
            {compendiums.map((compendium) => {
              const isExpanded = expanded[compendium.id] ?? false
              const isSelected = compendium.id === currentCompendiumId
              const typesToShow = isSelected ? entityTypes : []

              return (
                <YStack key={compendium.id}>
                  {/* Compendium row */}
                  <Pressable onPress={() => toggleExpanded(compendium.id)}>
                    {({ pressed }) => (
                      <XStack
                        alignItems="center"
                        gap={8}
                        paddingHorizontal={12}
                        paddingVertical={10}
                        borderRadius={6}
                        backgroundColor={pressed ? '$backgroundHover' : 'transparent'}
                        opacity={pressed ? 0.8 : 1}
                      >
                        <FontAwesome6
                          name={isExpanded ? 'chevron-down' : 'chevron-right'}
                          size={10}
                          color={themeColors.placeholderColor}
                        />
                        <FontAwesome6
                          name="book"
                          size={14}
                          color={isSelected ? primaryColor : themeColors.color}
                        />
                        <Text
                          fontSize={14}
                          fontWeight={isSelected ? '600' : '400'}
                          color={isSelected ? '$accentColor' : '$color'}
                          flex={1}
                          numberOfLines={1}
                        >
                          {compendium.name}
                        </Text>
                      </XStack>
                    )}
                  </Pressable>

                  {/* Entity types (children) */}
                  {isExpanded && typesToShow.length > 0 && (
                    <YStack paddingLeft={20} gap={1}>
                      {typesToShow.map((type) => {
                        const isTypeSelected = type.typeName === currentEntityType

                        return (
                          <Pressable
                            key={type.typeName}
                            onPress={() => handleEntityTypePress(type.typeName)}
                          >
                            {({ pressed }) => (
                              <XStack
                                alignItems="center"
                                gap={8}
                                paddingHorizontal={12}
                                paddingVertical={8}
                                borderRadius={6}
                                backgroundColor={
                                  isTypeSelected
                                    ? '$accentBackground'
                                    : pressed
                                      ? '$backgroundHover'
                                      : 'transparent'
                                }
                                opacity={pressed ? 0.8 : 1}
                              >
                                <FontAwesome6
                                  name="folder"
                                  size={12}
                                  color={
                                    isTypeSelected ? primaryColor : themeColors.placeholderColor
                                  }
                                />
                                <Text
                                  fontSize={13}
                                  fontWeight={isTypeSelected ? '600' : '400'}
                                  color={isTypeSelected ? '$accentColor' : '$color'}
                                  flex={1}
                                  numberOfLines={1}
                                >
                                  {type.displayName}
                                </Text>
                                <Text fontSize={11} color="$placeholderColor">
                                  {type.count}
                                </Text>
                              </XStack>
                            )}
                          </Pressable>
                        )
                      })}
                    </YStack>
                  )}
                </YStack>
              )
            })}
          </YStack>
        </ScrollView>

        {/* Resize handle (web only) */}
        {isWeb && <SidebarResizeHandle onResizeStart={handleResizeStart} />}
      </YStack>
    </>
  )
}

function SidebarResizeHandle({ onResizeStart }: { onResizeStart: (e: React.MouseEvent) => void }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseDown={onResizeStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: -RESIZE_HANDLE_WIDTH / 2,
        width: RESIZE_HANDLE_WIDTH,
        cursor: 'col-resize',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
