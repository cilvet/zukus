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
          gap={6}
          paddingVertical={3}
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
          <Text fontSize={12} color="$color" flex={1} numberOfLines={1}>
            {buff.name}
          </Text>
        </XStack>
      )}
    </Pressable>
  )
}

/**
 * Lista completa de buffs del personaje.
 * Muestra todos los buffs sin límite.
 */
export function BuffsCompact() {
  const buffs = useCharacterBuffs()
  const toggleBuff = useCharacterStore((state) => state.toggleBuff)
  const navigateToDetail = useNavigateToDetail()

  if (buffs.length === 0) {
    return (
      <Text fontSize={13} color="$placeholderColor">
        Sin buffs activos
      </Text>
    )
  }

  return (
    <YStack>
      {buffs.map((buff, index) => (
        <BuffRow
          key={buff.uniqueId}
          buff={buff}
          onToggle={() => toggleBuff(buff.uniqueId)}
          onPress={() => navigateToDetail('buff', buff.uniqueId, buff.name)}
          showBorder={index < buffs.length - 1}
        />
      ))}
    </YStack>
  )
}
