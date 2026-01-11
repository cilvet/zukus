import { StyleSheet } from 'react-native'
import PagerView from 'react-native-pager-view'

type CharacterPagerProps = {
  children: React.ReactNode
}

/**
 * ViewPager nativo para swipe entre secciones del personaje.
 * Cada child directo se convierte en una página.
 */
export function CharacterPager({ children }: CharacterPagerProps) {
  return (
    <PagerView style={styles.pager} initialPage={0}>
      {children}
    </PagerView>
  )
}

const styles = StyleSheet.create({
  pager: {
    flex: 1,
  },
})
