import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/**
 * Spacer negro para el safe area inferior.
 * Usar al final de cada pantalla para que el contenido
 * no quede tapado por la barra de navegacion de Android.
 */
export function SafeAreaBottomSpacer() {
  const insets = useSafeAreaInsets()

  return <View style={{ height: insets.bottom, backgroundColor: '#000' }} />
}
