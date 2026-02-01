# Cleric - Spellcasting

## CGE Pattern: Prepared Vancian with Multiple Tracks

## Implementation Status: COMPLETE

The Cleric is fully implemented with tests in:
- `packages/core/core/domain/cge/examples.ts` (clericCGE)
- `packages/core/srd/cleric/clericClassFeatures.ts` (clericCGEConfig)
- `packages/core/core/domain/character/calculation/__tests__/cge/cleric.spec.ts`

---

## CGE Configuration

```typescript
const clericCGE: CGEConfig = {
  id: 'cleric-spells',
  classId: 'cleric',
  entityType: 'spell',
  levelPath: '@entity.levels.cleric',

  accessFilter: {
    field: 'lists',
    operator: 'contains',
    value: 'cleric',
  },

  // NO known config = full list access (no spellbook)

  tracks: [
    {
      id: 'base',
      label: 'base_slots',
      resource: {
        type: 'SLOTS',
        table: CLERIC_BASE_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      preparation: { type: 'BOUND' },
    },
    {
      id: 'domain',
      label: 'domain_slots',
      filter: {
        field: 'domains',
        operator: 'intersects',
        value: { expression: '@character.clericDomains' },
      },
      resource: {
        type: 'SLOTS',
        table: CLERIC_DOMAIN_SLOTS_TABLE,
        refresh: 'daily',
      },
      preparation: { type: 'BOUND' },
    },
  ],

  variables: {
    classPrefix: 'cleric.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.cleric',
  },

  labels: {
    known: 'divine_spells',
    prepared: 'prepared_spells',
    slot: 'spell_slot',
    action: 'cast',
  },
}
```

---

## Mechanical Summary

The Cleric is a divine prepared caster with full spell list access:

- **Access**: Full access to the cleric spell list (no spellbook needed)
- **Preparation**: BOUND - prepares specific spells in specific slots each day
- **Two independent tracks**: Base slots + Domain slots
- **Wisdom-based**: Bonus slots from high Wisdom

---

## Configuration Breakdown

### known: undefined (Full List Access)

The Cleric does NOT have a `known` configuration, meaning:
- Accesses the entire filtered spell list directly
- No spellbook to manage
- Can prepare any cleric spell of appropriate level each day

This differs from Wizard (known: UNLIMITED = has spellbook) and Sorcerer (known: LIMITED_PER_ENTITY_LEVEL = limited spells known).

### resource: SLOTS

Both tracks use SLOTS resource type with `LevelTable` progression:

**Base Track Table** (indices 0-9 = spell levels 0-9):
```typescript
{
  1: [3, 1, 0, 0, 0, 0, 0, 0, 0, 0],  // 3 orisons, 1 level-1
  3: [4, 2, 1, 0, 0, 0, 0, 0, 0, 0],  // Gains level 2
  5: [5, 3, 2, 1, 0, 0, 0, 0, 0, 0],  // Gains level 3
  // ... continues to level 20
}
```

**Domain Track Table** (1 slot per accessible spell level):
```typescript
{
  1: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],  // 1 domain slot level 1
  3: [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],  // +1 domain slot level 2
  5: [0, 1, 1, 1, 0, 0, 0, 0, 0, 0],  // +1 domain slot level 3
  // ... continues to level 20
}
```

### preparation: BOUND

Both tracks use BOUND preparation:
- Spells are prepared in specific slots
- Each slot holds one spell
- Slots are identified by `{trackId}:{level}-{index}` (e.g., "base:1-0", "domain:2-0")
- Same spell can be prepared in multiple slots

---

## Two Tracks System

The Cleric is unique in having two separate spell tracks:

### Track 1: Base (`id: 'base'`)
- Standard cleric spell slots
- Can prepare any spell from the cleric list
- Receives bonus slots from Wisdom via `bonusVariable: '@bonusSpells'`

### Track 2: Domain (`id: 'domain'`)
- 1 extra slot per spell level (levels 1-9, no cantrips)
- Filtered to only domain spells: `{ field: 'domains', operator: 'intersects', value: '@character.clericDomains' }`
- No Wisdom bonus (fixed 1 slot per level)

---

## State Storage (CGEState)

Cleric preparations are stored in `character.cgeStates['cleric-spells']`:

```typescript
{
  boundPreparations: {
    "base:0-0": "light",
    "base:0-1": "guidance",
    "base:1-0": "bless",
    "domain:1-0": "magic-weapon",  // Domain spell
    "domain:2-0": "spiritual-weapon",
  },
  usedBoundSlots: {
    "base:1-0": true,  // Bless was cast
  }
}
```

---

## Calculated Output (CalculatedCGE)

The character sheet includes calculated CGE with resolved values:

```typescript
{
  id: 'cleric-spells',
  classId: 'cleric',
  entityType: 'spell',
  classLevel: 3,

  knownLimits: undefined,  // No known config

  tracks: [
    {
      id: 'base',
      label: 'base_slots',
      resourceType: 'SLOTS',
      preparationType: 'BOUND',
      slots: [
        { level: 0, max: 4, current: 4, bonus: 0, boundSlots: [
          { slotId: 'base:0-0', level: 0, index: 0, preparedEntityId: 'light' },
          { slotId: 'base:0-1', level: 0, index: 1, preparedEntityId: 'guidance' },
          // ...
        ]},
        { level: 1, max: 3, current: 2, bonus: 1, boundSlots: [
          { slotId: 'base:1-0', level: 1, index: 0, preparedEntityId: 'bless', used: true },
          { slotId: 'base:1-1', level: 1, index: 1, preparedEntityId: 'cure-light-wounds' },
        ]},
        { level: 2, max: 2, current: 2, bonus: 1, boundSlots: [...] },
      ],
    },
    {
      id: 'domain',
      label: 'domain_slots',
      resourceType: 'SLOTS',
      preparationType: 'BOUND',
      slots: [
        { level: 1, max: 1, current: 1, bonus: 0, boundSlots: [
          { slotId: 'domain:1-0', level: 1, index: 0, preparedEntityId: 'magic-weapon' },
        ]},
        { level: 2, max: 1, current: 1, bonus: 0, boundSlots: [...] },
      ],
    },
  ],
}
```

---

## Variables Exposed

- `@cleric.spell.slot.{level}.max` - Max slots per level (base track)
- `@cleric.spell.slot.{level}.current` - Current available slots
- `@spell.slot.{level}.max` - Generic variable (shared across casters)
- `@castingClassLevel.cleric` - Effective caster level

---

## Special Cases (Not Yet Implemented)

### Spontaneous Casting
The Cleric can convert any prepared slot (not domain) into:
- Cure Wounds (if good/neutral alignment)
- Inflict Wounds (if evil alignment)

This would be modeled as a special action, not part of CGE directly.

### Alignment Restrictions
Clerics cannot cast spells with alignment descriptors opposite to their deity's alignment. This would be handled via accessFilter enhancement.

---

## SRD Reference

> **Spells**: A cleric casts divine spells, which are drawn from the cleric spell list. However, his alignment may restrict him from casting certain spells opposed to his moral or ethical beliefs.
>
> **Domain Spells**: A cleric's deity influences his alignment, what magic he can perform, what values he upholds, and how others see him. A cleric chooses two domains from among those belonging to his deity. Each domain gives the cleric access to a domain spell at each spell level he can cast, from 1st on up, as well as a granted power.
>
> **Spontaneous Casting**: A good cleric (or a neutral cleric of a good deity) can channel stored spell energy into healing spells that the cleric did not prepare ahead of time.
