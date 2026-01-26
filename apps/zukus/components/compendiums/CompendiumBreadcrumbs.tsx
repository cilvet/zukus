import { Pressable } from 'react-native'
import { XStack, Text } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { useTheme } from '../../ui'
import {
  useCurrentCompendiumId,
  useCurrentCompendiumName,
  useCurrentEntityTypeName,
  useCompendiumActions,
} from '../../ui/stores'

/**
 * Breadcrumbs de navegacion para compendios.
 * Formato: Compendios > [Compendio] > [Tipo]
 */
export function CompendiumBreadcrumbs() {
  const { themeColors } = useTheme()
  const compendiumId = useCurrentCompendiumId()
  const compendiumName = useCurrentCompendiumName()
  const entityTypeName = useCurrentEntityTypeName()
  const { goBackToCompendiums, goBackToEntityTypes } = useCompendiumActions()

  const separatorColor = themeColors.placeholderColor

  return (
    <XStack alignItems="center" gap={8} flexWrap="wrap">
      {/* Home / Compendios */}
      <Pressable onPress={goBackToCompendiums}>
        {({ pressed }) => (
          <XStack alignItems="center" gap={6} opacity={pressed ? 0.6 : 1}>
            <FontAwesome6 name="house" size={12} color={themeColors.placeholderColor} />
            <Text
              fontSize={13}
              color={compendiumId ? '$placeholderColor' : '$color'}
              fontWeight={compendiumId ? '400' : '600'}
            >
              Compendios
            </Text>
          </XStack>
        )}
      </Pressable>

      {/* Separator + Compendium name */}
      {compendiumId && compendiumName && (
        <>
          <FontAwesome6 name="chevron-right" size={10} color={separatorColor} />
          <Pressable onPress={goBackToEntityTypes}>
            {({ pressed }) => (
              <Text
                fontSize={13}
                color={entityTypeName ? '$placeholderColor' : '$color'}
                fontWeight={entityTypeName ? '400' : '600'}
                opacity={pressed ? 0.6 : 1}
              >
                {compendiumName}
              </Text>
            )}
          </Pressable>
        </>
      )}

      {/* Separator + Entity type name */}
      {entityTypeName && (
        <>
          <FontAwesome6 name="chevron-right" size={10} color={separatorColor} />
          <Text fontSize={13} color="$color" fontWeight="600">
            {entityTypeName}
          </Text>
        </>
      )}
    </XStack>
  )
}
