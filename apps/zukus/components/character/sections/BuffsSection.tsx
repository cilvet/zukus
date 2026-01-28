import { View, Pressable } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, XStack, Text } from 'tamagui'
import { Checkbox, useCharacterBuffs, useCharacterStore } from '../../../ui'
import { SectionHeader } from '../CharacterComponents'
import { useNavigateToDetail } from '../../../navigation'

/**
 * Sección de Buffs.
 * Muestra lista de buffs con checkbox para activar/desactivar.
 * Tocar el item navega al detalle del buff.
 * El checkbox solo hace toggle, no navega.
 */
export function BuffsSection() {
  const buffs = useCharacterBuffs()
  const toggleBuff = useCharacterStore((state) => state.toggleBuff)
  const navigateToDetail = useNavigateToDetail()

  if (buffs.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <YStack padding={16}>
          <YStack gap={12}>
            <SectionHeader icon="*" title="Sin buffs disponibles" />
          </YStack>
        </YStack>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }} collapsable={false}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <YStack gap={12}>
          <SectionHeader icon="*" title="Buffs" />
          <YStack gap={4}>
            {buffs.map((buff) => {
              return (
                <Pressable
                  key={buff.uniqueId}
                  onPress={() => navigateToDetail('buff', buff.uniqueId, buff.name)}
                >
                  {({ pressed }) => (
                    <XStack
                      alignItems="center"
                      gap={8}
                      paddingVertical={4}
                      opacity={pressed ? 0.6 : 1}
                    >
                      <Checkbox
                        checked={buff.active}
                        onCheckedChange={() => toggleBuff(buff.uniqueId)}
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
            })}
          </YStack>
        </YStack>

        <YStack gap={12}>
          <SectionHeader icon="?" title="Info" />
          <Text fontSize={12} color="$placeholderColor" lineHeight={18}>
            Toca un buff para ver sus detalles. Usa el checkbox para activar/desactivar.
          </Text>
        </YStack>
      </ScrollView>
    </View>
  )
}
