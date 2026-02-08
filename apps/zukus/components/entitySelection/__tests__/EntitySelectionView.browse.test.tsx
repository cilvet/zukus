import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EntitySelectionView } from '../EntitySelectionView'
import type { ModeConfig } from '../types'
import type { StandardEntity } from '@zukus/core'
import { ThemeProvider } from '../../../ui/contexts/ThemeContext'
import type { ReactNode } from 'react'

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

type TestEntity = StandardEntity & {
  image?: string
}

function entity(id: string, name: string, overrides: Partial<TestEntity> = {}): TestEntity {
  return {
    id,
    name,
    entityType: 'spell',
    ...overrides,
  }
}

const browseConfig: ModeConfig = { mode: 'browse' }

describe('EntitySelectionView - browse mode', () => {
  const spells: TestEntity[] = [
    entity('fireball', 'Fireball', { description: 'Deals fire damage' }),
    entity('magic-missile', 'Magic Missile', { description: 'Force damage' }),
    entity('shield', 'Shield', { description: 'AC bonus' }),
  ]

  it('renders entities without action buttons', () => {
    render(
      <EntitySelectionView
        entities={spells}
        modeConfig={browseConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    expect(screen.getByText('Fireball')).toBeInTheDocument()
    expect(screen.getByText('Magic Missile')).toBeInTheDocument()
    expect(screen.getByText('Shield')).toBeInTheDocument()
    // No action buttons like "Seleccionar" or "Preparar"
    expect(screen.queryByText('Seleccionar')).not.toBeInTheDocument()
    expect(screen.queryByText('Preparar')).not.toBeInTheDocument()
  })

  it('always shows search bar even for small lists', () => {
    render(
      <EntitySelectionView
        entities={spells}
        modeConfig={browseConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    expect(screen.getByTestId('search-input')).toBeInTheDocument()
  })

  it('filters entities by search query', () => {
    render(
      <EntitySelectionView
        entities={spells}
        modeConfig={browseConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'Shield' } })

    expect(screen.getByText('Shield')).toBeInTheDocument()
    expect(screen.queryByText('Fireball')).not.toBeInTheDocument()
    expect(screen.queryByText('Magic Missile')).not.toBeInTheDocument()
  })

  it('shows results count with custom labels', () => {
    render(
      <EntitySelectionView
        entities={spells}
        modeConfig={browseConfig}
        onEntityPress={vi.fn()}
        resultLabelSingular="entidad"
        resultLabelPlural="entidades"
      />,
      { wrapper }
    )

    expect(screen.getByText('3 entidades')).toBeInTheDocument()
  })

  it('shows empty state when search has no results', () => {
    render(
      <EntitySelectionView
        entities={spells}
        modeConfig={browseConfig}
        onEntityPress={vi.fn()}
        emptySearchText="No se encontraron resultados."
      />,
      { wrapper }
    )

    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    expect(screen.getByText('No se encontraron resultados.')).toBeInTheDocument()
  })

  it('calls onEntityPress when pressing a row', () => {
    const onEntityPress = vi.fn()

    render(
      <EntitySelectionView
        entities={spells}
        modeConfig={browseConfig}
        onEntityPress={onEntityPress}
      />,
      { wrapper }
    )

    fireEvent.click(screen.getByText('Fireball'))

    expect(onEntityPress).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'fireball', name: 'Fireball' })
    )
  })

  it('does not render SelectionBar or CounterBar', () => {
    render(
      <EntitySelectionView
        entities={spells}
        modeConfig={browseConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    expect(screen.queryByTestId('selection-bar')).not.toBeInTheDocument()
    expect(screen.queryByTestId('counter-bar')).not.toBeInTheDocument()
  })

  it('shows empty text when no entities', () => {
    render(
      <EntitySelectionView
        entities={[]}
        modeConfig={browseConfig}
        onEntityPress={vi.fn()}
        emptyText="No hay entidades disponibles."
      />,
      { wrapper }
    )

    expect(screen.getByText('No hay entidades disponibles.')).toBeInTheDocument()
  })
})
