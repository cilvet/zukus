import { useState } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { Text, YStack, XStack, Card } from 'tamagui'
import type { SourceValue } from '@zukus/core'
import { SourceValuesTable } from './SourceValuesTable'
import { useTheme } from '../../contexts/ThemeContext'

type ACType = 'total' | 'touch' | 'flatFooted'

const AC_TYPE_INFO: Record<ACType, { name: string; fullName: string; description: string }> = {
  total: {
    name: 'Total',
    fullName: 'Total AC',
    description: 'Your full Armor Class including armor, shield, Dexterity modifier, size modifier, natural armor, deflection bonuses, and other bonuses.',
  },
  touch: {
    name: 'Touch',
    fullName: 'Touch AC',
    description: 'Your AC against touch attacks. Touch attacks ignore armor, shields, and natural armor bonuses. They include most spells that require an attack roll.',
  },
  flatFooted: {
    name: 'Flat-Footed',
    fullName: 'Flat-Footed AC',
    description: 'Your AC when caught flat-footed (before acting in combat or when unable to react). You lose your Dexterity bonus to AC and some other bonuses.',
  },
}

export type ArmorClassDetailPanelProps = {
  totalValue: number
  totalSourceValues: SourceValue[]
  touchValue: number
  touchSourceValues: SourceValue[]
  flatFootedValue: number
  flatFootedSourceValues: SourceValue[]
}

type TabButtonProps = {
  isSelected: boolean
  label: string
  onPress: () => void
}

function TabButton({ isSelected, label, onPress }: TabButtonProps) {
  const { themeInfo } = useTheme()

  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      {({ pressed }) => (
        <YStack
          flex={1}
          paddingVertical={12}
          alignItems="center"
          justifyContent="center"
          backgroundColor={isSelected ? '$uiBackgroundColor' : 'transparent'}
          borderBottomWidth={isSelected ? 2 : 0}
          borderBottomColor={isSelected ? themeInfo.colors.primary : 'transparent'}
          opacity={pressed ? 0.7 : 1}
        >
          <Text
            fontSize={14}
            fontWeight={isSelected ? '700' : '600'}
            color={isSelected ? '$color' : '$placeholderColor'}
          >
            {label}
          </Text>
        </YStack>
      )}
    </Pressable>
  )
}

/**
 * Panel de detalle de Armor Class.
 * Muestra tabs para alternar entre Total/Touch/Flat-Footed, mostrando sourceValues del seleccionado.
 * Compartido entre mobile (DetailScreen) y desktop (SidePanel).
 */
export function ArmorClassDetailPanel({
  totalValue,
  totalSourceValues,
  touchValue,
  touchSourceValues,
  flatFootedValue,
  flatFootedSourceValues,
}: ArmorClassDetailPanelProps) {
  const [selectedType, setSelectedType] = useState<ACType>('total')

  const getCurrentData = () => {
    switch (selectedType) {
      case 'total':
        return { value: totalValue, sourceValues: totalSourceValues }
      case 'touch':
        return { value: touchValue, sourceValues: touchSourceValues }
      case 'flatFooted':
        return { value: flatFootedValue, sourceValues: flatFootedSourceValues }
    }
  }

  const currentData = getCurrentData()
  const info = AC_TYPE_INFO[selectedType]

  return (
    <YStack gap={16} padding={4}>
      {/* Summary Card - muestra los 3 valores */}
      <Card
        padding={16}
        backgroundColor="$background"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius={4}
      >
        <Text fontSize={18} fontWeight="700" color="$color" marginBottom={12}>
          Armor Class
        </Text>
        <XStack justifyContent="space-around">
          <YStack alignItems="center">
            <Text fontSize={12} color="$placeholderColor" marginBottom={4}>
              Total
            </Text>
            <Text fontSize={28} fontWeight="700" color="$color">
              {totalValue}
            </Text>
          </YStack>
          <YStack alignItems="center">
            <Text fontSize={12} color="$placeholderColor" marginBottom={4}>
              Touch
            </Text>
            <Text fontSize={28} fontWeight="700" color="$color">
              {touchValue}
            </Text>
          </YStack>
          <YStack alignItems="center">
            <Text fontSize={12} color="$placeholderColor" marginBottom={4}>
              Flat-Footed
            </Text>
            <Text fontSize={28} fontWeight="700" color="$color">
              {flatFootedValue}
            </Text>
          </YStack>
        </XStack>
      </Card>

      {/* Tabs para seleccionar tipo de AC */}
      <Card
        padding={0}
        backgroundColor="$background"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius={4}
        overflow="hidden"
      >
        <XStack borderBottomWidth={1} borderBottomColor="$borderColor">
          <TabButton
            isSelected={selectedType === 'total'}
            label="Total"
            onPress={() => setSelectedType('total')}
          />
          <TabButton
            isSelected={selectedType === 'touch'}
            label="Touch"
            onPress={() => setSelectedType('touch')}
          />
          <TabButton
            isSelected={selectedType === 'flatFooted'}
            label="Flat-Footed"
            onPress={() => setSelectedType('flatFooted')}
          />
        </XStack>

        {/* Contenido del tab seleccionado */}
        <YStack padding={16}>
          <YStack alignItems="center" gap={8} marginBottom={16}>
            <Text fontSize={20} fontWeight="700" color="$color">
              {info.fullName}
            </Text>
            <Text fontSize={42} fontWeight="700" color="$color">
              {currentData.value}
            </Text>
          </YStack>

          <Text fontSize={14} fontWeight="700" marginBottom={12} color="$color">
            MODIFICADORES
          </Text>
          <SourceValuesTable sourceValues={currentData.sourceValues} />
        </YStack>
      </Card>

      {/* Description Card */}
      <Card
        padding={16}
        backgroundColor="$background"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius={4}
      >
        <Text fontSize={14} fontWeight="700" marginBottom={12} color="$color">
          DESCRIPCION
        </Text>
        <Text fontSize={14} color="$placeholderColor" lineHeight={22}>
          {info.description}
        </Text>
      </Card>
    </YStack>
  )
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
  },
})
