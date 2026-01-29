import { Pressable } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { Checkbox } from '../../atoms'
import { useCharacterBuffs, useCharacterStore } from '../../stores/characterStore'
import { useNavigateToDetail } from '../../../navigation'

const MAX_VISIBLE_BUFFS = 4

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
 * Componente compacto de buffs para mostrar dentro de CombatSection.
 * Muestra hasta 4 buffs con separadores. Si hay mas, muestra "Ver todos".
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

  const visibleBuffs = buffs.slice(0, MAX_VISIBLE_BUFFS)
  const hasMore = buffs.length > MAX_VISIBLE_BUFFS
  const remainingCount = buffs.length - MAX_VISIBLE_BUFFS

  const handleViewAll = () => {
    navigateToDetail('allBuffs', 'all', 'Todos los Buffs')
  }

  return (
    <YStack>
      {visibleBuffs.map((buff, index) => (
        <BuffRow
          key={buff.uniqueId}
          buff={buff}
          onToggle={() => toggleBuff(buff.uniqueId)}
          onPress={() => navigateToDetail('buff', buff.uniqueId, buff.name)}
          showBorder={index < visibleBuffs.length - 1 || hasMore}
        />
      ))}
      {hasMore && (
        <Pressable onPress={handleViewAll}>
          {({ pressed }) => (
            <XStack
              paddingVertical={4}
              justifyContent="center"
              opacity={pressed ? 0.6 : 1}
            >
              <Text fontSize={12} color="$colorFocus">
                Ver todos ({remainingCount} mas)
              </Text>
            </XStack>
          )}
        </Pressable>
      )}
    </YStack>
  )
}
