import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, Text } from 'tamagui'
import { Checkbox, useCharacterBuffs, useCharacterStore } from '../../../ui'
import { SectionHeader, SectionCard } from '../CharacterComponents'

/**
 * Sección de Buffs/Conjuros Activos.
 * Muestra checkboxes para activar/desactivar buffs.
 */
export function BuffsSection() {
  const buffs = useCharacterBuffs()
  const toggleBuff = useCharacterStore((state) => state.toggleBuff)

  if (buffs.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <YStack padding={16}>
          <SectionCard>
            <SectionHeader icon="*" title="Sin buffs disponibles" />
          </SectionCard>
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
        <SectionCard>
          <SectionHeader icon="*" title="Conjuros Activos" />
          <YStack gap={0}>
            {buffs.map((buff) => {
              return (
                <Checkbox
                  key={buff.uniqueId}
                  checked={buff.active}
                  onCheckedChange={() => toggleBuff(buff.uniqueId)}
                  label={buff.name}
                  size="small"
                  variant="diamond"
                />
              )
            })}
          </YStack>
        </SectionCard>

        <SectionCard>
          <SectionHeader icon="?" title="Info" />
          <Text fontSize={12} color="$placeholderColor" lineHeight={18}>
            Los conjuros de mejora otorgan +4 al atributo correspondiente mientras estén activos.
            {'\n\n'}
            Esta sección es de prueba para verificar el funcionamiento del sistema de buffs.
          </Text>
        </SectionCard>
      </ScrollView>
    </View>
  )
}
