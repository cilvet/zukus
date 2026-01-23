import { forwardRef, useImperativeHandle } from 'react'
import { View, StyleSheet } from 'react-native'

type EditorPagerProps = {
  children: React.ReactNode
  onPageChange?: (index: number) => void
}

export type EditorPagerRef = {
  setPage: (index: number) => void
}

/**
 * Version web del EditorPager.
 * En web mostramos todo el contenido en scroll, no como pager.
 */
export const EditorPager = forwardRef<EditorPagerRef, EditorPagerProps>(
  function EditorPager({ children }, ref) {
    useImperativeHandle(ref, () => ({
      setPage: () => {
        // No-op en web
      },
    }))

    return <View style={styles.container}>{children}</View>
  }
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
