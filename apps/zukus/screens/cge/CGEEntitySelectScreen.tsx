import { View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { usePrimaryCGE, useTheme } from '../../ui'
import { CGEEntitySelectPanel } from '../../components/character'

/**
 * CGE Entity Select Screen - Wrapper for mobile stack navigation.
 *
 * NOTE: This screen is a legacy route. The preferred way to navigate to CGE entity selection
 * is via navigateToDetail('cgeEntitySelect', `${level}:${slotIndex}:${cgeId}`), which uses
 * the SidePanel on desktop and the detail screen on mobile.
 *
 * This screen exists as a fallback for direct URL access.
 */
export function CGEEntitySelectScreen() {
  const { themeColors } = useTheme()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ level: string; slotIndex: string; cgeId: string }>()
  const primaryCGE = usePrimaryCGE()

  const level = params.level ?? '0'
  const slotIndex = params.slotIndex ?? '0'
  const cgeId = params.cgeId ?? primaryCGE?.id ?? ''

  // Format for CGEEntitySelectPanel: "level:slotIndex:cgeId"
  const selectionId = `${level}:${slotIndex}:${cgeId}`

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background, paddingTop: insets.top }}>
      <CGEEntitySelectPanel selectionId={selectionId} />
    </View>
  )
}
