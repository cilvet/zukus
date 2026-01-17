import { ScrollView, StyleSheet, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { Text, YStack } from 'tamagui'
import { useCharacterAbilities, useTheme } from '../../ui'
import { AbilityDetailPanel, ABILITY_INFO } from '../../components/character'
import type { Ability } from '../../components/character/data'
import type { CalculatedAbility } from '@zukus/core'

type DetailType = 'ability' | 'skill' | 'spell' | 'buff' | 'equipment'

type SlugParams = {
  slug: string[]
}

function parseSlug(slug: string | string[] | undefined): { type: DetailType | null; id: string | null; extra: string[] } {
  if (!slug) {
    return { type: null, id: null, extra: [] }
  }
  
  const parts = Array.isArray(slug) ? slug : [slug]
  const [type, id, ...extra] = parts
  
  const validTypes: DetailType[] = ['ability', 'skill', 'spell', 'buff', 'equipment']
  const isValidType = validTypes.includes(type as DetailType)
  
  return {
    type: isValidType ? (type as DetailType) : null,
    id: id ?? null,
    extra,
  }
}

function AbilityDetail({ abilityKey }: { abilityKey: string }) {
  const abilities = useCharacterAbilities()
  
  if (!abilities) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }
  
  const coreAbility = abilities[abilityKey] as CalculatedAbility | undefined
  if (!coreAbility) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Ability no encontrada: {abilityKey}</Text>
      </YStack>
    )
  }
  
  const ability: Ability = {
    score: coreAbility.totalScore,
    modifier: coreAbility.totalModifier,
  }
  
  return (
    <AbilityDetailPanel 
      abilityKey={abilityKey} 
      ability={ability} 
      sourceValues={coreAbility.sourceValues}
    />
  )
}

function NotImplementedDetail({ type, id }: { type: string; id: string }) {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding={20}>
      <Text fontSize={18} fontWeight="700" color="$color" marginBottom={8}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Text>
      <Text color="$placeholderColor" textAlign="center">
        Detalle de "{id}" - Pendiente de implementar
      </Text>
    </YStack>
  )
}

function InvalidRoute() {
  const router = useRouter()
  
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding={20}>
      <Text fontSize={18} fontWeight="700" color="$color" marginBottom={8}>
        Ruta no valida
      </Text>
      <Text color="$placeholderColor" textAlign="center" marginBottom={16}>
        La ruta solicitada no existe o no es valida.
      </Text>
      <Pressable onPress={() => router.back()}>
        {({ pressed }) => (
          <Text color="$colorFocus" opacity={pressed ? 0.7 : 1}>
            Volver
          </Text>
        )}
      </Pressable>
    </YStack>
  )
}

/**
 * Pantalla de detalle genérica que renderiza según el tipo.
 * 
 * Rutas soportadas:
 * - /detail/ability/[abilityKey] - Detalle de ability score
 * - /detail/skill/[skillId] - Detalle de skill (pendiente)
 * - /detail/spell/[spellId] - Detalle de spell (pendiente)
 * - /detail/buff/[buffId] - Detalle de buff (pendiente)
 * - /detail/equipment/[itemId] - Detalle de equipment (pendiente)
 */
export function DetailScreen() {
  const { slug } = useLocalSearchParams<SlugParams>()
  const { themeColors } = useTheme()
  
  const { type, id, extra } = parseSlug(slug)
  
  // Determinar el título para el header
  const getTitle = (): string => {
    if (!type || !id) return 'Detalle'
    
    if (type === 'ability') {
      return ABILITY_INFO[id]?.name ?? 'Ability'
    }
    
    // Para otros tipos, capitalizar el id
    return id.charAt(0).toUpperCase() + id.slice(1)
  }
  
  // Renderizar contenido según el tipo
  const renderContent = () => {
    if (!type || !id) {
      return <InvalidRoute />
    }
    
    switch (type) {
      case 'ability':
        return <AbilityDetail abilityKey={id} />
      case 'skill':
      case 'spell':
      case 'buff':
      case 'equipment':
        return <NotImplementedDetail type={type} id={id} />
      default:
        return <InvalidRoute />
    }
  }
  
  return (
    <>
      <Stack.Screen options={{ title: getTitle() }} />
      <ScrollView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        contentContainerStyle={styles.content}
      >
        {renderContent()}
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
})
