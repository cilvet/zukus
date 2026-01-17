import { useState } from 'react'
import { FlatList, Pressable, StyleSheet } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import type { CalculatedSingleSkill, CalculatedSkills } from '@zukus/core'
import { useCharacterSkills } from '../../stores/characterStore'
import { useNavigateToDetail, useIsDesktop } from '../../../navigation'
import { useBookmarkedSkills } from '../../../hooks'
import { useTheme } from '../../contexts/ThemeContext'
import { SkillRow } from './SkillRow'

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
}: {
  label: string
  isActive: boolean
  onPress: () => void
}) {
  const { themeInfo } = useTheme()
  const colors = themeInfo.colors

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
 * Sección de Skills con filtros y lista.
 * Compartido entre mobile y desktop.
 * En mobile usa .map() para evitar FlatList dentro de ScrollView.
 * En desktop usa FlatList con scroll propio.
 */
export function SkillsSection() {
  const skills = useCharacterSkills()
  const navigateToDetail = useNavigateToDetail()
  const { bookmarkedSkills, toggleBookmark } = useBookmarkedSkills()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const isDesktop = useIsDesktop()

  // El compilador de React 19 optimiza esto automáticamente
  const flat = skills ? flattenSkills(skills, bookmarkedSkills) : []
  const filtered = filterSkills(flat, activeFilter)
  const processedSkills = sortSkills(filtered)

  if (!skills) {
    return (
      <YStack padding={20} alignItems="center">
        <Text color="$placeholderColor">Cargando skills...</Text>
      </YStack>
    )
  }

  const handleSkillPress = (skillId: string) => {
    navigateToDetail('skill', skillId)
  }

  const renderSkillRow = (item: FlatSkill) => (
    <SkillRow
      key={item.uniqueId}
      skillId={item.uniqueId}
      name={item.displayName}
      abilityKey={item.abilityModifierUniqueId}
      totalBonus={item.totalBonus}
      isClassSkill={item.isClassSkill}
      isBookmarked={item.isBookmarked}
      onPress={() => handleSkillPress(item.uniqueId)}
      onToggleBookmark={() => toggleBookmark(item.uniqueId)}
    />
  )

  return (
    <YStack flex={1}>
      {/* Filter chips */}
      <XStack gap={8} paddingHorizontal={12} paddingVertical={12}>
        <FilterChip
          label="All"
          isActive={activeFilter === 'all'}
          onPress={() => setActiveFilter('all')}
        />
        <FilterChip
          label="Class"
          isActive={activeFilter === 'class'}
          onPress={() => setActiveFilter('class')}
        />
        <FilterChip
          label="Trained"
          isActive={activeFilter === 'trained'}
          onPress={() => setActiveFilter('trained')}
        />
      </XStack>

      {/* Skills list - FlatList solo en desktop, .map() en mobile */}
      {isDesktop ? (
        <FlatList
          data={processedSkills}
          keyExtractor={(item) => item.uniqueId}
          renderItem={({ item }) => renderSkillRow(item)}
          ListEmptyComponent={
            <YStack padding={20} alignItems="center">
              <Text color="$placeholderColor">
                No hay skills que coincidan con el filtro
              </Text>
            </YStack>
          }
        />
      ) : (
        <YStack>
          {processedSkills.length > 0 ? (
            processedSkills.map((item) => renderSkillRow(item))
          ) : (
            <YStack padding={20} alignItems="center">
              <Text color="$placeholderColor">
                No hay skills que coincidan con el filtro
              </Text>
            </YStack>
          )}
        </YStack>
      )}
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
