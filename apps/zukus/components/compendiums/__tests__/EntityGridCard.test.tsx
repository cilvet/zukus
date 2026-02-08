import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EntityGridCard } from '../EntityGridCard'
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

describe('EntityGridCard', () => {
  it('renders entity name', () => {
    render(
      <EntityGridCard entity={entity({ name: 'Fireball' })} onPress={vi.fn()} />,
      { wrapper }
    )

    expect(screen.getByText('Fireball')).toBeInTheDocument()
  })

  it('renders entity description', () => {
    render(
      <EntityGridCard
        entity={entity({ description: 'Deals 6d6 fire damage' })}
        onPress={vi.fn()}
      />,
      { wrapper }
    )

    expect(screen.getByText('Deals 6d6 fire damage')).toBeInTheDocument()
  })

  it('renders up to 2 tags joined by comma', () => {
    render(
      <EntityGridCard
        entity={entity({ tags: ['Evocation', 'Fire', 'Extra'] })}
        onPress={vi.fn()}
      />,
      { wrapper }
    )

    expect(screen.getByText('Evocation, Fire')).toBeInTheDocument()
  })

  it('calls onPress when pressed', () => {
    const onPress = vi.fn()

    render(
      <EntityGridCard entity={entity({ name: 'Shield' })} onPress={onPress} />,
      { wrapper }
    )

    fireEvent.click(screen.getByText('Shield'))

    expect(onPress).toHaveBeenCalled()
  })

  it('does not render description or tags when not present', () => {
    render(
      <EntityGridCard entity={entity()} onPress={vi.fn()} />,
      { wrapper }
    )

    expect(screen.getByText('Test Entity')).toBeInTheDocument()
  })
})
