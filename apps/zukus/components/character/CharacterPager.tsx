import { forwardRef, useImperativeHandle, useRef } from 'react'
import { StyleSheet } from 'react-native'
import PagerView from 'react-native-pager-view'

type CharacterPagerProps = {
  children: React.ReactNode
  /** Se dispara cuando la página cambia (al cruzar ~50% del swipe) */
  onPageChange?: (index: number) => void
  /** Se dispara cuando una página está completamente visible (offset = 0) */
  onPageSettled?: (index: number) => void
}

export type CharacterPagerRef = {
  setPage: (index: number) => void
}

/**
 * ViewPager nativo para swipe entre secciones del personaje.
 * Cada child directo se convierte en una página.
 */
export const CharacterPager = forwardRef<CharacterPagerRef, CharacterPagerProps>(
  function CharacterPager({ children, onPageChange, onPageSettled }, ref) {
    const pagerRef = useRef<PagerView>(null)
    const lastSettledPage = useRef<number>(0)

    useImperativeHandle(ref, () => ({
      setPage: (index: number) => {
        pagerRef.current?.setPage(index)
      },
    }))

    const handlePageScroll = (e: { nativeEvent: { position: number; offset: number } }) => {
      const { position, offset } = e.nativeEvent
      // offset = 0 significa que la página está completamente visible
      if (offset === 0 && lastSettledPage.current !== position) {
        lastSettledPage.current = position
        onPageSettled?.(position)
      }
    }

    return (
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        offscreenPageLimit={1}
        onPageSelected={(e) => onPageChange?.(e.nativeEvent.position)}
        onPageScroll={handlePageScroll}
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
