import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../ui'
import { CGEManagementPanel } from '../../components/character'

/**
 * CGE Management Screen - Wrapper for mobile stack navigation.
 *
 * NOTE: This screen is a legacy route. The preferred way to navigate to CGE management
 * is via navigateToDetail('cgeManagement', cgeId), which uses the SidePanel on desktop
 * and the detail screen on mobile.
 *
 * This screen exists as a fallback for direct URL access.
 */
export function CGEManagementScreen() {
  const { themeColors } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background, paddingTop: insets.top }}>
      <CGEManagementPanel />
    </View>
  )
}
