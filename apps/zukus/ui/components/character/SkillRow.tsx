// @ts-nocheck
// Los errores de tipo son debido a incompatibilidades entre @types/react 18 y 19
import { Pressable, StyleSheet } from 'react-native'
import { XStack, Text } from 'tamagui'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Animated from 'react-native-reanimated'
import { useTheme } from '../../contexts/ThemeContext'
import { useRowGlowAnimation } from '../../../hooks'
import { getAbilityAbbr } from '../../constants'

type SkillRowProps = {
  skillId: string
  name: string
  abilityKey: string
  totalBonus: number
  isClassSkill: boolean
  isBookmarked: boolean
  onPress: () => void
  onToggleBookmark: (e: any) => void
}

/**
 * Fila de skill en el listado.
 * 
 * Layout:
 * [bookmark] [classSkill] Nombre del Skill    +13  DEX
 */
export function SkillRow({
  skillId,
  name,
  abilityKey,
  totalBonus,
  isClassSkill,
  isBookmarked,
  onPress,
  onToggleBookmark,
}: SkillRowProps) {
  "use no memo"; // Reanimated shared values are mutable by design
  
  const { themeInfo } = useTheme()
  const colors = themeInfo.colors

  const {
    animatedRowStyle,
    animatedBorderStyle: animatedGlowBorderStyle,
    animatedNumberStyle,
  } = useRowGlowAnimation(totalBonus, colors.border)

  const abilityAbbr = getAbilityAbbr(abilityKey)
  const bonusText = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`

  const handleBookmarkPress = (e: any) => {
    e.stopPropagation()
    onToggleBookmark(e)
  }

  return (
    <Animated.View style={[styles.rowWrapper, animatedRowStyle, { borderBottomColor: colors.border }]}>
      {/* Borde completo que solo aparece durante el glow */}
      <Animated.View style={[styles.glowBorder, animatedGlowBorderStyle]} pointerEvents="none" />
      
      <Pressable
        onPress={onPress}
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
            <Animated.View style={animatedNumberStyle}>
              <Text
                fontSize={17}
                fontWeight="700"
                color="#ffffff"
                minWidth={40}
                textAlign="right"
              >
                {bonusText}
              </Text>
            </Animated.View>

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
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  rowWrapper: {
    borderBottomWidth: 1,
    position: 'relative',
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1.5,
    borderRadius: 8,
    pointerEvents: 'none',
  },
  pressable: {
    width: '100%',
  },
})
