import { useState } from 'react'
import SwipeableViews from 'react-swipeable-views'

type CharacterPagerProps = {
  children: React.ReactNode
}

/**
 * SwipeableViews para web - swipe entre secciones del personaje.
 */
export function CharacterPager({ children }: CharacterPagerProps) {
  const [index, setIndex] = useState(0)

  return (
    <SwipeableViews
      index={index}
      onChangeIndex={setIndex}
      style={{ flex: 1 }}
      containerStyle={{ height: '100%' }}
    >
      {children}
    </SwipeableViews>
  )
}
