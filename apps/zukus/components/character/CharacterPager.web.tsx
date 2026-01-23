import { forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import SwipeableViews from 'react-swipeable-views'

type CharacterPagerProps = {
  children: React.ReactNode
  onPageChange?: (index: number) => void
  onPageSettled?: (index: number) => void
}

export type CharacterPagerRef = {
  setPage: (index: number) => void
}

/**
 * SwipeableViews para web - swipe entre secciones del personaje.
 */
export const CharacterPager = forwardRef<CharacterPagerRef, CharacterPagerProps>(
  function CharacterPager({ children, onPageChange, onPageSettled }, ref) {
    const [index, setIndex] = useState(0)

    useImperativeHandle(ref, () => ({
      setPage: (newIndex: number) => {
        setIndex(newIndex)
      },
    }))

    const handleChangeIndex = (newIndex: number) => {
      setIndex(newIndex)
      onPageChange?.(newIndex)
      // En web, SwipeableViews no tiene transición parcial como PagerView,
      // así que onPageSettled se dispara inmediatamente después de onPageChange
      onPageSettled?.(newIndex)
    }

    // Inicializar con index 0
    useEffect(() => {
      onPageSettled?.(0)
    }, [])

    return (
      <SwipeableViews
        index={index}
        onChangeIndex={handleChangeIndex}
        style={{ flex: 1 }}
        containerStyle={{ height: '100%' }}
      >
        {children}
      </SwipeableViews>
    )
  }
)
