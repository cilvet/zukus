import { ScrollView, StyleSheet, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { Text, YStack } from 'tamagui'
import { useCharacterAbilities, useCharacterSavingThrows, useCharacterArmorClass, useCharacterInitiative, useCharacterBAB, useCharacterSkills, useTheme, SavingThrowDetailPanel, InitiativeDetailPanel, BABDetailPanel, SkillDetailPanel } from '../../ui'
import { AbilityDetailPanel, ArmorClassDetailPanel } from '../../components/character'
import type { Ability } from '../../components/character/data'
import type { CalculatedAbility, CalculatedSavingThrow } from '@zukus/core'
import { type DetailType, isValidDetailType, getDetailTitle } from '../../navigation'

type SlugParams = {
  slug: string[]
}

type ParsedSlug = {
  type: DetailType | null
  id: string | null
  extra: string[]
}

function parseSlug(slug: string | string[] | undefined): ParsedSlug {
  if (!slug) {
    return { type: null, id: null, extra: [] }
  }
  
  const parts = Array.isArray(slug) ? slug : [slug]
  const [type, id, ...extra] = parts
  
  if (!isValidDetailType(type)) {
    return { type: null, id: id ?? null, extra }
  }
  
  return {
    type,
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

function SavingThrowDetail({ savingThrowKey }: { savingThrowKey: string }) {
  const savingThrows = useCharacterSavingThrows()

  if (!savingThrows) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  const savingThrow = savingThrows[savingThrowKey as keyof typeof savingThrows] as CalculatedSavingThrow | undefined
  if (!savingThrow) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Saving Throw no encontrado: {savingThrowKey}</Text>
      </YStack>
    )
  }

  return (
    <SavingThrowDetailPanel
      savingThrowKey={savingThrowKey}
      totalValue={savingThrow.totalValue}
      sourceValues={savingThrow.sourceValues}
    />
  )
}

function ArmorClassDetail() {
  const armorClass = useCharacterArmorClass()

  if (!armorClass) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  return (
    <ArmorClassDetailPanel
      totalValue={armorClass.totalAc.totalValue}
      totalSourceValues={armorClass.totalAc.sourceValues}
      touchValue={armorClass.touchAc.totalValue}
      touchSourceValues={armorClass.touchAc.sourceValues}
      flatFootedValue={armorClass.flatFootedAc.totalValue}
      flatFootedSourceValues={armorClass.flatFootedAc.sourceValues}
    />
  )
}

function InitiativeDetail() {
  const initiative = useCharacterInitiative()

  if (!initiative) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  return (
    <InitiativeDetailPanel
      totalValue={initiative.totalValue}
      sourceValues={initiative.sourceValues}
    />
  )
}

function BABDetail() {
  const bab = useCharacterBAB()

  if (!bab) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  return (
    <BABDetailPanel
      totalValue={bab.totalValue}
      multipleAttacks={bab.multipleBaseAttackBonuses}
      sourceValues={bab.sourceValues}
    />
  )
}

function SkillDetail({ skillId }: { skillId: string }) {
  const skills = useCharacterSkills()

  if (!skills) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  // Buscar en skills y en sub-skills
  let skill = skills[skillId]
  
  if (!skill) {
    // Buscar en sub-skills de parent skills
    for (const parentSkill of Object.values(skills)) {
      if (parentSkill.type === 'parent') {
        const subSkill = parentSkill.subSkills.find(s => s.uniqueId === skillId)
        if (subSkill) {
          skill = subSkill
          break
        }
      }
    }
  }

  if (!skill) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Skill no encontrada: {skillId}</Text>
      </YStack>
    )
  }

  if (skill.type === 'parent') {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">
          Esta es una parent skill. Selecciona una sub-skill específica.
        </Text>
      </YStack>
    )
  }

  return (
    <SkillDetailPanel
      skillName={skill.name}
      abilityKey={skill.abilityModifierUniqueId}
      totalBonus={skill.totalBonus}
      isClassSkill={skill.isClassSkill}
      sourceValues={skill.sourceValues}
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
 * - /detail/savingThrow/[savingThrowKey] - Detalle de saving throw
 * - /detail/armorClass/armorClass - Detalle de armor class
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
    if (!type || !id) {
      return 'Detalle'
    }
    return getDetailTitle(type, id)
  }
  
  // Renderizar contenido según el tipo
  const renderContent = () => {
    if (!type || !id) {
      return <InvalidRoute />
    }
    
    switch (type) {
      case 'ability':
        return <AbilityDetail abilityKey={id} />
      case 'savingThrow':
        return <SavingThrowDetail savingThrowKey={id} />
      case 'armorClass':
        return <ArmorClassDetail />
      case 'initiative':
        return <InitiativeDetail />
      case 'bab':
        return <BABDetail />
      case 'skill':
        return <SkillDetail skillId={id} />
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
