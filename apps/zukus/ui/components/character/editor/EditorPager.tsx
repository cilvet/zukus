import { forwardRef, useImperativeHandle, useRef } from 'react'
import { StyleSheet } from 'react-native'
import PagerView from 'react-native-pager-view'

type EditorPagerProps = {
  children: React.ReactNode
  /** Se dispara cuando la pagina cambia */
  onPageChange?: (index: number) => void
}

export type EditorPagerRef = {
  setPage: (index: number) => void
}

/**
 * ViewPager nativo para swipe entre secciones del editor.
 * Similar a CharacterPager pero para el editor de personaje.
 */
export const EditorPager = forwardRef<EditorPagerRef, EditorPagerProps>(
  function EditorPager({ children, onPageChange }, ref) {
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
        offscreenPageLimit={1}
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
