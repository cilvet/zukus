import { Pressable } from 'react-native'
import { XStack, Text } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { useTheme } from '../../ui'
import {
  useCurrentCompendiumId,
  useCurrentCompendiumName,
  useCurrentEntityTypeName,
  useSelectedEntityId,
  useSelectedEntityName,
  useCompendiumActions,
} from '../../ui/stores'

/**
 * Breadcrumbs de navegacion para compendios.
 * Formato: Compendios > [Compendio] > [Tipo] > [Entidad]
 */
export function CompendiumBreadcrumbs() {
  const { themeColors } = useTheme()
  const compendiumId = useCurrentCompendiumId()
  const compendiumName = useCurrentCompendiumName()
  const entityTypeName = useCurrentEntityTypeName()
  const selectedEntityId = useSelectedEntityId()
  const selectedEntityName = useSelectedEntityName()
  const { goBackToCompendiums, goBackToEntityTypes, goBackToEntities } = useCompendiumActions()

  const separatorColor = themeColors.placeholderColor

  // Determinar si cada nivel es clickable (no es el ultimo)
  const hasCompendium = !!compendiumId && !!compendiumName
  const hasEntityType = !!entityTypeName
  const hasEntity = !!selectedEntityId && !!selectedEntityName

  return (
    <XStack alignItems="center" gap={8} flexWrap="wrap">
      {/* Home / Compendios */}
      <Pressable onPress={goBackToCompendiums}>
        {({ pressed }) => (
          <XStack alignItems="center" gap={6} opacity={pressed ? 0.6 : 1}>
            <FontAwesome6 name="house" size={12} color={themeColors.placeholderColor} />
            <Text
              fontSize={13}
              color={hasCompendium ? '$placeholderColor' : '$color'}
              fontWeight={hasCompendium ? '400' : '600'}
            >
              Compendios
            </Text>
          </XStack>
        )}
      </Pressable>

      {/* Separator + Compendium name */}
      {hasCompendium && (
        <>
          <FontAwesome6 name="chevron-right" size={10} color={separatorColor} />
          <Pressable onPress={goBackToEntityTypes}>
            {({ pressed }) => (
              <Text
                fontSize={13}
                color={hasEntityType ? '$placeholderColor' : '$color'}
                fontWeight={hasEntityType ? '400' : '600'}
                opacity={pressed ? 0.6 : 1}
              >
                {compendiumName}
              </Text>
            )}
          </Pressable>
        </>
      )}

      {/* Separator + Entity type name */}
      {hasEntityType && (
        <>
          <FontAwesome6 name="chevron-right" size={10} color={separatorColor} />
          <Pressable onPress={goBackToEntities} disabled={!hasEntity}>
            {({ pressed }) => (
              <Text
                fontSize={13}
                color={hasEntity ? '$placeholderColor' : '$color'}
                fontWeight={hasEntity ? '400' : '600'}
                opacity={pressed && hasEntity ? 0.6 : 1}
              >
                {entityTypeName}
              </Text>
            )}
          </Pressable>
        </>
      )}

      {/* Separator + Entity name */}
      {hasEntity && (
        <>
          <FontAwesome6 name="chevron-right" size={10} color={separatorColor} />
          <Text fontSize={13} color="$color" fontWeight="600">
            {selectedEntityName}
          </Text>
        </>
      )}
    </XStack>
  )
}
