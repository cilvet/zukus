import { View } from 'react-native'
import { YStack, Text } from 'tamagui'
import { usePrimaryCGE } from '../../../ui'
import { SectionHeader } from '../CharacterComponents'
import { CGETabView } from '../panels'

/**
 * CGE Summary Section - Main view for spellcasting/abilities.
 * Contains tabs for Use and Manage panels.
 */
export function CGESummarySection() {
  const primaryCGE = usePrimaryCGE()

  if (!primaryCGE) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <YStack padding={16}>
          <YStack gap={12}>
            <SectionHeader icon="*" title="Sin habilidades" />
            <Text fontSize={12} color="$placeholderColor" padding={8}>
              Este personaje no tiene sistemas de conjuros o habilidades configurados.
            </Text>
          </YStack>
        </YStack>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <CGETabView cge={primaryCGE} />
    </View>
  )
}
