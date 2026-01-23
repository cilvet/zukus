import { Pressable, View, StyleSheet } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'
import type { Alignment } from '@zukus/core'

type AlignmentGridProps = {
  value: Alignment | null
  onChange: (alignment: Alignment | null) => void
}

type AlignmentCell = {
  lawChaos: 'lawful' | 'neutral' | 'chaotic'
  goodEvil: 'good' | 'neutral' | 'evil'
  label: string
  shortLabel: string
}

const ALIGNMENT_GRID: AlignmentCell[][] = [
  [
    { lawChaos: 'lawful', goodEvil: 'good', label: 'Legal Bueno', shortLabel: 'LB' },
    { lawChaos: 'neutral', goodEvil: 'good', label: 'Neutral Bueno', shortLabel: 'NB' },
    { lawChaos: 'chaotic', goodEvil: 'good', label: 'Caotico Bueno', shortLabel: 'CB' },
  ],
  [
    { lawChaos: 'lawful', goodEvil: 'neutral', label: 'Legal Neutral', shortLabel: 'LN' },
    { lawChaos: 'neutral', goodEvil: 'neutral', label: 'Neutral', shortLabel: 'N' },
    { lawChaos: 'chaotic', goodEvil: 'neutral', label: 'Caotico Neutral', shortLabel: 'CN' },
  ],
  [
    { lawChaos: 'lawful', goodEvil: 'evil', label: 'Legal Malvado', shortLabel: 'LM' },
    { lawChaos: 'neutral', goodEvil: 'evil', label: 'Neutral Malvado', shortLabel: 'NM' },
    { lawChaos: 'chaotic', goodEvil: 'evil', label: 'Caotico Malvado', shortLabel: 'CM' },
  ],
]

function isSelected(cell: AlignmentCell, value: Alignment | null): boolean {
  if (!value) return false
  return cell.lawChaos === value.lawChaos && cell.goodEvil === value.goodEvil
}

/**
 * Grid 3x3 interactivo para seleccionar el alineamiento del personaje.
 */
export function AlignmentGrid({ value, onChange }: AlignmentGridProps) {
  const handleCellPress = (cell: AlignmentCell) => {
    onChange({
      lawChaos: cell.lawChaos,
      goodEvil: cell.goodEvil,
    })
  }

  const handleNoAlignmentPress = () => {
    onChange(null)
  }

  return (
    <YStack gap={4} maxWidth={180}>
      {ALIGNMENT_GRID.map((row, rowIndex) => (
        <XStack key={rowIndex} gap={4}>
          {row.map((cell) => {
            const selected = isSelected(cell, value)
            return (
              <Pressable
                key={cell.shortLabel}
                onPress={() => handleCellPress(cell)}
                style={({ pressed }) => [
                  styles.cell,
                  selected && styles.cellSelected,
                  pressed && styles.cellPressed,
                ]}
              >
                <Text
                  fontSize={11}
                  fontWeight={selected ? '700' : '400'}
                  color={selected ? '$color' : '$placeholderColor'}
                  textAlign="center"
                >
                  {cell.shortLabel}
                </Text>
              </Pressable>
            )
          })}
        </XStack>
      ))}
      <Pressable
        onPress={handleNoAlignmentPress}
        style={({ pressed }) => [
          styles.noAlignmentButton,
          value === null && styles.noAlignmentButtonSelected,
          pressed && styles.cellPressed,
        ]}
      >
        <Text
          fontSize={11}
          fontWeight={value === null ? '700' : '400'}
          color={value === null ? '$color' : '$placeholderColor'}
          textAlign="center"
        >
          Sin Alineamiento
        </Text>
      </Pressable>
    </YStack>
  )
}

const styles = StyleSheet.create({
  cell: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cellSelected: {
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  cellPressed: {
    opacity: 0.7,
  },
  noAlignmentButton: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  noAlignmentButtonSelected: {
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
})
