# Spell Actions and Resources System Design

This document outlines the research and design considerations for implementing spell actions and resource systems in our D&D 3.5 character calculation library.

## Research Findings: Healing and Damage Types in D&D 3.5

### Healing/Recovery Types

Based on research into D&D 3.5 mechanics, our action system needs to handle these types of healing and recovery:

#### Hit Point Recovery
- **Hit Point Healing**: Direct restoration of lost hit points
- **Temporary Hit Points**: Bonus HP that are lost first
- **Fast Healing**: Ongoing HP regeneration per round
- **Regeneration**: HP recovery that can regrow lost body parts

#### Ability Score Recovery  
- **Ability Damage Healing**: Restores temporary ability score reductions (natural recovery at 1 point/day)
- **Ability Drain Recovery**: Restores permanent ability score reductions (requires magic like *restoration*)

#### Negative Level Recovery
- **Negative Level Removal**: Removes energy drain effects
- **Level Loss Recovery**: Restores actual lost character levels (extremely rare)

#### Condition Recovery
- **Disease Healing**: Removes diseases and their effects
- **Poison Neutralization**: Removes poison effects
- **Curse Removal**: Removes magical curses
- **Status Condition Removal**: Removes conditions like paralysis, blindness, etc.

#### Resource Restoration
- **Spell Slot Recovery**: Restores expended spell slots
- **Daily Ability Recovery**: Restores limited-use class abilities
- **Magic Item Charges**: Restores item uses

### Damage Types in D&D 3.5

Our damage action system needs to handle these damage categories:

#### Physical Damage Types
- **Bludgeoning**: Blunt force trauma (hammers, clubs, crushing)
- **Piercing**: Puncturing attacks (spears, arrows, bites)
- **Slashing**: Cutting attacks (swords, axes, claws)

#### Energy Damage Types
- **Acid**: Corrosive damage that dissolves materials
- **Cold**: Freezing damage causing hypothermia effects
- **Electricity**: Electric shock damage
- **Fire**: Burning damage and heat
- **Sonic**: Sound-based damage causing concussion

#### Special Damage Types
- **Force**: Pure magical energy damage
- **Negative Energy**: Life-draining damage (now called "Necrotic" in later editions)
- **Positive Energy**: Healing energy that can harm undead

#### Specialized Damage Types (from supplements)
- **Desiccation**: Dehydration damage
- **Vile**: Evil-aligned damage
- **Sacred**: Good-aligned damage  
- **Divine**: Deity-sourced damage
- **Precision**: Damage that bypasses certain defenses

#### Damage Modifiers
- **Nonlethal Damage**: Subdual damage that doesn't kill
- **Ability Damage**: Temporary ability score reduction
- **Ability Drain**: Permanent ability score reduction
- **Energy Drain**: Causes negative levels
- **Untyped Damage**: Damage with no specific type

## Action System Design Considerations

### Scope and Priority

**High Priority Actions (Character Sheet Impact):**
1. **HP Actions**: Healing/damage that affects hit points
2. **Ability Actions**: Ability damage/drain and recovery
3. **Buff Actions**: Apply temporary changes to character stats
4. **Resource Actions**: Restore/drain spell slots, daily abilities

**Medium Priority Actions:**
1. **Condition Actions**: Apply/remove status conditions
2. **Negative Level Actions**: Energy drain and restoration

**Low Priority Actions (Future Implementation):**
1. **Transformation Actions**: Polymorph, lycanthropy, etc.
2. **Utility Actions**: Teleportation, divination (no mechanical effect)

### Integration with Existing Systems

**Buff System Integration:**
- Spell effects that grant temporary bonuses should integrate with existing `buffs.ts`
- Consider creating "BuffV2" if significant changes needed
- Duration system needed for future implementation (rounds, minutes, hours, days)

**Damage/Healing Unification:**
- Consider unified "HP_MODIFICATION" action type
- Positive values = healing, negative values = damage
- Investigate if this approach works for all healing/damage types

### Duration System (Future Need)

Even though duration isn't a current priority, define the structure now for future compatibility:

```typescript
type ActionDuration = {
  type: 'instantaneous' | 'rounds' | 'minutes' | 'hours' | 'days' | 'permanent';
  amount?: number; // undefined for instantaneous/permanent
  concentration?: boolean; // requires caster concentration
}
```

### Resource System Dependency

**Critical Decision Point**: Some actions require resources to function (spell slots, daily abilities), but actions themselves might also consume resources.

**Resource System Needs:**
- Spell slots per day by class and level
- Daily ability uses (channel divinity, rage, etc.)
- Magic item charges
- Resource refresh mechanics (daily, encounter-based, at-will)

**Recommendation**: Design basic resource framework before action system, since:
1. Actions need to reference available resources
2. Actions may consume resources when used
3. Some actions restore resources

## Proposed Implementation Order

1. **Create basic resource framework** - Define resource types and tracking
2. **Design action system** - Core action types and structure
3. **Implement HP actions** - Healing and damage
4. **Integrate with buff system** - Temporary character modifications
5. **Add ability score actions** - Damage, drain, and recovery
6. **Expand with duration system** - For future buff/effect tracking

## Key Research Sources

- D&D 3.5 SRD Special Abilities section
- Energy Drain and Negative Levels mechanics
- Injury and Death rules
- Min/Max Forum damage type compilation
- Multiple healing/damage type examples from official sources

---

*This research establishes the foundation for a comprehensive action system that can handle the full complexity of D&D 3.5 spell effects while maintaining compatibility with our existing character calculation library.*

## Resource System Architecture Design

### Core Resource System Requirements

Based on the character calculation library architecture, the resource system must integrate seamlessly with the existing change and calculation pipeline while maintaining traceability and flexibility.

#### Multi-Source Resource Creation
- **Multiple Origins**: Resources can be created by items, feats, buffs, class features, racial features, and special features
- **Contextual Tracing**: All resources must include origin information similar to `ContextualizedChange`
- **Source Priority**: Resources from different sources may need stacking or override rules

#### Global Resource Management
- **Global Scope**: All resources are globally accessible across the character
- **Origin Traceability**: Each resource maintains information about its source (similar to ContextualizedChange pattern)
- **Conflict Resolution**: Multiple sources creating the same resource type need defined behavior

#### Data Persistence vs Calculation
- **Persistent Data**: Current resource values must be stored in `CharacterBaseData` for persistence between updates
- **Calculated Resources**: Available resources and their properties are recalculated during each character sheet calculation
- **Separation of Concerns**: Static data (current values) vs dynamic data (max values, availability)

#### Formula Integration
- **Variable Exposure**: Resources must be available as formula variables (e.g., `@resource.spellSlots.currentValue`)
- **Property Access**: All meaningful resource properties should be accessible in formulas:
  - `currentValue`: Current amount available
  - `maxValue`: Maximum possible value
  - `refreshType`: How the resource refreshes
  - `available`: Whether the resource is currently available
- **Naming Convention**: Use "value" terminology instead of "uses" to accommodate diverse resource types

#### Calculation Order and Compilation
- **Ordered Calculation**: Resources must be calculated in a specific order during character sheet calculation
- **Compilation System**: Similar to `compileCharacterChanges.ts`, create `compileCharacterResources.ts`
- **Source Processing**: Process resources from all sources (race, class, feats, items, buffs) in defined order

### Resource System Integration Points

#### CharacterBaseData Integration
```typescript
// Persistent resource data stored in character base data
type ResourceCurrentValues = {
  [resourceId: string]: {
    currentValue: number;
    // Any other persistent state
  }
}

// Added to CharacterBaseData
type CharacterBaseData = {
  // ... existing properties
  resourceCurrentValues?: ResourceCurrentValues;
}
```

#### Calculation Pipeline Integration
```typescript
// Calculated during character sheet generation
type CalculatedResources = {
  [resourceId: string]: {
    uniqueId: string;
    name: string;
    currentValue: number;  // From CharacterBaseData
    maxValue: number;      // Calculated from sources
    refreshType: ResourceRefreshType;
    available: boolean;    // Based on conditions/prerequisites
    sources: ResourceSource[];  // Traceability
  }
}
```

#### Formula Variable System
```typescript
// Resources exposed to formula system
type ResourceVariables = {
  resource: {
    [resourceId: string]: {
      currentValue: number;
      maxValue: number;
      available: boolean;
      // Other formula-accessible properties
    }
  }
}
```

### Resource Compilation Architecture

#### Source Types and Priority
1. **Racial Resources**: Base racial abilities
2. **Class Resources**: Spell slots, class features
3. **Feat Resources**: Additional uses, new resource types
4. **Item Resources**: Magic item charges, equipment-based resources
5. **Buff Resources**: Temporary resource modifications
6. **Special Feature Resources**: Custom character features

#### Contextual Resource Pattern
```typescript
type ContextualizedResource = Resource & {
  originId: string;
  originType: 'raceFeature' | 'classFeature' | 'feat' | 'item' | 'buff' | 'specialFeature';
  name: string;  // Source name for traceability
}
```

#### Resource Stacking and Conflicts
- **Same Resource from Multiple Sources**: Define behavior (stack, override, highest wins)
- **Resource Modifications**: Some sources modify existing resources rather than create new ones
- **Conditional Availability**: Resources may have prerequisites or conditions

### Implementation Considerations

#### Performance and Caching
- **Calculation Frequency**: Resources recalculated on every character sheet update
- **Optimization**: Consider caching strategies for expensive resource calculations
- **Incremental Updates**: Track which sources have changed to minimize recalculation

#### Error Handling and Validation
- **Invalid References**: Handle missing or invalid resource references in formulas
- **Circular Dependencies**: Prevent resources that depend on themselves
- **Value Constraints**: Ensure currentValue never exceeds maxValue

#### Future Extensibility
- **Action System Integration**: Resources will be consumed/restored by actions
- **Complex Resource Types**: Support for multi-dimensional resources (spell slots by level)
- **Temporary Resources**: Resources that exist only during certain conditions

This architecture ensures resources integrate seamlessly with the existing character calculation pipeline while maintaining the library's core principles of traceability, flexibility, and deterministic calculation.

## Variables vs Resources: Design Decision

### Context and Problem

During implementation planning, we identified two distinct needs that initially seemed like they could be unified:

1. **Custom Variables**: Calculated values exposed to the formula system (e.g., sneak attack dice amount, caster level)
2. **Resources**: Consumable/rechargeable character features (e.g., spell slots, daily abilities, item charges)

### Analysis of Approaches

#### Option 1: Unified System
Combine both concepts into a single Resource type that handles variables and consumables.

**Pros**: Single compilation system, unified codebase
**Cons**: Conceptually confusing, mixing calculated values with persistent state

#### Option 2: Separate Systems
Maintain Variables and Resources as completely distinct systems.

**Pros**: Clear conceptual separation, focused implementations
**Cons**: Two separate compilation systems

#### Option 3: Hybrid System  
Variables as base concept, Resources as extension with additional state.

**Pros**: Conceptual hierarchy, unified compilation
**Cons**: Still mixes different concerns

### Final Decision: Separate Systems

We decided on **Option 2: Separate Systems** because variables and resources serve fundamentally different purposes:

#### Custom Variables System
```typescript
export type CustomVariable = {
  uniqueId: string;
  name: string;
  description?: string;
  formula: Formula;
};
```

**Characteristics**:
- **Purpose**: Expose calculated values to formula system
- **State Management**: Always calculated, never persisted
- **Usage Pattern**: `@variables.custom.sneakAttackDiceAmount` in formulas
- **User Overrides**: Via Changes with `BonusType.REPLACEMENT`
- **Examples**: Sneak attack dice, caster level modifiers, conditional bonuses

#### Resources System
```typescript
export type Resource = {
  uniqueId: string;
  name: string;
  description?: string;
  refreshType?: ResourceRefreshType;
  maxValue?: Formula;
  minValue?: Formula;
  initialValue?: Formula;
};
```

**Characteristics**:
- **Purpose**: Manage consumable/rechargeable character features
- **State Management**: Persistent `currentValue` between sessions
- **Usage Pattern**: Action system consumption/restoration, resource management UI
- **Modification**: Actions that consume/restore values
- **Examples**: Spell slots, rage uses, magic item charges

### Variable Override Mechanism

Variables can be overridden by users using the existing Changes system:

```typescript
// Base variable (calculated from class levels)
const sneakAttackDice: CustomVariable = {
  uniqueId: 'sneakAttackDiceAmount',
  name: 'Sneak Attack Dice',
  formula: { expression: 'floor(@classLevels.rogue / 2)' }
};

// User override (replaces calculated value completely)
const userOverride: Change = {
  type: 'CUSTOM_VARIABLE',
  variableId: 'sneakAttackDiceAmount',
  bonusTypeId: 'REPLACEMENT', // Completely replaces calculated value
  formula: { expression: '8' }  // User forces to 8 dice
};
```

### Implementation Benefits

1. **Conceptual Clarity**: Each system has a focused purpose
2. **Leverages Existing Infrastructure**: Variables use Changes and bonus stacking
3. **User Flexibility**: Variables can be overridden without breaking the calculation model
4. **System Consistency**: Follows established patterns in the character calculation library
5. **Performance**: Separate compilation allows optimization for each use case

### Integration Points

#### Variables in Formula System
```typescript
// Variables available in formulas
type VariableContext = {
  custom: {
    [variableId: string]: number;
  }
}

// Usage in damage formulas
const sneakAttackDamage = {
  expression: '@variables.custom.sneakAttackDiceAmount d6'
};
```

#### Resources in Action System
```typescript
// Resources consumed by actions
const castSpell = {
  name: 'Cast Fireball',
  resourceCosts: [{
    resourceId: 'wizard-spell-slot-3',
    amount: 1
  }]
};
```

### Implementation Priority

1. **Custom Variables System**: Higher priority for formula integration
2. **Resources System**: Lower priority, needed for action system

This separation ensures both systems can evolve independently while serving their distinct purposes in the character calculation ecosystem.

---

*Updated with design decisions for Variables vs Resources separation - maintaining focused, purpose-driven systems that integrate cleanly with existing character calculation architecture.*
