import { useState } from 'react'
import { View, Pressable } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { YStack, XStack, Text } from 'tamagui'
import type { CalculatedSingleSkill, CalculatedSkills } from '@zukus/core'
import { useCharacterAbilities, useCharacterSkills, AbilityCard, AbilityCardCompact, useIsPageVisible } from '../../../ui'
import { SectionHeader } from '../CharacterComponents'
import { useNavigateToDetail } from '../../../navigation'
import { useBookmarkedSkills } from '../../../hooks'
import { useTheme } from '../../../ui/contexts/ThemeContext'
import { SkillRow, type SkillRowColors } from '../../../ui/components/character'

const ABILITY_COLUMNS = [
  ['strength', 'dexterity', 'constitution'],
  ['intelligence', 'wisdom', 'charisma'],
]

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
 * Icono simple de grid (3x2)
 */
function GridIcon({ size = 16, color = '#888' }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, flexDirection: 'row', gap: 2 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flex: 1, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ flex: 1, backgroundColor: color, borderRadius: 1 }} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flex: 1, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ flex: 1, backgroundColor: color, borderRadius: 1 }} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flex: 1, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ flex: 1, backgroundColor: color, borderRadius: 1 }} />
      </View>
    </View>
  )
}

/**
 * Icono simple de lista (líneas horizontales)
 */
function ListIcon({ size = 16, color = '#888' }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, gap: 3, justifyContent: 'center' }}>
      <View style={{ height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ height: 2, backgroundColor: color, borderRadius: 1 }} />
    </View>
  )
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
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        backgroundColor: isActive ? colors.primary : colors.background,
        borderColor: isActive ? colors.primary : colors.border,
      }}
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
 * Seccion de ability scores y skills.
 * Todo en una única FlashList para scroll unificado y performance.
 * Abilities van en el ListHeaderComponent.
 */
export function AbilitiesSection() {
  const navigateToDetail = useNavigateToDetail()
  const abilities = useCharacterAbilities()
  const skills = useCharacterSkills()
  const { bookmarkedSkills, toggleBookmark } = useBookmarkedSkills()
  const [isCompactView, setIsCompactView] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const glowEnabled = useIsPageVisible('abilities')

  // Elevar useTheme para evitar múltiples suscripciones
  const { themeInfo } = useTheme()
  const colors: SkillRowColors & { background: string } = {
    primary: themeInfo.colors.primary,
    accent: themeInfo.colors.accent,
    border: themeInfo.colors.border,
    background: themeInfo.colors.background,
  }

  const handleAbilityPress = (abilityKey: string) => {
    navigateToDetail('ability', abilityKey)
  }

  const handleSkillPress = (skillId: string) => {
    navigateToDetail('skill', skillId)
  }

  const handleToggleBookmark = (skillId: string) => {
    toggleBookmark(skillId)
  }

  const toggleView = () => {
    setIsCompactView(!isCompactView)
  }

  // Procesar skills
  const flat = skills ? flattenSkills(skills, bookmarkedSkills) : []
  const filtered = filterSkills(flat, activeFilter)
  const processedSkills = sortSkills(filtered)

  // Si no hay datos aún, mostrar placeholder
  if (!abilities || !skills) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <YStack padding={16}>
          <YStack gap={12}>
            <SectionHeader icon="*" title="Cargando..." />
          </YStack>
        </YStack>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }} collapsable={false}>
      <FlashList
        data={processedSkills}
        keyExtractor={(item) => item.uniqueId}
        renderItem={({ item }) => (
          <SkillRow
            key={item.uniqueId}
            skillId={item.uniqueId}
            name={item.displayName}
            abilityKey={item.abilityModifierUniqueId}
            totalBonus={item.totalBonus}
            isClassSkill={item.isClassSkill}
            isBookmarked={item.isBookmarked}
            colors={colors}
            onPress={() => handleSkillPress(item.uniqueId)}
            onToggleBookmark={() => handleToggleBookmark(item.uniqueId)}
          />
        )}
        ListHeaderComponent={
          <YStack gap={16} paddingHorizontal={16} paddingTop={16}>
            {/* Ability Scores Section */}
            <YStack gap={12}>
              <SectionHeader
                icon="*"
                title="Ability Scores"
                action={
                  <Pressable onPress={toggleView}>
                    {({ pressed }) => (
                      <View
                        style={{
                          padding: 6,
                          borderRadius: 4,
                          opacity: pressed ? 0.5 : 1,
                        }}
                      >
                        {isCompactView ? <GridIcon size={16} color="#888" /> : <ListIcon size={16} color="#888" />}
                      </View>
                    )}
                  </Pressable>
                }
              />
              {isCompactView ? (
                <XStack gap={8}>
                  {ABILITY_COLUMNS.map((column, colIndex) => (
                    <YStack key={colIndex} flex={1} gap={6}>
                      {column.map((key) => {
                        const ability = abilities[key as keyof typeof abilities]
                        return (
                          <AbilityCardCompact
                            key={key}
                            abilityKey={key}
                            score={ability.totalScore}
                            modifier={ability.totalModifier}
                            onPress={() => handleAbilityPress(key)}
                            glowEnabled={glowEnabled}
                          />
                        )
                      })}
                    </YStack>
                  ))}
                </XStack>
              ) : (
                <YStack gap={12}>
                  <XStack justifyContent="space-between">
                    <AbilityCard
                      abilityKey="strength"
                      score={abilities.strength.totalScore}
                      modifier={abilities.strength.totalModifier}
                      onPress={() => handleAbilityPress('strength')}
                      glowEnabled={glowEnabled}
                    />
                    <AbilityCard
                      abilityKey="dexterity"
                      score={abilities.dexterity.totalScore}
                      modifier={abilities.dexterity.totalModifier}
                      onPress={() => handleAbilityPress('dexterity')}
                      glowEnabled={glowEnabled}
                    />
                    <AbilityCard
                      abilityKey="constitution"
                      score={abilities.constitution.totalScore}
                      modifier={abilities.constitution.totalModifier}
                      onPress={() => handleAbilityPress('constitution')}
                      glowEnabled={glowEnabled}
                    />
                  </XStack>
                  <XStack justifyContent="space-between">
                    <AbilityCard
                      abilityKey="intelligence"
                      score={abilities.intelligence.totalScore}
                      modifier={abilities.intelligence.totalModifier}
                      onPress={() => handleAbilityPress('intelligence')}
                      glowEnabled={glowEnabled}
                    />
                    <AbilityCard
                      abilityKey="wisdom"
                      score={abilities.wisdom.totalScore}
                      modifier={abilities.wisdom.totalModifier}
                      onPress={() => handleAbilityPress('wisdom')}
                      glowEnabled={glowEnabled}
                    />
                    <AbilityCard
                      abilityKey="charisma"
                      score={abilities.charisma.totalScore}
                      modifier={abilities.charisma.totalModifier}
                      onPress={() => handleAbilityPress('charisma')}
                      glowEnabled={glowEnabled}
                    />
                  </XStack>
                </YStack>
              )}
            </YStack>

            {/* Skills Header + Filters */}
            <YStack gap={12}>
              <SectionHeader icon="#" title="Skills" />
              <XStack gap={8} paddingBottom={8}>
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
            </YStack>
          </YStack>
        }
        ListEmptyComponent={
          <YStack padding={20} alignItems="center" paddingHorizontal={16}>
            <Text color="$placeholderColor">
              No hay skills que coincidan con el filtro
            </Text>
          </YStack>
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  )
}
