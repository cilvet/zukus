// @ts-nocheck
// Los errores de tipo son debido a incompatibilidades entre @types/react 18 y 19
import { memo, useEffect, useRef } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  interpolateColor,
} from 'react-native-reanimated'
import { SkillRowContent, type SkillRowColors } from './SkillRowContent'

type SkillRowProps = {
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
 * Fila de skill con animación de glow.
 * 
 * Este componente usa Reanimated shared values que son mutables por diseño.
 * El contenido real está en SkillRowContent que está memoizado manualmente.
 * Archivo excluido del React Compiler en babel.config.js.
 * 
 * Memoizado para solo re-renderizar cuando cambia totalBonus.
 */
function SkillRowInner({
  skillId,
  name,
  abilityKey,
  totalBonus,
  isClassSkill,
  isBookmarked,
  colors,
  onPress,
  onToggleBookmark,
}: SkillRowProps) {

  // Refs para detectar cambios sin causar re-renders
  const prevBonusRef = useRef<number | undefined>(undefined)
  const isFirstRender = useRef(true)

  // Shared values para animaciones
  const glowProgress = useSharedValue(0)
  const numberScale = useSharedValue(1)

  // Detectar cambios en totalBonus y disparar animación
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      prevBonusRef.current = totalBonus
      return
    }

    if (prevBonusRef.current !== totalBonus) {
      // El valor cambió, disparar animación
      glowProgress.value = withSequence(
        withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 1200, easing: Easing.out(Easing.cubic) })
      )
      numberScale.value = withSequence(
        withTiming(1.2, { duration: 150, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
      )
      prevBonusRef.current = totalBonus
    }
  }, [totalBonus, glowProgress, numberScale])

  // Estilos animados
  const animatedContainerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      glowProgress.value,
      [0, 1],
      ['transparent', 'rgba(255, 255, 255, 0.1)']
    )
    return { backgroundColor }
  }, [])

  const animatedGlowBorderStyle = useAnimatedStyle(() => {
    return {
      opacity: glowProgress.value,
      borderColor: '#ffffff',
    }
  }, [])

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      {/* Borde de glow que solo aparece durante la animación */}
      <Animated.View 
        style={[styles.glowBorder, animatedGlowBorderStyle]} 
        pointerEvents="none" 
      />
      
      {/* Contenido memoizado */}
      <SkillRowContent
        skillId={skillId}
        name={name}
        abilityKey={abilityKey}
        totalBonus={totalBonus}
        isClassSkill={isClassSkill}
        isBookmarked={isBookmarked}
        colors={colors}
        onPress={onPress}
        onToggleBookmark={onToggleBookmark}
      />
    </Animated.View>
  )
}

/**
 * Exportamos versión memoizada que solo re-renderiza cuando cambia totalBonus.
 */
export const SkillRow = memo(
  SkillRowInner,
  (prev: SkillRowProps, next: SkillRowProps) => {
    // Solo re-renderizar si cambia el totalBonus
    return prev.totalBonus === next.totalBonus
  }
)

const styles = StyleSheet.create({
  container: {
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
})
