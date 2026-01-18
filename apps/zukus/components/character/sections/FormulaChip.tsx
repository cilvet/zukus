import { View } from 'tamagui'
import { Text as RNText, StyleSheet } from 'react-native'

type FormulaChipProps = {
  label: string
}

export function FormulaChip({ label }: FormulaChipProps) {
  return (
    <View style={styles.chip}>
      <RNText style={styles.chipText}>{label}</RNText>
    </View>
  )
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: 'rgba(100, 149, 237, 0.3)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginHorizontal: 2,
  },
  chipText: {
    color: '#6495ED',
    fontSize: 14,
    fontWeight: '600',
  },
})
