# Resource System Types

Type definitions for a generic resource system in D&D 3.5 characters.

## Overview

This module defines the core types for tracking any character resource that has limited uses:

- **Spell Slots**: Daily spell casting
- **Class Abilities**: Rage, action surge, turn undead, etc.
- **Magic Items**: Charged items, daily-use items
- **Custom Features**: Any homebrew or special abilities

## Core Types

### Resource

```typescript
type Resource = {
  uniqueId: string;              // Unique identifier
  name: string;                  // Display name
  description?: string;          // Optional description
  refreshType: ResourceRefreshType; // When it refreshes
  maxValue: number;              // Maximum value
  currentValue: number;          // Current remaining value
};
```

### ComputedResource

```typescript
type ComputedResource = {
  uniqueId: string;
  name: string;
  description?: string;
  refreshType: ResourceRefreshType;
  maxValue: number;
  currentValue: number;
  minValue: number;
  maxValueSourceValues: SourceValue[];
  currentValueSourceValues: SourceValue[];
  minValueSourceValues: SourceValue[];
};
```

A computed resource includes full source value traceability for all its calculated properties, showing exactly how each value was derived from various character sources.

### ResourcePool

```typescript
type ResourcePool = Resource[];
```

A simple array of resources for easy management and processing.

### ResourceRefreshType

```typescript
type ResourceRefreshType = 
  | 'daily'        // Refreshes on long rest
  | 'encounter'    // Refreshes on short rest or new encounter
  | 'at-will'      // Unlimited uses
  | 'weekly'       // Refreshes weekly
  | 'never'        // Once used, gone forever
  | 'manual';      // Requires specific action to restore
```

## Design Philosophy

### Simplicity
- Single `Resource` type for everything
- No complex type hierarchies
- Easy to understand and extend

### Source Traceability
- `ComputedResource` provides complete visibility into how values are calculated
- Source values show contributions from different character sources
- Follows the same pattern as other calculated character statistics

### Extensibility
- Easy to add new resource types
- Simple integration with other systems
- Clear separation between base data and calculated values

## Usage Examples

### Basic Resource Structure

```typescript
import { Resource } from './core/domain/spells';

// Spell slot
const spellSlot: Resource = {
  uniqueId: 'cleric-heal-1',
  name: 'Heal Spell',
  description: 'First level healing spell',
  refreshType: 'daily',
  maxValue: 3,
  currentValue: 2
};

// Class ability
const smiteEvil: Resource = {
  uniqueId: 'paladin-smite-evil',
  name: 'Smite Evil',
  refreshType: 'daily',
  maxValue: 3,
  currentValue: 1
};

// Magic item
const wand: Resource = {
  uniqueId: 'wand-magic-missile',
  name: 'Wand of Magic Missile',
  refreshType: 'never',
  maxValue: 50,
  currentValue: 47
};
```

### Computed Resource Example

```typescript
import { ComputedResource } from './core/domain/spells';

const computedResource: ComputedResource = {
  uniqueId: 'paladin-smite-evil',
  name: 'Smite Evil',
  refreshType: 'daily',
  maxValue: 3,
  currentValue: 1,
  minValue: 0,
  maxValueSourceValues: [
    { value: 1, sourceUniqueId: 'paladin-base', sourceName: 'Paladin Base', bonusTypeId: 'BASE', relevant: true },
    { value: 2, sourceUniqueId: 'charisma-bonus', sourceName: 'Charisma Modifier', bonusTypeId: 'UNTYPED', relevant: true }
  ],
  currentValueSourceValues: [
    { value: 1, sourceUniqueId: 'current-remaining', sourceName: 'Current Remaining', bonusTypeId: 'BASE', relevant: true }
  ],
  minValueSourceValues: [
    { value: 0, sourceUniqueId: 'minimum-base', sourceName: 'Base Minimum', bonusTypeId: 'BASE', relevant: true }
  ]
};
```

### Resource Pool

```typescript
import { ResourcePool } from './core/domain/spells';

const characterResources: ResourcePool = [
  spellSlot,
  smiteEvil,
  wand
];
```

## Data Flow

### Base Resource Data
- Stored in character base data as simple `Resource` objects
- Current values persist between character updates
- Provides foundation for calculations

### Computed Resources
- Generated during character sheet calculation
- Include full source value traceability
- Show how max/min values are calculated from character features
- Track current value changes from actions and effects

## Integration Points

These types are designed to integrate with:

- **Character calculation system**: Resources generated from character data
- **Equipment system**: Magic items that provide resources
- **Class system**: Abilities that grant resources
- **Action system**: Actions that consume or restore resources
- **Source value system**: Full traceability of calculated values

## Files Structure

```
core/domain/spells/
├── resources.ts    # Core type definitions
├── index.ts       # Type exports
└── README.md     # This documentation
```

---

This type system provides a foundation for implementing resource management in D&D 3.5 applications while maintaining maximum flexibility, type safety, and full source value traceability. 