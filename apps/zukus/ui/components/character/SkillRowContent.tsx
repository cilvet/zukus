import { memo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { XStack, Text } from 'tamagui'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { getAbilityAbbr } from '../../constants'

export type SkillRowColors = {
  primary: string
  accent: string
  border: string
}

type SkillRowContentProps = {
  skillId: string
  name: string
  abilityKey: string
  totalBonus: number
  isClassSkill: boolean
  isBookmarked: boolean
  colors: SkillRowColors
  onPress: (skillId: string) => void
  onToggleBookmark: (skillId: string) => void
}

/**
 * Contenido de una fila de skill.
 * 
 * Memoizado manualmente para solo re-renderizar cuando cambie totalBonus.
 * Archivo excluido del React Compiler en babel.config.js.
 */
function SkillRowContentInner({
  skillId,
  name,
  abilityKey,
  totalBonus,
  isClassSkill,
  isBookmarked,
  colors,
  onPress,
  onToggleBookmark,
}: SkillRowContentProps) {
  const abilityAbbr = getAbilityAbbr(abilityKey)
  const bonusText = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`

  const handlePress = () => {
    onPress(skillId)
  }

  const handleBookmarkPress = () => {
    onToggleBookmark(skillId)
  }

  return (
    <View style={[styles.rowWrapper, { borderBottomColor: colors.border }]}>
      <Pressable
        onPress={handlePress}
        android_ripple={{ color: `${colors.accent}50` }}
        style={styles.pressable}
      >
        {({ pressed }) => (
          <XStack
            paddingVertical={10}
            paddingHorizontal={12}
            alignItems="center"
            gap={10}
            opacity={pressed ? 0.7 : 1}
          >
            {/* Bookmark icon */}
            <Pressable onPress={handleBookmarkPress} hitSlop={8}>
              <FontAwesome
                name={isBookmarked ? 'bookmark' : 'bookmark-o'}
                size={16}
                color={isBookmarked ? colors.primary : colors.accent}
              />
            </Pressable>

            {/* Class skill indicator */}
            <Text fontSize={16} color={colors.accent}>
              {isClassSkill ? '●' : '○'}
            </Text>

            {/* Skill name */}
            <Text
              flex={1}
              fontSize={15}
              fontWeight="500"
              color={colors.primary}
            >
              {name}
            </Text>

            {/* Total bonus */}
            <Text
              fontSize={17}
              fontWeight="700"
              color="#ffffff"
              minWidth={40}
              textAlign="right"
            >
              {bonusText}
            </Text>

            {/* Ability abbreviation */}
            <Text
              fontSize={13}
              fontWeight="600"
              color={colors.accent}
              minWidth={36}
              textAlign="right"
            >
              {abilityAbbr}
            </Text>
          </XStack>
        )}
      </Pressable>
    </View>
  )
}

/**
 * Exportamos versión memoizada que solo re-renderiza cuando cambia totalBonus.
 * Esto es una optimización manual porque tenemos 46 skills en pantalla.
 */
export const SkillRowContent = memo(
  SkillRowContentInner,
  (prev: SkillRowContentProps, next: SkillRowContentProps) => {
    // Solo re-renderizar si cambia el totalBonus
    return prev.totalBonus === next.totalBonus
  }
)

const styles = StyleSheet.create({
  rowWrapper: {
    borderBottomWidth: 1,
    position: 'relative',
  },
  pressable: {
    width: '100%',
  },
})
