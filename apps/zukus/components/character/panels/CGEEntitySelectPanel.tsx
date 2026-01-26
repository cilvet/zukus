import { View, Pressable, TextInput, StyleSheet, Platform } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, XStack, Text } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { usePrimaryCGE, useTheme, useCharacterStore, useCompendiumContext } from '../../../ui'
import { usePanelNavigation } from '../../../hooks'
import type { StandardEntity } from '@zukus/core'

/**
 * Returns a label for entity level.
 */
function getLevelLabel(level: number): string {
  if (level === 0) return 'Nivel 0'
  return `Nivel ${level}`
}

/**
 * Mapping from class IDs to Spanish class names used in compendium.
 */
const CLASS_ID_TO_NAME: Record<string, string[]> = {
  wizard: ['Mago', 'Wizard'],
  sorcerer: ['Hechicero', 'Sorcerer'],
  cleric: ['Clérigo', 'Cleric'],
  druid: ['Druida', 'Druid'],
  bard: ['Bardo', 'Bard'],
  paladin: ['Paladín', 'Paladin'],
  ranger: ['Explorador', 'Ranger'],
  fighter: ['Guerrero', 'Fighter'],
  rogue: ['Pícaro', 'Rogue'],
}

/**
 * Get the level of an entity for a specific class.
 * Supports multiple formats:
 * - classLevels array: { className, level } (SRD format)
 * - level + classes: single level with array of class names (compendium format)
 */
function getEntityLevelForClass(entity: StandardEntity, classId: string): number | null {
  // Format 1: classLevels array (detailed SRD format)
  const classLevels = (entity as { classLevels?: { className: string; level: number }[] }).classLevels
  if (classLevels) {
    // Normalize classId for matching (e.g., "wizard" -> "Wizard")
    const normalizedClassId = classId.charAt(0).toUpperCase() + classId.slice(1).toLowerCase()
    const classLevel = classLevels.find(cl => cl.className === normalizedClassId)
    if (classLevel) {
      return classLevel.level
    }
    return null
  }

  // Format 2: single level with classes array (compendium format)
  const level = (entity as { level?: number }).level
  const classes = (entity as { classes?: string[] }).classes
  if (typeof level === 'number' && classes) {
    // Check if the entity's classes include this character's class
    const classNames = CLASS_ID_TO_NAME[classId.toLowerCase()] ?? [classId]
    const hasClass = classes.some(cls =>
      classNames.some(name => cls.toLowerCase() === name.toLowerCase())
    )
    if (hasClass) {
      return level
    }
    return null
  }

  // Fallback: just return the level if present (for entities without class restrictions)
  if (typeof level === 'number') {
    return level
  }

  return null
}

type CGEEntitySelectPanelProps = {
  /** Format: "level:slotIndex:cgeId" */
  selectionId: string
}

/**
 * CGE Entity Select Panel - Content for selecting an entity to prepare.
 * Uses real compendium data filtered by level and class.
 * Used in both desktop SidePanel and mobile detail screen.
 */
export function CGEEntitySelectPanel({ selectionId }: CGEEntitySelectPanelProps) {
  "use no memo"
  const { themeColors } = useTheme()
  const primaryCGE = usePrimaryCGE()
  const compendium = useCompendiumContext()
  const prepareEntityForCGE = useCharacterStore((state) => state.prepareEntityForCGE)
  const panelNav = usePanelNavigation('character')
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // Parse selectionId: "level:slotIndex:cgeId:trackId"
  const [levelStr, slotIndexStr, cgeIdFromParams, trackIdFromParams] = selectionId.split(':')
  const level = parseInt(levelStr ?? '0', 10)
  const slotIndex = parseInt(slotIndexStr ?? '0', 10)
  const cgeId = cgeIdFromParams ?? primaryCGE?.id ?? ''
  const trackId = trackIdFromParams ?? 'base'

  // Get the CGE config to determine entity type and class
  const entityType = primaryCGE?.entityType ?? 'spell'
  const classId = primaryCGE?.classId ?? 'wizard'

  // Get all entities of the right type from compendium
  const allEntities = compendium.getAllEntities(entityType)

  // Filter entities by level for the character's class
  const entitiesForLevel = allEntities.filter(entity => {
    const entityLevel = getEntityLevelForClass(entity, classId)
    return entityLevel === level
  })

  // Apply search filter
  const filteredEntities = searchQuery.trim()
    ? entitiesForLevel.filter(entity => {
        const query = searchQuery.toLowerCase().trim()
        const nameMatch = entity.name.toLowerCase().includes(query)
        const descMatch = entity.description?.toLowerCase().includes(query)
        return nameMatch || descMatch
      })
    : entitiesForLevel

  const levelLabel = getLevelLabel(level)

  const handleSelectEntity = (entityId: string) => {
    const result = prepareEntityForCGE(cgeId, level, slotIndex, entityId, trackId)
    if (!result.success) {
      console.warn('Failed to prepare entity:', result.error)
      return
    }

    // Mobile nativo: usar router.back(), Web: usar panel navigation
    if (Platform.OS !== 'web') {
      router.back()
    } else {
      panelNav.goBack()
    }
  }

  const placeholderColor = themeColors.placeholderColor

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Search bar */}
      <XStack
        backgroundColor="$background"
        borderRadius={10}
        borderWidth={1}
        borderColor="$borderColor"
        paddingHorizontal={12}
        paddingVertical={8}
        alignItems="center"
        gap={8}
      >
        <FontAwesome6 name="magnifying-glass" size={14} color={placeholderColor} />
        <TextInput
          style={[styles.searchInput, { color: themeColors.color }]}
          placeholder="Buscar..."
          placeholderTextColor={placeholderColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <FontAwesome6 name="xmark" size={14} color={placeholderColor} />
          </Pressable>
        )}
      </XStack>

      {/* Results count */}
      <Text fontSize={13} color="$placeholderColor">
        {filteredEntities.length} {filteredEntities.length === 1 ? 'resultado' : 'resultados'} para {levelLabel}
      </Text>

      {/* Entity list */}
      {filteredEntities.length === 0 ? (
        <Text color="$placeholderColor" textAlign="center" paddingVertical={32}>
          {searchQuery
            ? 'No se encontraron resultados'
            : 'No hay entidades disponibles para este nivel.'}
        </Text>
      ) : (
        filteredEntities.map((entity) => (
          <Pressable key={entity.id} onPress={() => handleSelectEntity(entity.id)}>
            {({ pressed }) => (
              <YStack
                paddingVertical={12}
                paddingHorizontal={16}
                backgroundColor="$uiBackgroundColor"
                borderRadius={8}
                opacity={pressed ? 0.6 : 1}
                gap={4}
              >
                <XStack alignItems="center" justifyContent="space-between">
                  <Text fontSize={15} color="$color" fontWeight="500">
                    {entity.name}
                  </Text>
                  <Text fontSize={12} color="$placeholderColor">
                    {levelLabel}
                  </Text>
                </XStack>
                {entity.description && (
                  <Text fontSize={12} color="$placeholderColor" numberOfLines={2}>
                    {entity.description}
                  </Text>
                )}
              </YStack>
            )}
          </Pressable>
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
})
