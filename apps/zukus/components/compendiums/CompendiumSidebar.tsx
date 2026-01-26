import { useState, useEffect } from 'react'
import { Pressable, ScrollView } from 'react-native'
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

/**
 * Sidebar de navegacion para compendios en desktop.
 * Muestra un arbol de compendios > tipos de entidad.
 */
export function CompendiumSidebar() {
  const { themeColors, themeInfo } = useTheme()
  const compendiums = useCompendiums()
  const currentCompendiumId = useCurrentCompendiumId()
  const currentEntityType = useCurrentEntityType()
  const entityTypes = useEntityTypes()
  const { loadCompendiums, selectCompendium, selectEntityType } = useCompendiumActions()

  // Estado de expansion de cada compendio
  const [expanded, setExpanded] = useState<ExpandedState>({})

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

  const primaryColor = themeInfo.colors.primary

  return (
    <YStack
      width={240}
      height="100%"
      backgroundColor="$uiBackgroundColor"
      borderRightWidth={1}
      borderRightColor="$borderColor"
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
    </YStack>
  )
}
