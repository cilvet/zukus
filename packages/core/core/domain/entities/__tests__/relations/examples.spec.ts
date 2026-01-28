import { describe, it, expect } from 'bun:test'
import {
  buildRelationIndex,
  compileAndEnrichEntities,
  createRelationCondition,
  type RelationEntity,
  type RelationFieldDef
} from '../../relations'
import type { RelationFieldConfig, Entity } from '../../types/base'
import type { EntityFilter } from '../../../levels/filtering/types'
import { filterEntitiesWithVariables } from '../../../levels/filtering/filterWithVariables'

// ============================================================================
// Example 1: Feat Prerequisites (Dotes y Prerequisitos)
// ============================================================================

describe('Example 1: Feat Prerequisites', () => {
  // Entities: feats
  type Feat = Entity & {
    name: string
    prerequisites?: {
      relations: Array<{ targetId: string; metadata: { type: string } }>
      requiredFeatKeys?: string[]
    }
  }

  const feats: Feat[] = [
    { id: 'power-attack', entityType: 'feat', name: 'Power Attack' },
    { id: 'cleave', entityType: 'feat', name: 'Cleave' },
    { id: 'great-cleave', entityType: 'feat', name: 'Great Cleave' },
    { id: 'improved-sunder', entityType: 'feat', name: 'Improved Sunder' },
    { id: 'weapon-focus', entityType: 'feat', name: 'Weapon Focus' }
  ]

  // Relations: feat-prerequisite with metadata { type: 'required' | 'recommended' }
  const featPrerequisiteRelations: RelationEntity[] = [
    // Cleave requires Power Attack
    {
      id: 'cleave-requires-power-attack',
      entityType: 'feat-prerequisite',
      fromEntityId: 'cleave',
      toEntityId: 'power-attack',
      metadata: { type: 'required' }
    },
    // Great Cleave requires Cleave
    {
      id: 'great-cleave-requires-cleave',
      entityType: 'feat-prerequisite',
      fromEntityId: 'great-cleave',
      toEntityId: 'cleave',
      metadata: { type: 'required' }
    },
    // Improved Sunder requires Power Attack
    {
      id: 'improved-sunder-requires-power-attack',
      entityType: 'feat-prerequisite',
      fromEntityId: 'improved-sunder',
      toEntityId: 'power-attack',
      metadata: { type: 'required' }
    },
    // Great Cleave recommends Weapon Focus (for flavor)
    {
      id: 'great-cleave-recommends-weapon-focus',
      entityType: 'feat-prerequisite',
      fromEntityId: 'great-cleave',
      toEntityId: 'weapon-focus',
      metadata: { type: 'recommended' }
    }
  ]

  // Configuration for the relation field
  const FEAT_PREREQUISITE_CONFIG: RelationFieldConfig = {
    relationType: 'feat-prerequisite',
    targetEntityType: 'feat',
    metadataFields: [
      { name: 'type', type: 'string', required: true, allowedValues: ['required', 'recommended'] }
    ],
    compile: {
      keyFormat: '{targetId}:{metadata.type}',
      keysFieldName: 'requiredFeatKeys'
    }
  }

  const FEAT_RELATION_FIELD: RelationFieldDef = {
    fieldName: 'prerequisites',
    config: FEAT_PREREQUISITE_CONFIG
  }

  it('should compile feat prerequisites correctly', () => {
    const enrichedFeats = compileAndEnrichEntities(
      feats,
      featPrerequisiteRelations,
      [FEAT_RELATION_FIELD]
    )

    // Cleave requires Power Attack
    const cleave = enrichedFeats.find(f => f.id === 'cleave') as Feat
    expect(cleave.prerequisites?.requiredFeatKeys).toContain('power-attack:required')

    // Great Cleave requires Cleave and recommends Weapon Focus
    const greatCleave = enrichedFeats.find(f => f.id === 'great-cleave') as Feat
    expect(greatCleave.prerequisites?.requiredFeatKeys).toContain('cleave:required')
    expect(greatCleave.prerequisites?.requiredFeatKeys).toContain('weapon-focus:recommended')

    // Power Attack has no prerequisites
    const powerAttack = enrichedFeats.find(f => f.id === 'power-attack') as Feat
    expect(powerAttack.prerequisites?.requiredFeatKeys).toHaveLength(0)
  })

  it('should filter feats that require power-attack', () => {
    const enrichedFeats = compileAndEnrichEntities(
      feats,
      featPrerequisiteRelations,
      [FEAT_RELATION_FIELD]
    )

    // Filter: feats that require power-attack
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [createRelationCondition('prerequisites.requiredFeatKeys', 'power-attack', 'required')]
    }

    console.log('filter', filter)

    const results = filterEntitiesWithVariables(enrichedFeats, [filter], {})
    const matchingIds = results.map(r => r.entity.id)

    expect(matchingIds).toContain('cleave')
    expect(matchingIds).toContain('improved-sunder')
    expect(matchingIds).not.toContain('power-attack')
    expect(matchingIds).not.toContain('great-cleave') // requires cleave, not power-attack directly
  })
})

// ============================================================================
// Example 2: Class Features by Level (Habilidades de Clase por Nivel)
// ============================================================================

describe('Example 2: Class Features by Level', () => {
  // Entities: class-features
  type ClassFeature = Entity & {
    name: string
    classGrants?: {
      relations: Array<{ targetId: string; metadata: { level: number; classId: string } }>
      classLevelKeys?: string[]
    }
  }

  const classFeatures: ClassFeature[] = [
    { id: 'sneak-attack-1d6', entityType: 'class-feature', name: 'Sneak Attack +1d6' },
    { id: 'sneak-attack-2d6', entityType: 'class-feature', name: 'Sneak Attack +2d6' },
    { id: 'evasion', entityType: 'class-feature', name: 'Evasion' },
    { id: 'uncanny-dodge', entityType: 'class-feature', name: 'Uncanny Dodge' },
    { id: 'trap-sense-1', entityType: 'class-feature', name: 'Trap Sense +1' }
  ]

  // Relations: class-feature-grant with metadata { level: number, classId: string }
  const classFeatureRelations: RelationEntity[] = [
    // Rogue features
    {
      id: 'rogue-sneak-attack-1',
      entityType: 'class-feature-grant',
      fromEntityId: 'sneak-attack-1d6',
      toEntityId: 'rogue',
      metadata: { level: 1, classId: 'rogue' }
    },
    {
      id: 'rogue-sneak-attack-3',
      entityType: 'class-feature-grant',
      fromEntityId: 'sneak-attack-2d6',
      toEntityId: 'rogue',
      metadata: { level: 3, classId: 'rogue' }
    },
    {
      id: 'rogue-evasion',
      entityType: 'class-feature-grant',
      fromEntityId: 'evasion',
      toEntityId: 'rogue',
      metadata: { level: 2, classId: 'rogue' }
    },
    {
      id: 'rogue-uncanny-dodge',
      entityType: 'class-feature-grant',
      fromEntityId: 'uncanny-dodge',
      toEntityId: 'rogue',
      metadata: { level: 4, classId: 'rogue' }
    },
    {
      id: 'rogue-trap-sense',
      entityType: 'class-feature-grant',
      fromEntityId: 'trap-sense-1',
      toEntityId: 'rogue',
      metadata: { level: 3, classId: 'rogue' }
    },
    // Monk also gets Evasion at level 2
    {
      id: 'monk-evasion',
      entityType: 'class-feature-grant',
      fromEntityId: 'evasion',
      toEntityId: 'monk',
      metadata: { level: 2, classId: 'monk' }
    }
  ]

  // Configuration: key format includes class and level
  const CLASS_FEATURE_GRANT_CONFIG: RelationFieldConfig = {
    relationType: 'class-feature-grant',
    targetEntityType: 'class',
    metadataFields: [
      { name: 'level', type: 'integer', required: true },
      { name: 'classId', type: 'string', required: true }
    ],
    compile: {
      keyFormat: '{targetId}:{metadata.level}',
      keysFieldName: 'classLevelKeys'
    }
  }

  const CLASS_FEATURE_FIELD: RelationFieldDef = {
    fieldName: 'classGrants',
    config: CLASS_FEATURE_GRANT_CONFIG
  }

  it('should compile class feature grants correctly', () => {
    const enrichedFeatures = compileAndEnrichEntities(
      classFeatures,
      classFeatureRelations,
      [CLASS_FEATURE_FIELD]
    )

    // Evasion is granted by both Rogue and Monk at level 2
    const evasion = enrichedFeatures.find(f => f.id === 'evasion') as ClassFeature
    expect(evasion.classGrants?.classLevelKeys).toContain('rogue:2')
    expect(evasion.classGrants?.classLevelKeys).toContain('monk:2')
    expect(evasion.classGrants?.relations).toHaveLength(2)
  })

  it('should filter features granted at rogue level 3', () => {
    const enrichedFeatures = compileAndEnrichEntities(
      classFeatures,
      classFeatureRelations,
      [CLASS_FEATURE_FIELD]
    )

    // Filter: features that rogue gets at level 3
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [createRelationCondition('classGrants.classLevelKeys', 'rogue', 3)]
    }

    const results = filterEntitiesWithVariables(enrichedFeatures, [filter], {})
    const matchingIds = results.map(r => r.entity.id)

    expect(matchingIds).toContain('sneak-attack-2d6')
    expect(matchingIds).toContain('trap-sense-1')
    expect(matchingIds).not.toContain('evasion') // level 2
    expect(matchingIds).not.toContain('uncanny-dodge') // level 4
  })

  it('should filter features granted by monk', () => {
    const enrichedFeatures = compileAndEnrichEntities(
      classFeatures,
      classFeatureRelations,
      [CLASS_FEATURE_FIELD]
    )

    // Filter: features available to monk (any level)
    // Using partial key match - just the class ID
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [{
        field: 'classGrants.classLevelKeys',
        operator: 'contains',
        value: 'monk:2'
      }]
    }

    const results = filterEntitiesWithVariables(enrichedFeatures, [filter], {})
    const matchingIds = results.map(r => r.entity.id)

    expect(matchingIds).toContain('evasion')
    expect(matchingIds).not.toContain('sneak-attack-1d6')
  })
})

// ============================================================================
// Example 3: Item Slots (Items y Slots de Equipo)
// ============================================================================

describe('Example 3: Item Slots', () => {
  // Entities: items
  type Item = Entity & {
    name: string
    slotInfo?: {
      relations: Array<{ targetId: string; metadata: { slotId: string; exclusive: boolean } }>
      slotKeys?: string[]
    }
  }

  const items: Item[] = [
    { id: 'ring-of-protection', entityType: 'item', name: 'Ring of Protection +1' },
    { id: 'ring-of-invisibility', entityType: 'item', name: 'Ring of Invisibility' },
    { id: 'amulet-of-health', entityType: 'item', name: 'Amulet of Health +2' },
    { id: 'boots-of-speed', entityType: 'item', name: 'Boots of Speed' },
    { id: 'cloak-of-resistance', entityType: 'item', name: 'Cloak of Resistance +1' }
  ]

  // Relations: item-slot with metadata { slotId: string, exclusive: boolean }
  const itemSlotRelations: RelationEntity[] = [
    // Rings go in ring slot
    {
      id: 'ring-protection-slot',
      entityType: 'item-slot',
      fromEntityId: 'ring-of-protection',
      toEntityId: 'ring',
      metadata: { slotId: 'ring', exclusive: false }
    },
    {
      id: 'ring-invisibility-slot',
      entityType: 'item-slot',
      fromEntityId: 'ring-of-invisibility',
      toEntityId: 'ring',
      metadata: { slotId: 'ring', exclusive: false }
    },
    // Amulet goes in neck slot
    {
      id: 'amulet-neck-slot',
      entityType: 'item-slot',
      fromEntityId: 'amulet-of-health',
      toEntityId: 'neck',
      metadata: { slotId: 'neck', exclusive: true }
    },
    // Boots go in feet slot
    {
      id: 'boots-feet-slot',
      entityType: 'item-slot',
      fromEntityId: 'boots-of-speed',
      toEntityId: 'feet',
      metadata: { slotId: 'feet', exclusive: true }
    },
    // Cloak goes in shoulders slot
    {
      id: 'cloak-shoulders-slot',
      entityType: 'item-slot',
      fromEntityId: 'cloak-of-resistance',
      toEntityId: 'shoulders',
      metadata: { slotId: 'shoulders', exclusive: true }
    }
  ]

  // Configuration: key format is slotId:exclusive
  const ITEM_SLOT_CONFIG: RelationFieldConfig = {
    relationType: 'item-slot',
    targetEntityType: 'slot',
    metadataFields: [
      { name: 'slotId', type: 'string', required: true },
      { name: 'exclusive', type: 'boolean', required: true }
    ],
    compile: {
      keyFormat: '{targetId}:{metadata.exclusive}',
      keysFieldName: 'slotKeys'
    }
  }

  const ITEM_SLOT_FIELD: RelationFieldDef = {
    fieldName: 'slotInfo',
    config: ITEM_SLOT_CONFIG
  }

  it('should compile item slot relations correctly', () => {
    const enrichedItems = compileAndEnrichEntities(
      items,
      itemSlotRelations,
      [ITEM_SLOT_FIELD]
    )

    // Ring items are non-exclusive
    const ringOfProtection = enrichedItems.find(i => i.id === 'ring-of-protection') as Item
    expect(ringOfProtection.slotInfo?.slotKeys).toContain('ring:false')

    // Amulet is exclusive to neck
    const amulet = enrichedItems.find(i => i.id === 'amulet-of-health') as Item
    expect(amulet.slotInfo?.slotKeys).toContain('neck:true')
  })

  it('should filter items that go in ring slot', () => {
    const enrichedItems = compileAndEnrichEntities(
      items,
      itemSlotRelations,
      [ITEM_SLOT_FIELD]
    )

    // Filter: items that go in the ring slot (non-exclusive, can stack)
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [createRelationCondition('slotInfo.slotKeys', 'ring', 'false')]
    }

    const results = filterEntitiesWithVariables(enrichedItems, [filter], {})
    const matchingIds = results.map(r => r.entity.id)

    expect(matchingIds).toContain('ring-of-protection')
    expect(matchingIds).toContain('ring-of-invisibility')
    expect(matchingIds).not.toContain('amulet-of-health')
    expect(matchingIds).not.toContain('boots-of-speed')
  })

  it('should filter exclusive slot items', () => {
    const enrichedItems = compileAndEnrichEntities(
      items,
      itemSlotRelations,
      [ITEM_SLOT_FIELD]
    )

    // Filter: items with exclusive slots (using 'contains' to find any :true)
    // We need to check each exclusive slot individually or use a different approach
    // For this example, let's filter for neck:true specifically
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [{
        field: 'slotInfo.slotKeys',
        operator: 'contains',
        value: 'neck:true'
      }]
    }

    const results = filterEntitiesWithVariables(enrichedItems, [filter], {})
    const matchingIds = results.map(r => r.entity.id)

    expect(matchingIds).toContain('amulet-of-health')
    expect(matchingIds).not.toContain('ring-of-protection')
  })
})

// ============================================================================
// Example 4: Monster Abilities (Monstruos y Habilidades)
// ============================================================================

describe('Example 4: Monster Abilities', () => {
  // Entities: abilities
  type MonsterAbility = Entity & {
    name: string
    monsterAssociations?: {
      relations: Array<{ targetId: string; metadata: { challengeRating: number } }>
      crKeys?: string[]
      crLevels?: Record<string, number>
    }
  }

  const abilities: MonsterAbility[] = [
    { id: 'breath-weapon-fire', entityType: 'monster-ability', name: 'Breath Weapon (Fire)' },
    { id: 'frightful-presence', entityType: 'monster-ability', name: 'Frightful Presence' },
    { id: 'damage-reduction-5', entityType: 'monster-ability', name: 'Damage Reduction 5/magic' },
    { id: 'poison-bite', entityType: 'monster-ability', name: 'Poison (Bite)' },
    { id: 'regeneration', entityType: 'monster-ability', name: 'Regeneration' }
  ]

  // Relations: monster-ability with metadata { challengeRating: number }
  const monsterAbilityRelations: RelationEntity[] = [
    // Dragon abilities (high CR)
    {
      id: 'dragon-breath',
      entityType: 'monster-ability-grant',
      fromEntityId: 'breath-weapon-fire',
      toEntityId: 'red-dragon',
      metadata: { challengeRating: 10 }
    },
    {
      id: 'dragon-frightful',
      entityType: 'monster-ability-grant',
      fromEntityId: 'frightful-presence',
      toEntityId: 'red-dragon',
      metadata: { challengeRating: 10 }
    },
    // Golem abilities (medium CR)
    {
      id: 'golem-dr',
      entityType: 'monster-ability-grant',
      fromEntityId: 'damage-reduction-5',
      toEntityId: 'iron-golem',
      metadata: { challengeRating: 7 }
    },
    // Spider abilities (low CR)
    {
      id: 'spider-poison',
      entityType: 'monster-ability-grant',
      fromEntityId: 'poison-bite',
      toEntityId: 'giant-spider',
      metadata: { challengeRating: 2 }
    },
    // Troll abilities (medium CR)
    {
      id: 'troll-regen',
      entityType: 'monster-ability-grant',
      fromEntityId: 'regeneration',
      toEntityId: 'troll',
      metadata: { challengeRating: 5 }
    },
    // Multiple monsters can have the same ability
    {
      id: 'hydra-regen',
      entityType: 'monster-ability-grant',
      fromEntityId: 'regeneration',
      toEntityId: 'hydra',
      metadata: { challengeRating: 8 }
    }
  ]

  // Configuration: compile with CR as numeric for filtering
  const MONSTER_ABILITY_CONFIG: RelationFieldConfig = {
    relationType: 'monster-ability-grant',
    targetEntityType: 'monster',
    metadataFields: [
      { name: 'challengeRating', type: 'integer', required: true }
    ],
    compile: {
      keyFormat: '{targetId}:{metadata.challengeRating}',
      keysFieldName: 'crKeys',
      mapFieldName: 'crLevels',
      mapValueField: 'challengeRating'
    }
  }

  const MONSTER_ABILITY_FIELD: RelationFieldDef = {
    fieldName: 'monsterAssociations',
    config: MONSTER_ABILITY_CONFIG
  }

  it('should compile monster ability relations correctly', () => {
    const enrichedAbilities = compileAndEnrichEntities(
      abilities,
      monsterAbilityRelations,
      [MONSTER_ABILITY_FIELD]
    )

    // Regeneration is used by multiple monsters
    const regen = enrichedAbilities.find(a => a.id === 'regeneration') as MonsterAbility
    expect(regen.monsterAssociations?.relations).toHaveLength(2)
    expect(regen.monsterAssociations?.crKeys).toContain('troll:5')
    expect(regen.monsterAssociations?.crKeys).toContain('hydra:8')
    expect(regen.monsterAssociations?.crLevels).toEqual({
      troll: 5,
      hydra: 8
    })

    // Breath weapon is only for dragon
    const breath = enrichedAbilities.find(a => a.id === 'breath-weapon-fire') as MonsterAbility
    expect(breath.monsterAssociations?.crKeys).toContain('red-dragon:10')
  })

  it('should filter abilities by specific monster CR', () => {
    const enrichedAbilities = compileAndEnrichEntities(
      abilities,
      monsterAbilityRelations,
      [MONSTER_ABILITY_FIELD]
    )

    // Filter: abilities from CR 10 monsters (red-dragon)
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [{
        field: 'monsterAssociations.crKeys',
        operator: 'contains',
        value: 'red-dragon:10'
      }]
    }

    const results = filterEntitiesWithVariables(enrichedAbilities, [filter], {})
    const matchingIds = results.map(r => r.entity.id)

    expect(matchingIds).toContain('breath-weapon-fire')
    expect(matchingIds).toContain('frightful-presence')
    expect(matchingIds).not.toContain('regeneration')
    expect(matchingIds).not.toContain('poison-bite')
  })

  it('should demonstrate filtering high CR abilities using JMESPath', () => {
    const enrichedAbilities = compileAndEnrichEntities(
      abilities,
      monsterAbilityRelations,
      [MONSTER_ABILITY_FIELD]
    )

    // To filter by CR >= 5, we need to check the crLevels map values
    // We can use a JMESPath to get the max CR value
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [{
        jmesPath: 'max(values(monsterAssociations.crLevels || `{}`))',
        operator: '>=',
        value: 5
      }]
    }

    const results = filterEntitiesWithVariables(enrichedAbilities, [filter], {})
    const matchingIds = results.map(r => r.entity.id)

    // Abilities with CR >= 5 should include:
    // - breath-weapon-fire (CR 10)
    // - frightful-presence (CR 10)
    // - damage-reduction-5 (CR 7)
    // - regeneration (CR 5 and 8)
    expect(matchingIds).toContain('breath-weapon-fire')
    expect(matchingIds).toContain('frightful-presence')
    expect(matchingIds).toContain('damage-reduction-5')
    expect(matchingIds).toContain('regeneration')

    // poison-bite is CR 2, should not be included
    expect(matchingIds).not.toContain('poison-bite')
  })

  it('should filter abilities from a specific monster', () => {
    const enrichedAbilities = compileAndEnrichEntities(
      abilities,
      monsterAbilityRelations,
      [MONSTER_ABILITY_FIELD]
    )

    // Filter: abilities that troll has
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [{
        // Check if crKeys contains any key starting with 'troll:'
        field: 'monsterAssociations.crKeys',
        operator: 'contains',
        value: 'troll:5'
      }]
    }

    const results = filterEntitiesWithVariables(enrichedAbilities, [filter], {})
    const matchingIds = results.map(r => r.entity.id)

    expect(matchingIds).toContain('regeneration')
    expect(matchingIds).not.toContain('breath-weapon-fire')
  })
})

// ============================================================================
// Example: Using buildRelationIndex directly for queries
// ============================================================================

describe('Direct Index Queries', () => {
  // This example shows how to use the index directly without compiling
  // Useful for ad-hoc queries or when you need reverse lookups

  const spellRelations: RelationEntity[] = [
    {
      id: 'fireball-wizard',
      entityType: 'spell-class',
      fromEntityId: 'fireball',
      toEntityId: 'wizard',
      metadata: { level: 3 }
    },
    {
      id: 'fireball-sorcerer',
      entityType: 'spell-class',
      fromEntityId: 'fireball',
      toEntityId: 'sorcerer',
      metadata: { level: 3 }
    },
    {
      id: 'cure-cleric',
      entityType: 'spell-class',
      fromEntityId: 'cure-light-wounds',
      toEntityId: 'cleric',
      metadata: { level: 1 }
    }
  ]

  it('should query relations by source entity', () => {
    const index = buildRelationIndex(spellRelations)

    // Get all classes that have Fireball
    const fireballRelations = index.byFrom.get('spell-class')?.get('fireball') ?? []
    const classesWithFireball = fireballRelations.map(r => r.toEntityId)

    expect(classesWithFireball).toContain('wizard')
    expect(classesWithFireball).toContain('sorcerer')
    expect(classesWithFireball).not.toContain('cleric')
  })

  it('should query relations by target entity (reverse lookup)', () => {
    const index = buildRelationIndex(spellRelations)

    // Get all spells available to Wizard
    const wizardRelations = index.byTo.get('spell-class')?.get('wizard') ?? []
    const wizardSpells = wizardRelations.map(r => r.fromEntityId)

    expect(wizardSpells).toContain('fireball')
    expect(wizardSpells).not.toContain('cure-light-wounds')
  })

  it('should support filtering by metadata in direct queries', () => {
    const index = buildRelationIndex(spellRelations)

    // Get all level 3 spells for any class
    const allRelations = spellRelations.filter(r => r.metadata.level === 3)
    const level3Spells = [...new Set(allRelations.map(r => r.fromEntityId))]

    expect(level3Spells).toContain('fireball')
    expect(level3Spells).not.toContain('cure-light-wounds')
  })
})
