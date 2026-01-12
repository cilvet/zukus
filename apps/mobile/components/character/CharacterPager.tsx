import { forwardRef, useImperativeHandle, useRef } from 'react'
import { StyleSheet } from 'react-native'
import PagerView from 'react-native-pager-view'

type CharacterPagerProps = {
  children: React.ReactNode
  onPageChange?: (index: number) => void
}

export type CharacterPagerRef = {
  setPage: (index: number) => void
}

/**
 * ViewPager nativo para swipe entre secciones del personaje.
 * Cada child directo se convierte en una página.
 */
export const CharacterPager = forwardRef<CharacterPagerRef, CharacterPagerProps>(
  function CharacterPager({ children, onPageChange }, ref) {
    const pagerRef = useRef<PagerView>(null)

    useImperativeHandle(ref, () => ({
      setPage: (index: number) => {
        pagerRef.current?.setPage(index)
      },
    }))

    return (
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => onPageChange?.(e.nativeEvent.position)}
      >
        {children}
      </PagerView>
    )
  }
)

const styles = StyleSheet.create({
  pager: {
    flex: 1,
  },
})
