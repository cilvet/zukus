import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EntityRow } from '../EntityRow'
import type { ButtonConfig } from '../types'

const defaultButtonConfig: ButtonConfig = {
  type: 'counter',
  action: { id: 'add', label: 'Add', icon: 'plus' },
}

const defaultProps = {
  id: 'spell-1',
  name: 'Fireball',
  description: 'A bright streak flashes from your pointing finger.',
  metaLine: 'Level 3 | Evocation',
  badge: 'Nv 3',
  image: undefined,
  color: '#ffffff',
  placeholderColor: '#888888',
  accentColor: '#7aa2f7',
  buttonConfig: defaultButtonConfig,
  onPress: vi.fn(),
}

describe('EntityRow', () => {
  it('renders entity name', () => {
    render(<EntityRow {...defaultProps} />)
    expect(screen.getByText('Fireball')).toBeInTheDocument()
  })

  it('renders description and meta line', () => {
    render(<EntityRow {...defaultProps} />)
    expect(screen.getByText('Level 3 | Evocation')).toBeInTheDocument()
    expect(screen.getByText(/bright streak/)).toBeInTheDocument()
  })

  it('renders badge', () => {
    render(<EntityRow {...defaultProps} />)
    expect(screen.getByText('Nv 3')).toBeInTheDocument()
  })

  it('hides optional fields when not provided', () => {
    render(
      <EntityRow
        {...defaultProps}
        description={undefined}
        metaLine={undefined}
        badge={null}
      />
    )
    expect(screen.getByText('Fireball')).toBeInTheDocument()
    expect(screen.queryByText('Level 3 | Evocation')).not.toBeInTheDocument()
  })
})
