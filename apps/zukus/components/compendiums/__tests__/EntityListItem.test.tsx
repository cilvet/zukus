import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EntityListItem } from '../EntityListItem'
import type { StandardEntity } from '@zukus/core'
import { ThemeProvider } from '../../../ui/contexts/ThemeContext'
import type { ReactNode } from 'react'

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

function entity(overrides: Partial<StandardEntity> = {}): StandardEntity {
  return {
    id: 'test-entity',
    name: 'Test Entity',
    entityType: 'item',
    ...overrides,
  }
}

describe('EntityListItem', () => {
  it('renders entity name', () => {
    render(
      <EntityListItem entity={entity({ name: 'Longsword' })} onPress={vi.fn()} />,
      { wrapper }
    )

    expect(screen.getByText('Longsword')).toBeInTheDocument()
  })

  it('renders entity description', () => {
    render(
      <EntityListItem
        entity={entity({ description: 'A fine blade' })}
        onPress={vi.fn()}
      />,
      { wrapper }
    )

    expect(screen.getByText('A fine blade')).toBeInTheDocument()
  })

  it('renders first tag', () => {
    render(
      <EntityListItem
        entity={entity({ tags: ['Weapon', 'Martial'] })}
        onPress={vi.fn()}
      />,
      { wrapper }
    )

    expect(screen.getByText('Weapon')).toBeInTheDocument()
  })

  it('does not render description or tags when not present', () => {
    render(
      <EntityListItem entity={entity()} onPress={vi.fn()} />,
      { wrapper }
    )

    expect(screen.getByText('Test Entity')).toBeInTheDocument()
    // Only the name should be present
  })

  it('calls onPress when pressed', () => {
    const onPress = vi.fn()

    render(
      <EntityListItem entity={entity({ name: 'Shield' })} onPress={onPress} />,
      { wrapper }
    )

    fireEvent.click(screen.getByText('Shield'))

    expect(onPress).toHaveBeenCalled()
  })
})
