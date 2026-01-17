import { useState, useMemo, useCallback } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { YStack, XStack, Text } from 'tamagui'
import type { CalculatedSingleSkill, CalculatedSkills } from '@zukus/core'
import { useCharacterSkills } from '../../stores/characterStore'
import { useNavigateToDetail } from '../../../navigation'
import { useBookmarkedSkills } from '../../../hooks'
import { useTheme } from '../../contexts/ThemeContext'
import { SkillRow } from './SkillRow'
import type { SkillRowColors } from './SkillRowContent'

type FilterType = 'all' | 'class' | 'trained'

type FlatSkill = CalculatedSingleSkill & {
  displayName: string
  isBookmarked: boolean
}

/**
 * Aplana las skills (incluyendo sub-skills de parent skills).
 */
function flattenSkills(
  skills: CalculatedSkills,
  bookmarkedSkills: string[]
): FlatSkill[] {
  const flatSkills: FlatSkill[] = []

  Object.values(skills).forEach((skill) => {
    if (skill.type === 'parent') {
      skill.subSkills.forEach((subSkill) => {
        flatSkills.push({
          ...subSkill,
          displayName: subSkill.name,
          isBookmarked: bookmarkedSkills.includes(subSkill.uniqueId),
        })
      })
    } else {
      flatSkills.push({
        ...skill,
        displayName: skill.name,
        isBookmarked: bookmarkedSkills.includes(skill.uniqueId),
      })
    }
  })

  return flatSkills
}

/**
 * Filtra skills según el filtro activo.
 */
function filterSkills(skills: FlatSkill[], filter: FilterType): FlatSkill[] {
  if (filter === 'class') {
    return skills.filter((skill) => skill.isClassSkill)
  }
  if (filter === 'trained') {
    return skills.filter(
      (skill) => skill.skillData.ranks > 0 || skill.skillData.halfRanks > 0
    )
  }
  return skills
}

/**
 * Ordena skills: bookmarked primero, luego alfabéticamente.
 */
function sortSkills(skills: FlatSkill[]): FlatSkill[] {
  return [...skills].sort((a, b) => {
    if (a.isBookmarked && !b.isBookmarked) return -1
    if (!a.isBookmarked && b.isBookmarked) return 1
    return a.displayName.localeCompare(b.displayName)
  })
}

/**
 * Chip de filtro.
 */
function FilterChip({
  label,
  isActive,
  onPress,
  colors,
}: {
  label: string
  isActive: boolean
  onPress: () => void
  colors: SkillRowColors & { background: string }
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: `${colors.accent}50` }}
      style={[
        styles.chip,
        {
          backgroundColor: isActive ? colors.primary : colors.background,
          borderColor: isActive ? colors.primary : colors.border,
        },
      ]}
    >
      {({ pressed }) => (
        <Text
          fontSize={13}
          fontWeight="600"
          color={isActive ? colors.background : colors.primary}
          opacity={pressed ? 0.7 : 1}
        >
          {label}
        </Text>
      )}
    </Pressable>
  )
}

/**
 * Sección de Skills con filtros y lista virtualizada.
 * 
 * Usa FlashList en mobile y desktop para virtualización eficiente.
 * 
 * Optimizaciones aplicadas:
 * - useTheme elevado al padre (evita 46 suscripciones)
 * - SkillRowContent optimizado por React Compiler
 * - Animaciones aisladas en SkillRow wrapper con "use no memo"
 * - FlashList v2 para cell recycling eficiente
 */
export function SkillsSection() {
  const skills = useCharacterSkills()
  const navigateToDetail = useNavigateToDetail()
  const { bookmarkedSkills, toggleBookmark } = useBookmarkedSkills()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  
  // Elevar useTheme al padre para evitar 46 suscripciones a contexto
  const { themeInfo } = useTheme()
  
  // Memoizar colors para evitar nuevos objetos en cada render
  const colors = useMemo<SkillRowColors & { background: string }>(() => ({
    primary: themeInfo.colors.primary,
    accent: themeInfo.colors.accent,
    border: themeInfo.colors.border,
    background: themeInfo.colors.background,
  }), [themeInfo.colors.primary, themeInfo.colors.accent, themeInfo.colors.border, themeInfo.colors.background])

  // Procesar skills
  const flat = skills ? flattenSkills(skills, bookmarkedSkills) : []
  const filtered = filterSkills(flat, activeFilter)
  const processedSkills = sortSkills(filtered)

  // Funciones memoizadas para evitar nuevas referencias en cada render
  const handleSkillPress = useCallback((skillId: string) => {
    navigateToDetail('skill', skillId)
  }, [navigateToDetail])

  const handleToggleBookmark = useCallback((skillId: string) => {
    toggleBookmark(skillId)
  }, [toggleBookmark])

  if (!skills) {
    return (
      <YStack padding={20} alignItems="center">
        <Text color="$placeholderColor">Cargando skills...</Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1}>
      {/* Filter chips */}
      <XStack gap={8} paddingHorizontal={12} paddingVertical={12}>
        <FilterChip
          label="All"
          isActive={activeFilter === 'all'}
          onPress={() => setActiveFilter('all')}
          colors={colors}
        />
        <FilterChip
          label="Class"
          isActive={activeFilter === 'class'}
          onPress={() => setActiveFilter('class')}
          colors={colors}
        />
        <FilterChip
          label="Trained"
          isActive={activeFilter === 'trained'}
          onPress={() => setActiveFilter('trained')}
          colors={colors}
        />
      </XStack>

      {/* Skills list - FlashList en todas las plataformas */}
      <FlashList
        data={processedSkills}
        keyExtractor={(item) => item.uniqueId}
        renderItem={({ item }) => (
          <SkillRow
            skillId={item.uniqueId}
            name={item.displayName}
            abilityKey={item.abilityModifierUniqueId}
            totalBonus={item.totalBonus}
            isClassSkill={item.isClassSkill}
            isBookmarked={item.isBookmarked}
            colors={colors}
            onPress={handleSkillPress}
            onToggleBookmark={handleToggleBookmark}
          />
        )}
        ListEmptyComponent={
          <YStack padding={20} alignItems="center">
            <Text color="$placeholderColor">
              No hay skills que coincidan con el filtro
            </Text>
          </YStack>
        }
      />
    </YStack>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
})
