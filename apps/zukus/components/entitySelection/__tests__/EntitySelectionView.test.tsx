import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EntitySelectionView } from '../EntitySelectionView'
import type { ModeConfig } from '../types'
import type { StandardEntity, EntityInstance, FilterResult, EntityFilterConfig } from '@zukus/core'
import { ThemeProvider } from '../../../ui/contexts/ThemeContext'
import type { ReactNode } from 'react'

// ============================================================================
// Test Helpers
// ============================================================================

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

type TestEntity = StandardEntity & {
  image?: string
  classData?: { classLevels: Record<string, number> }
  school?: string
}

function entity(id: string, name: string, overrides: Partial<TestEntity> = {}): TestEntity {
  return {
    id,
    name,
    entityType: 'spell',
    ...overrides,
  }
}

function entityInstance(entityData: StandardEntity, origin = 'test'): EntityInstance {
  return {
    instanceId: `${entityData.id}@${origin}`,
    entity: entityData,
    applicable: true,
    origin,
  }
}

function filterResult(entityData: StandardEntity, matches = true): FilterResult<StandardEntity> {
  return {
    entity: entityData,
    matches,
    evaluatedConditions: [],
  }
}

// ============================================================================
// Scenario: Counter mode - Preparar conjuros de nivel 1 del Mago
// ============================================================================

describe('EntitySelectionView - counter mode (prepare spells)', () => {
  const spells: TestEntity[] = [
    entity('fireball', 'Fireball', {
      classData: { classLevels: { wizard: 3 } },
      school: 'evocation',
    }),
    entity('magic-missile', 'Magic Missile', {
      classData: { classLevels: { wizard: 1 } },
      school: 'evocation',
    }),
    entity('shield', 'Shield', {
      classData: { classLevels: { wizard: 1 } },
      school: 'abjuration',
    }),
    entity('cure-light', 'Cure Light Wounds', {
      classData: { classLevels: { cleric: 1 } },
      school: 'conjuration',
    }),
  ]

  const spellFilterConfig: EntityFilterConfig = {
    entityType: 'spell',
    label: 'Conjuros',
    filters: [
      {
        kind: 'relation',
        id: 'classLevel',
        label: 'Clase y Nivel',
        relationMapPath: 'classData.classLevels',
        primary: {
          id: 'class',
          label: 'Clase',
          options: [
            { value: 'wizard', label: 'Mago' },
            { value: 'cleric', label: 'Clérigo' },
          ],
        },
        secondary: {
          id: 'level',
          label: 'Nivel',
          labelFormat: 'Nivel {value}',
        },
      },
      {
        kind: 'facet',
        id: 'school',
        label: 'Escuela',
        facetField: 'school',
        multiSelect: true,
      },
    ],
  }

  const onExecute = vi.fn().mockReturnValue({ success: true })

  const counterConfig: ModeConfig = {
    mode: 'counter',
    action: { id: 'prepare', label: 'Preparar', icon: 'check' },
    handlers: {
      onExecute,
      getProgress: () => ({ current: 1, max: 4 }),
      getProgressLabel: () => '1 de 4 preparados',
    },
    closeOnComplete: true,
  }

  it('renders spell list with filter config applied', () => {
    render(
      <EntitySelectionView
        entities={spells}
        modeConfig={counterConfig}
        onEntityPress={vi.fn()}
        filterConfig={spellFilterConfig}
        initialFilterOverrides={{ class: 'wizard', level: 1 }}
      />,
      { wrapper }
    )

    // Wizard level 1 spells only
    expect(screen.getByText('Magic Missile')).toBeInTheDocument()
    expect(screen.getByText('Shield')).toBeInTheDocument()
    // Not wizard or not level 1
    expect(screen.queryByText('Fireball')).not.toBeInTheDocument()
    expect(screen.queryByText('Cure Light Wounds')).not.toBeInTheDocument()
  })

  it('shows search bar when many entities', () => {
    render(
      <EntitySelectionView
        entities={spells}
        modeConfig={counterConfig}
        onEntityPress={vi.fn()}
        filterConfig={spellFilterConfig}
      />,
      { wrapper }
    )

    expect(screen.getByTestId('search-input')).toBeInTheDocument()
  })

  it('shows counter bar with progress', () => {
    render(
      <EntitySelectionView
        entities={spells}
        modeConfig={counterConfig}
        onEntityPress={vi.fn()}
        filterConfig={spellFilterConfig}
      />,
      { wrapper }
    )

    expect(screen.getByText('1 de 4 preparados')).toBeInTheDocument()
  })

  it('filters by search query', () => {
    render(
      <EntitySelectionView
        entities={spells}
        modeConfig={counterConfig}
        onEntityPress={vi.fn()}
        filterConfig={spellFilterConfig}
        searchPlaceholder="Buscar por nombre..."
      />,
      { wrapper }
    )

    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'Shield' } })

    expect(screen.getByText('Shield')).toBeInTheDocument()
    expect(screen.queryByText('Fireball')).not.toBeInTheDocument()
  })

  it('shows badge from getBadge prop', () => {
    const getBadge = (e: TestEntity) => {
      const lvl = e.classData?.classLevels.wizard
      return lvl !== undefined ? `Nv ${lvl}` : null
    }

    render(
      <EntitySelectionView
        entities={[spells[0]!]} // Fireball wizard 3
        modeConfig={counterConfig}
        onEntityPress={vi.fn()}
        getBadge={getBadge}
      />,
      { wrapper }
    )

    expect(screen.getByText('Nv 3')).toBeInTheDocument()
  })
})

// ============================================================================
// Scenario: Dropdown mode - Comprar objeto en inventario
// ============================================================================

describe('EntitySelectionView - dropdown mode (buy items)', () => {
  type ItemEntity = StandardEntity & {
    weight?: number
    cost?: { amount: number; currency: string }
  }

  const items: ItemEntity[] = [
    entity('longsword', 'Longsword', { entityType: 'weapon' }),
    entity('chainmail', 'Chainmail', { entityType: 'armor' }),
    entity('rope', 'Rope', { entityType: 'item' }),
  ]

  const itemFilterConfig: EntityFilterConfig = {
    entityType: 'item',
    label: 'Items',
    filters: [
      {
        kind: 'entityType',
        id: 'entityType',
        label: 'Tipo',
        entityTypes: ['weapon', 'armor', 'item'],
        multiSelect: true,
        typeLabels: { weapon: 'Arma', armor: 'Armadura', item: 'Objeto' },
      },
    ],
  }

  const onExecute = vi.fn().mockReturnValue({ success: true })
  const getActionState = vi.fn().mockReturnValue({})

  const dropdownConfig: ModeConfig = {
    mode: 'dropdown',
    buttonLabel: 'Anadir',
    buttonIcon: 'plus',
    groups: [
      { label: 'Gratis', actions: [{ id: 'add', label: 'Anadir gratis', icon: 'box-open' }] },
      { label: 'Comercio', actions: [{ id: 'buy', label: 'Comprar', icon: 'coins' }] },
    ],
    handlers: {
      onExecute,
      getActionState,
    },
  }

  it('renders items list with filter config', () => {
    render(
      <EntitySelectionView
        entities={items}
        modeConfig={dropdownConfig}
        onEntityPress={vi.fn()}
        filterConfig={itemFilterConfig}
        initialFilterOverrides={{ entityType: ['weapon'] }}
      />,
      { wrapper }
    )

    expect(screen.getByText('Longsword')).toBeInTheDocument()
    expect(screen.queryByText('Chainmail')).not.toBeInTheDocument()
    expect(screen.queryByText('Rope')).not.toBeInTheDocument()
  })

  it('shows meta line for each item', () => {
    const getMetaLine = (item: ItemEntity) => {
      if (item.entityType === 'weapon') return 'Arma | 3 lb | 15 gp'
      return undefined
    }

    render(
      <EntitySelectionView
        entities={[items[0]!]}
        modeConfig={dropdownConfig}
        onEntityPress={vi.fn()}
        getMetaLine={getMetaLine}
      />,
      { wrapper }
    )

    expect(screen.getByText('Arma | 3 lb | 15 gp')).toBeInTheDocument()
  })

  it('shows results count', () => {
    render(
      <EntitySelectionView
        entities={items}
        modeConfig={dropdownConfig}
        onEntityPress={vi.fn()}
        resultLabelSingular="item"
        resultLabelPlural="items"
      />,
      { wrapper }
    )

    expect(screen.getByText('3 items')).toBeInTheDocument()
  })
})

// ============================================================================
// Scenario: Selection mode (small) - Elegir dote bonus de Fighter nivel 1
// ============================================================================

describe('EntitySelectionView - selection mode small (bonus feat)', () => {
  const feats = [
    entity('power-attack', 'Power Attack', { entityType: 'feat' }),
    entity('cleave', 'Cleave', { entityType: 'feat' }),
    entity('dodge', 'Dodge', { entityType: 'feat' }),
    entity('toughness', 'Toughness', { entityType: 'feat' }),
    entity('combat-reflexes', 'Combat Reflexes', { entityType: 'feat' }),
  ]

  const eligibleEntities: FilterResult<StandardEntity>[] = feats.map((f) =>
    filterResult(f, true)
  )

  it('renders checkboxes for small list and shows selection header', () => {
    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [],
      eligibleEntities,
      onSelect: vi.fn(),
      onDeselect: vi.fn(),
      min: 1,
      max: 1,
      selectionLabel: 'Dote de Combate Bonus',
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    // Header shows selection label
    expect(screen.getByText('Dote de Combate Bonus')).toBeInTheDocument()
    // Badge shows 0/1
    expect(screen.getByText('0/1')).toBeInTheDocument()
    // All feats visible
    expect(screen.getByText('Power Attack')).toBeInTheDocument()
    expect(screen.getByText('Cleave')).toBeInTheDocument()
    expect(screen.getByText('Combat Reflexes')).toBeInTheDocument()
  })

  it('does NOT show search bar for small list without filterConfig', () => {
    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [],
      eligibleEntities,
      onSelect: vi.fn(),
      onDeselect: vi.fn(),
      min: 1,
      max: 1,
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    expect(screen.queryByTestId('search-input')).not.toBeInTheDocument()
  })

  it('shows selected entity with badge update', () => {
    const selectedInstance = entityInstance(feats[0]!)

    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [selectedInstance],
      eligibleEntities,
      onSelect: vi.fn(),
      onDeselect: vi.fn(),
      min: 1,
      max: 1,
      selectionLabel: 'Dote de Combate Bonus',
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    // Badge shows 1/1 (in both SelectionHeader and SelectionBar)
    expect(screen.getByTestId('selection-badge')).toHaveTextContent('1/1')
  })
})

// ============================================================================
// Scenario: Selection mode (large) - Elegir dote de nivel del sistema
// ============================================================================

describe('EntitySelectionView - selection mode large (system feats)', () => {
  // Create 20 feats to trigger large mode
  const feats = Array.from({ length: 20 }, (_, i) =>
    entity(`feat-${i}`, `Feat ${i}`, { entityType: 'feat' })
  )

  const eligibleEntities: FilterResult<StandardEntity>[] = feats.map((f) =>
    filterResult(f, true)
  )

  it('shows search bar for large list', () => {
    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [],
      eligibleEntities,
      onSelect: vi.fn(),
      onDeselect: vi.fn(),
      min: 1,
      max: 1,
      selectionLabel: 'Dote de nivel',
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    expect(screen.getByTestId('search-input')).toBeInTheDocument()
  })

  it('shows selected chips for selected entities', () => {
    const selected = entityInstance(feats[0]!)

    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [selected],
      eligibleEntities,
      onSelect: vi.fn(),
      onDeselect: vi.fn(),
      min: 1,
      max: 1,
      selectionLabel: 'Dote de nivel',
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    // Chip with entity name visible in SelectionBar
    expect(screen.getByTestId('selection-bar')).toBeInTheDocument()
    expect(screen.getByText('Feat 0')).toBeInTheDocument()
    // Badge shows 1/1 (in SelectionHeader)
    expect(screen.getByTestId('selection-badge')).toHaveTextContent('1/1')
  })

  it('calls onDeselect when chip remove is pressed', () => {
    const selected = entityInstance(feats[0]!)
    const onDeselect = vi.fn()

    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [selected],
      eligibleEntities,
      onSelect: vi.fn(),
      onDeselect,
      min: 1,
      max: 1,
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    const removeButton = screen.getByTestId('selection-bar-chip-remove-feat-0')
    fireEvent.click(removeButton)

    expect(onDeselect).toHaveBeenCalledWith('feat-0@test')
  })

  it('shows header with progress', () => {
    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [],
      eligibleEntities,
      onSelect: vi.fn(),
      onDeselect: vi.fn(),
      min: 1,
      max: 2,
      selectionLabel: 'Dotes de nivel',
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    expect(screen.getByText('Dotes de nivel')).toBeInTheDocument()
    expect(screen.getByText('0/2')).toBeInTheDocument()
  })
})

// ============================================================================
// Scenario: Ineligible entities in selection mode
// ============================================================================

describe('EntitySelectionView - ineligible entities', () => {
  const feats = [
    entity('power-attack', 'Power Attack', { entityType: 'feat' }),
    entity('cleave', 'Cleave', { entityType: 'feat', description: 'Requires Power Attack' }),
    entity('great-cleave', 'Great Cleave', { entityType: 'feat' }),
  ]

  it('shows ineligible badge and disables row for non-matching entities', () => {
    const eligible: FilterResult<StandardEntity>[] = [
      filterResult(feats[0]!, true),
      filterResult(feats[1]!, false), // Not eligible
      filterResult(feats[2]!, true),
    ]

    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [],
      eligibleEntities: eligible,
      onSelect: vi.fn(),
      onDeselect: vi.fn(),
      min: 1,
      max: 1,
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    // All feats visible
    expect(screen.getByText('Power Attack')).toBeInTheDocument()
    expect(screen.getByText('Cleave')).toBeInTheDocument()
    expect(screen.getByText('Great Cleave')).toBeInTheDocument()

    // Ineligible badge
    expect(screen.getByText('No elegible')).toBeInTheDocument()
  })
})

// ============================================================================
// Scenario: Empty states
// ============================================================================

describe('EntitySelectionView - empty states', () => {
  it('shows empty text when no entities', () => {
    const config: ModeConfig = {
      mode: 'counter',
      action: { id: 'add', label: 'Add' },
      handlers: {
        onExecute: vi.fn().mockReturnValue({ success: true }),
        getProgress: () => ({ current: 0, max: 0 }),
        getProgressLabel: () => '0 de 0',
      },
    }

    render(
      <EntitySelectionView
        entities={[]}
        modeConfig={config}
        onEntityPress={vi.fn()}
        emptyText="No hay elementos disponibles."
      />,
      { wrapper }
    )

    expect(screen.getByText('No hay elementos disponibles.')).toBeInTheDocument()
  })

  it('shows empty search text when search has no results', () => {
    const spells = [entity('fireball', 'Fireball')]
    const config: ModeConfig = {
      mode: 'counter',
      action: { id: 'add', label: 'Add' },
      handlers: {
        onExecute: vi.fn().mockReturnValue({ success: true }),
        getProgress: () => ({ current: 0, max: 1 }),
        getProgressLabel: () => '0 de 1',
      },
    }

    render(
      <EntitySelectionView
        entities={spells}
        modeConfig={config}
        onEntityPress={vi.fn()}
        emptySearchText="No se encontraron resultados."
        filterConfig={{
          entityType: 'spell',
          label: 'Conjuros',
          filters: [],
        }}
      />,
      { wrapper }
    )

    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    expect(screen.getByText('No se encontraron resultados.')).toBeInTheDocument()
  })
})

// ============================================================================
// Scenario: Counter mode interactions
// ============================================================================

describe('EntitySelectionView - counter mode interactions', () => {
  const spells: TestEntity[] = [
    entity('magic-missile', 'Magic Missile', {
      classData: { classLevels: { wizard: 1 } },
      school: 'evocation',
    }),
    entity('shield', 'Shield', {
      classData: { classLevels: { wizard: 1 } },
      school: 'abjuration',
    }),
  ]

  it('calls onExecute when clicking the action button', () => {
    const onExecute = vi.fn().mockReturnValue({ success: true })

    const counterConfig: ModeConfig = {
      mode: 'counter',
      action: { id: 'prepare', label: 'Preparar', icon: 'check' },
      handlers: {
        onExecute,
        getProgress: () => ({ current: 1, max: 4 }),
        getProgressLabel: () => '1 de 4 preparados',
      },
    }

    render(
      <EntitySelectionView
        entities={spells}
        modeConfig={counterConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    const buttons = screen.getAllByText('Preparar')
    fireEvent.click(buttons[0]!)

    expect(onExecute).toHaveBeenCalledWith('prepare', 'magic-missile')
  })

  it('calls onEntityPress when clicking on entity name', () => {
    const onEntityPress = vi.fn()
    const onExecute = vi.fn().mockReturnValue({ success: true })

    const counterConfig: ModeConfig = {
      mode: 'counter',
      action: { id: 'prepare', label: 'Preparar', icon: 'check' },
      handlers: {
        onExecute,
        getProgress: () => ({ current: 1, max: 4 }),
        getProgressLabel: () => '1 de 4 preparados',
      },
    }

    render(
      <EntitySelectionView
        entities={spells}
        modeConfig={counterConfig}
        onEntityPress={onEntityPress}
      />,
      { wrapper }
    )

    fireEvent.click(screen.getByText('Magic Missile'))

    expect(onEntityPress).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'magic-missile', name: 'Magic Missile' })
    )
  })

  it('shows OK button when counter is complete and calls onComplete', () => {
    const onComplete = vi.fn()
    const onExecute = vi.fn().mockReturnValue({ success: true })

    const counterConfig: ModeConfig = {
      mode: 'counter',
      action: { id: 'prepare', label: 'Preparar', icon: 'check' },
      handlers: {
        onExecute,
        getProgress: () => ({ current: 4, max: 4 }),
        getProgressLabel: () => '4 de 4 preparados',
        onComplete,
      },
    }

    render(
      <EntitySelectionView
        entities={spells}
        modeConfig={counterConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    expect(screen.getByText('OK')).toBeInTheDocument()

    fireEvent.click(screen.getByText('OK'))

    expect(onComplete).toHaveBeenCalled()
  })
})

// ============================================================================
// Scenario: Dropdown mode interactions
// ============================================================================

describe('EntitySelectionView - dropdown mode interactions', () => {
  type ItemEntity = StandardEntity & {
    weight?: number
    cost?: { amount: number; currency: string }
  }

  const items: ItemEntity[] = [
    entity('longsword', 'Longsword', { entityType: 'weapon' }),
    entity('chainmail', 'Chainmail', { entityType: 'armor' }),
  ]

  it('dropdown actions are visible in desktop (popover always rendered in mock)', () => {
    const onExecute = vi.fn().mockReturnValue({ success: true })

    const dropdownConfig: ModeConfig = {
      mode: 'dropdown',
      buttonLabel: 'Anadir',
      buttonIcon: 'plus',
      groups: [
        { label: 'Gratis', actions: [{ id: 'add', label: 'Anadir gratis', icon: 'box-open' }] },
        { label: 'Comercio', actions: [{ id: 'buy', label: 'Comprar', icon: 'coins' }] },
      ],
      handlers: { onExecute },
    }

    render(
      <EntitySelectionView
        entities={items}
        modeConfig={dropdownConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    expect(screen.getAllByText('Anadir gratis').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Comprar').length).toBeGreaterThan(0)
  })

  it('calls onExecute when clicking a popover action', () => {
    const onExecute = vi.fn().mockReturnValue({ success: true })

    const dropdownConfig: ModeConfig = {
      mode: 'dropdown',
      buttonLabel: 'Anadir',
      buttonIcon: 'plus',
      groups: [
        { label: 'Gratis', actions: [{ id: 'add', label: 'Anadir gratis', icon: 'box-open' }] },
        { label: 'Comercio', actions: [{ id: 'buy', label: 'Comprar', icon: 'coins' }] },
      ],
      handlers: { onExecute },
    }

    render(
      <EntitySelectionView
        entities={items}
        modeConfig={dropdownConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    // Each item has its own popover with "Anadir gratis"
    const addButtons = screen.getAllByText('Anadir gratis')
    // Click the first one (for longsword)
    fireEvent.click(addButtons[0]!)

    expect(onExecute).toHaveBeenCalledWith('add', 'longsword')
  })

  it('shows subtext from getActionState', () => {
    const onExecute = vi.fn().mockReturnValue({ success: true })
    const getActionState = vi.fn().mockImplementation((actionId: string) => {
      if (actionId === 'buy') return { subtext: '15 gp' }
      return {}
    })

    const dropdownConfig: ModeConfig = {
      mode: 'dropdown',
      buttonLabel: 'Anadir',
      buttonIcon: 'plus',
      groups: [
        { label: 'Gratis', actions: [{ id: 'add', label: 'Anadir gratis', icon: 'box-open' }] },
        { label: 'Comercio', actions: [{ id: 'buy', label: 'Comprar', icon: 'coins' }] },
      ],
      handlers: { onExecute, getActionState },
    }

    render(
      <EntitySelectionView
        entities={items}
        modeConfig={dropdownConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    expect(screen.getAllByText('15 gp').length).toBeGreaterThan(0)
  })

  it('calls onEntityPress when clicking on entity name', () => {
    const onEntityPress = vi.fn()
    const onExecute = vi.fn().mockReturnValue({ success: true })

    const dropdownConfig: ModeConfig = {
      mode: 'dropdown',
      buttonLabel: 'Anadir',
      buttonIcon: 'plus',
      groups: [
        { label: 'Gratis', actions: [{ id: 'add', label: 'Anadir gratis', icon: 'box-open' }] },
      ],
      handlers: { onExecute },
    }

    render(
      <EntitySelectionView
        entities={items}
        modeConfig={dropdownConfig}
        onEntityPress={onEntityPress}
      />,
      { wrapper }
    )

    fireEvent.click(screen.getByText('Longsword'))

    expect(onEntityPress).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'longsword', name: 'Longsword' })
    )
  })
})

// ============================================================================
// Scenario: Selection mode small interactions
// ============================================================================

describe('EntitySelectionView - selection mode small interactions', () => {
  const feats = [
    entity('power-attack', 'Power Attack', { entityType: 'feat' }),
    entity('cleave', 'Cleave', { entityType: 'feat' }),
    entity('dodge', 'Dodge', { entityType: 'feat' }),
    entity('toughness', 'Toughness', { entityType: 'feat' }),
    entity('combat-reflexes', 'Combat Reflexes', { entityType: 'feat' }),
  ]

  const eligibleEntities: FilterResult<StandardEntity>[] = feats.map((f) =>
    filterResult(f, true)
  )

  it('calls onSelect when clicking an unselected row', () => {
    const onSelect = vi.fn()

    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [],
      eligibleEntities,
      onSelect,
      onDeselect: vi.fn(),
      min: 1,
      max: 2,
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    fireEvent.click(screen.getByText('Power Attack'))

    expect(onSelect).toHaveBeenCalledWith('power-attack')
  })

  it('calls onDeselect when clicking a selected row', () => {
    const onDeselect = vi.fn()
    const selectedInstance = entityInstance(feats[0]!)

    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [selectedInstance],
      eligibleEntities,
      onSelect: vi.fn(),
      onDeselect,
      min: 1,
      max: 2,
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    // "Power Attack" appears both in SelectionRow and SelectionBar chip — click the first (row)
    const powerAttacks = screen.getAllByText('Power Attack')
    fireEvent.click(powerAttacks[0]!)

    expect(onDeselect).toHaveBeenCalledWith('power-attack@test')
  })

  it('does not call onSelect when max is reached and row is not selected', () => {
    const onSelect = vi.fn()
    const selectedInstance = entityInstance(feats[0]!)

    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [selectedInstance],
      eligibleEntities,
      onSelect,
      onDeselect: vi.fn(),
      min: 1,
      max: 1,
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    // Cleave is not selected and max is reached
    fireEvent.click(screen.getByText('Cleave'))

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('does not call onSelect for ineligible entity', () => {
    const onSelect = vi.fn()

    const mixedEligibility: FilterResult<StandardEntity>[] = [
      filterResult(feats[0]!, true),
      filterResult(feats[1]!, false), // Not eligible
      filterResult(feats[2]!, true),
      filterResult(feats[3]!, true),
      filterResult(feats[4]!, true),
    ]

    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [],
      eligibleEntities: mixedEligibility,
      onSelect,
      onDeselect: vi.fn(),
      min: 1,
      max: 2,
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    // Cleave is ineligible
    fireEvent.click(screen.getByText('Cleave'))

    expect(onSelect).not.toHaveBeenCalled()
  })
})

// ============================================================================
// Scenario: Selection mode large interactions
// ============================================================================

describe('EntitySelectionView - selection mode large interactions', () => {
  const feats = Array.from({ length: 20 }, (_, i) =>
    entity(`feat-${i}`, `Feat ${i}`, { entityType: 'feat' })
  )

  const eligibleEntities: FilterResult<StandardEntity>[] = feats.map((f) =>
    filterResult(f, true)
  )

  it('calls onSelect when clicking "Seleccionar" button', () => {
    const onSelect = vi.fn()

    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [],
      eligibleEntities,
      onSelect,
      onDeselect: vi.fn(),
      min: 1,
      max: 2,
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    const selectButtons = screen.getAllByText('Seleccionar')
    fireEvent.click(selectButtons[0]!)

    expect(onSelect).toHaveBeenCalledWith('feat-0')
  })

  it('does not show selected entities in the main list', () => {
    const selected = entityInstance(feats[0]!)

    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [selected],
      eligibleEntities,
      onSelect: vi.fn(),
      onDeselect: vi.fn(),
      min: 1,
      max: 2,
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    // Feat 0 appears in chips but NOT with a "Seleccionar" button row
    const selectButtons = screen.getAllByText('Seleccionar')
    // There should be 19 select buttons (20 feats minus 1 selected)
    expect(selectButtons).toHaveLength(19)

    // Feat 0 is still visible (in the chips area)
    expect(screen.getByText('Feat 0')).toBeInTheDocument()
  })

  it('filters entities by search query', () => {
    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [],
      eligibleEntities,
      onSelect: vi.fn(),
      onDeselect: vi.fn(),
      min: 1,
      max: 2,
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'Feat 5' } })

    // Only "Feat 5" matches exactly
    expect(screen.getByText('Feat 5')).toBeInTheDocument()

    // Other feats should not be visible
    expect(screen.queryByText('Feat 0')).not.toBeInTheDocument()
    expect(screen.queryByText('Feat 3')).not.toBeInTheDocument()
    expect(screen.queryByText('Feat 15')).not.toBeInTheDocument()
  })
})

// ============================================================================
// Scenario: SelectionBar
// ============================================================================

describe('EntitySelectionView - SelectionBar', () => {
  const feats = Array.from({ length: 20 }, (_, i) =>
    entity(`feat-${i}`, `Feat ${i}`, { entityType: 'feat' })
  )

  const eligibleEntities: FilterResult<StandardEntity>[] = feats.map((f) =>
    filterResult(f, true)
  )

  it('renders chips with names of selected entities', () => {
    const selected = [entityInstance(feats[0]!), entityInstance(feats[1]!)]

    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: selected,
      eligibleEntities,
      onSelect: vi.fn(),
      onDeselect: vi.fn(),
      min: 1,
      max: 3,
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    expect(screen.getByTestId('selection-bar')).toBeInTheDocument()
    expect(screen.getByText('Feat 0')).toBeInTheDocument()
    expect(screen.getByText('Feat 1')).toBeInTheDocument()
  })

  it('calls onDeselect with instanceId when chip remove is pressed', () => {
    const selected = entityInstance(feats[2]!)
    const onDeselect = vi.fn()

    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [selected],
      eligibleEntities,
      onSelect: vi.fn(),
      onDeselect,
      min: 1,
      max: 2,
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    fireEvent.click(screen.getByTestId('selection-bar-chip-remove-feat-2'))

    expect(onDeselect).toHaveBeenCalledWith('feat-2@test')
  })

  it('does not render SelectionBar when no entities are selected', () => {
    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [],
      eligibleEntities,
      onSelect: vi.fn(),
      onDeselect: vi.fn(),
      min: 1,
      max: 2,
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    expect(screen.queryByTestId('selection-bar')).not.toBeInTheDocument()
  })

  it('shows badge with progress in SelectionBar', () => {
    const selected = entityInstance(feats[0]!)

    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [selected],
      eligibleEntities,
      onSelect: vi.fn(),
      onDeselect: vi.fn(),
      min: 1,
      max: 2,
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    expect(screen.getByTestId('selection-bar-badge')).toHaveTextContent('1/2')
  })
})

// ============================================================================
// Scenario: Disabled state when max reached
// ============================================================================

describe('EntitySelectionView - disabled when max reached', () => {
  it('disables "Seleccionar" button in large selection when max is reached', () => {
    const feats = Array.from({ length: 20 }, (_, i) =>
      entity(`feat-${i}`, `Feat ${i}`, { entityType: 'feat' })
    )
    const eligibleEntities: FilterResult<StandardEntity>[] = feats.map((f) =>
      filterResult(f, true)
    )
    const selected = entityInstance(feats[0]!)
    const onSelect = vi.fn()

    const selectionConfig: ModeConfig = {
      mode: 'selection',
      selectedEntities: [selected],
      eligibleEntities,
      onSelect,
      onDeselect: vi.fn(),
      min: 1,
      max: 1,
    }

    render(
      <EntitySelectionView
        entities={feats}
        modeConfig={selectionConfig}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    // All "Seleccionar" buttons should be present but clicking them should not call onSelect
    // because handleMobileButtonPress in EntityRowWithMenu checks buttonDisabled
    const selectButtons = screen.getAllByText('Seleccionar')
    fireEvent.click(selectButtons[0]!)

    expect(onSelect).not.toHaveBeenCalled()
  })
})

// ============================================================================
// Scenario: Sticky header
// ============================================================================

describe('EntitySelectionView - sticky header', () => {
  it('search bar is present outside the FlashList', () => {
    const spells = Array.from({ length: 20 }, (_, i) =>
      entity(`spell-${i}`, `Spell ${i}`)
    )
    const config: ModeConfig = {
      mode: 'counter',
      action: { id: 'prepare', label: 'Preparar', icon: 'check' },
      handlers: {
        onExecute: vi.fn().mockReturnValue({ success: true }),
        getProgress: () => ({ current: 0, max: 5 }),
        getProgressLabel: () => '0 de 5',
      },
    }

    render(
      <EntitySelectionView
        entities={spells}
        modeConfig={config}
        onEntityPress={vi.fn()}
      />,
      { wrapper }
    )

    // Search bar should be found (it's now in the sticky header, outside FlashList)
    expect(screen.getByTestId('search-input')).toBeInTheDocument()

    // FlashList is also present
    expect(screen.getByTestId('flash-list')).toBeInTheDocument()

    // Verify search bar is NOT inside the flash-list element
    const flashList = screen.getByTestId('flash-list')
    const searchInput = screen.getByTestId('search-input')
    expect(flashList.contains(searchInput)).toBe(false)
  })
})
