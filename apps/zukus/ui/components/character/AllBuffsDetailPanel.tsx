import { Pressable } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { Checkbox } from '../../atoms'
import { useCharacterBuffs, useCharacterStore } from '../../stores/characterStore'
import { useNavigateToDetail } from '../../../navigation'

type BuffRowProps = {
  buff: {
    uniqueId: string
    name: string
    active: boolean
  }
  onToggle: () => void
  onPress: () => void
  showBorder: boolean
}

function BuffRow({ buff, onToggle, onPress, showBorder }: BuffRowProps) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <XStack
          alignItems="center"
          gap={8}
          paddingVertical={8}
          opacity={pressed ? 0.6 : 1}
          borderBottomWidth={showBorder ? 1 : 0}
          borderBottomColor="$borderColor"
        >
          <Checkbox
            checked={buff.active}
            onCheckedChange={onToggle}
            size="small"
            variant="diamond"
          />
          <Text fontSize={14} color="$color" flex={1}>
            {buff.name}
          </Text>
        </XStack>
      )}
    </Pressable>
  )
}

/**
 * Panel de detalle que muestra todos los buffs del personaje.
 * Permite activar/desactivar y navegar al detalle de cada buff.
 */
export function AllBuffsDetailPanel() {
  const buffs = useCharacterBuffs()
  const toggleBuff = useCharacterStore((state) => state.toggleBuff)
  const navigateToDetail = useNavigateToDetail()

  if (buffs.length === 0) {
    return (
      <YStack padding={16} alignItems="center">
        <Text fontSize={14} color="$placeholderColor">
          No hay buffs disponibles
        </Text>
      </YStack>
    )
  }

  const activeBuffs = buffs.filter((b) => b.active)
  const inactiveBuffs = buffs.filter((b) => !b.active)

  return (
    <YStack gap={16}>
      {activeBuffs.length > 0 && (
        <YStack gap={4}>
          <Text fontSize={12} color="$placeholderColor" fontWeight="600" marginBottom={4}>
            ACTIVOS ({activeBuffs.length})
          </Text>
          {activeBuffs.map((buff, index) => (
            <BuffRow
              key={buff.uniqueId}
              buff={buff}
              onToggle={() => toggleBuff(buff.uniqueId)}
              onPress={() => navigateToDetail('buff', buff.uniqueId, buff.name)}
              showBorder={index < activeBuffs.length - 1}
            />
          ))}
        </YStack>
      )}
      {inactiveBuffs.length > 0 && (
        <YStack gap={4}>
          <Text fontSize={12} color="$placeholderColor" fontWeight="600" marginBottom={4}>
            INACTIVOS ({inactiveBuffs.length})
          </Text>
          {inactiveBuffs.map((buff, index) => (
            <BuffRow
              key={buff.uniqueId}
              buff={buff}
              onToggle={() => toggleBuff(buff.uniqueId)}
              onPress={() => navigateToDetail('buff', buff.uniqueId, buff.name)}
              showBorder={index < inactiveBuffs.length - 1}
            />
          ))}
        </YStack>
      )}
    </YStack>
  )
}
