/**
 * Minimal FlashList mock - renders items using a simple div list.
 */
import React from 'react'

type FlashListProps<T> = {
  data: T[]
  renderItem: (info: { item: T; index: number }) => React.ReactNode
  keyExtractor?: (item: T, index: number) => string
  ListHeaderComponent?: React.ReactNode | (() => React.ReactNode)
  ListFooterComponent?: React.ReactNode | (() => React.ReactNode)
  ListEmptyComponent?: React.ReactNode | (() => React.ReactNode)
  estimatedItemSize?: number
  contentContainerStyle?: any
  [key: string]: any
}

export function FlashList<T>({
  data,
  renderItem,
  keyExtractor,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
}: FlashListProps<T>) {
  const renderOptional = (component: React.ReactNode | (() => React.ReactNode) | undefined) => {
    if (!component) return null
    if (typeof component === 'function') return component()
    return component
  }

  return (
    <div data-testid="flash-list">
      {renderOptional(ListHeaderComponent)}
      {data.length === 0
        ? renderOptional(ListEmptyComponent)
        : data.map((item, index) => (
            <div key={keyExtractor ? keyExtractor(item, index) : index}>
              {renderItem({ item, index })}
            </div>
          ))}
      {renderOptional(ListFooterComponent)}
    </div>
  )
}
