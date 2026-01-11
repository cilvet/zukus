import { allSpells } from './spells'

// =============================================================================
// Entity Types
// =============================================================================

type BaseEntity = {
  id: string
  entityType: string
  name: string
  description?: string
  tags?: string[]
}

export type FeatEntity = BaseEntity & {
  entityType: 'feat'
  category?: string
  level?: number
}

export type TalentEntity = BaseEntity & {
  entityType: 'rogueTalent'
  level?: number
}

export type SpellEntity = BaseEntity & {
  entityType: 'spell'
  level?: number
  school?: string
  classes?: string[]
}

export type ClassFeatureEntity = BaseEntity & {
  entityType: 'classFeature'
  providers?: unknown[] // EntityProvider array - validated separately
}

// Specialization entities for nested provider testing
export type SpecializationEntity = BaseEntity & {
  entityType: 'specialization'
  tier: number
  providers?: unknown[]
}

export type MasteryEntity = BaseEntity & {
  entityType: 'mastery'
  tier: number
  providers?: unknown[]
}

export type CapstoneEntity = BaseEntity & {
  entityType: 'capstone'
}

export type TestEntity = FeatEntity | TalentEntity | SpellEntity | ClassFeatureEntity | SpecializationEntity | MasteryEntity | CapstoneEntity

// =============================================================================
// Test Data
// =============================================================================

export const featEntities: FeatEntity[] = [
  { id: 'feat-1', entityType: 'feat', name: 'Power Attack', description: 'Trade attack bonus for damage', category: 'combat', level: 1, tags: ['fighter'] },
  { id: 'feat-2', entityType: 'feat', name: 'Cleave', description: 'Extra attack after dropping foe', category: 'combat', level: 3, tags: ['fighter'] },
  { id: 'feat-3', entityType: 'feat', name: 'Spell Focus', description: '+1 DC to spells of chosen school', category: 'magic', level: 1 },
  { id: 'feat-4', entityType: 'feat', name: 'Weapon Focus', description: '+1 attack with chosen weapon', category: 'combat', level: 1, tags: ['fighter'] },
  { id: 'feat-5', entityType: 'feat', name: 'Improved Initiative', description: '+4 to initiative', category: 'combat', level: 1, tags: ['fighter'] },
  { id: 'feat-6', entityType: 'feat', name: 'Weapon Specialization', description: '+2 damage with chosen weapon', category: 'combat', level: 4, tags: ['fighter'] },
  { id: 'feat-7', entityType: 'feat', name: 'Greater Weapon Focus', description: '+1 attack with chosen weapon (stacks)', category: 'combat', level: 8, tags: ['fighter'] },
  { id: 'feat-8', entityType: 'feat', name: 'Dodge', description: '+1 dodge bonus to AC', category: 'combat', level: 1, tags: ['fighter'] },
  { id: 'feat-9', entityType: 'feat', name: 'Mobility', description: '+4 AC against attacks of opportunity', category: 'combat', level: 1, tags: ['fighter'] },
  { id: 'feat-10', entityType: 'feat', name: 'Spring Attack', description: 'Move before and after attacking', category: 'combat', level: 4, tags: ['fighter'] },
]

export const talentEntities: TalentEntity[] = [
  { id: 'talent-1', entityType: 'rogueTalent', name: 'Fast Stealth', description: 'Move at full speed while hiding', level: 3 },
  { id: 'talent-2', entityType: 'rogueTalent', name: 'Trap Sense', description: '+1 AC and Reflex vs traps', level: 3 },
  { id: 'talent-3', entityType: 'rogueTalent', name: 'Evasion', description: 'No damage on successful Reflex', level: 6 },
  { id: 'talent-4', entityType: 'rogueTalent', name: 'Improved Evasion', description: 'Half damage on failed Reflex', level: 10 },
]

export const classFeatureEntities: ClassFeatureEntity[] = [
  { 
    id: 'fighter-bonus-feat', 
    entityType: 'classFeature', 
    name: 'Fighter Bonus Feat',
    description: 'A fighter gets a bonus combat-oriented feat.',
    providers: [
      {
        selector: {
          id: 'fighter-feat-selector',
          name: 'Choose a Fighter Bonus Feat',
          entityType: 'feat',
          filter: {
            type: 'AND',
            filterPolicy: 'strict',
            conditions: [
              { field: 'tags', operator: 'contains', value: 'fighter' },
            ],
          },
          min: 1,
          max: 1,
        },
      },
    ],
  },
  { 
    id: 'rogue-talent-selector', 
    entityType: 'classFeature', 
    name: 'Rogue Talent',
    description: 'Select a special ability from the rogue talent pool.',
    providers: [
      {
        selector: {
          id: 'talent-selector',
          name: 'Choose a Rogue Talent',
          entityType: 'rogueTalent',
          min: 1,
          max: 1,
        },
      },
    ],
  },
]

// =============================================================================
// DOUBLE NESTING TEST: Capstones (Tier 3 - Deepest level, no providers)
// =============================================================================
export const capstoneEntities: CapstoneEntity[] = [
  { id: 'capstone-fire-mastery', entityType: 'capstone', name: 'Inferno Mastery', description: 'Ultimate fire power' },
  { id: 'capstone-fire-control', entityType: 'capstone', name: 'Flame Control', description: 'Perfect fire manipulation' },
  { id: 'capstone-ice-mastery', entityType: 'capstone', name: 'Absolute Zero', description: 'Ultimate ice power' },
  { id: 'capstone-ice-control', entityType: 'capstone', name: 'Frost Weave', description: 'Perfect ice manipulation' },
  { id: 'capstone-blade-mastery', entityType: 'capstone', name: 'Blade Dance', description: 'Ultimate sword technique' },
  { id: 'capstone-blade-guard', entityType: 'capstone', name: 'Perfect Parry', description: 'Impenetrable defense' },
  { id: 'capstone-shield-wall', entityType: 'capstone', name: 'Iron Wall', description: 'Ultimate shield technique' },
  { id: 'capstone-shield-bash', entityType: 'capstone', name: 'Shield Slam', description: 'Devastating shield attack' },
]

// =============================================================================
// DOUBLE NESTING TEST: Masteries (Tier 2 - Have providers with Capstones)
// =============================================================================
export const masteryEntities: MasteryEntity[] = [
  {
    id: 'mastery-fire',
    entityType: 'mastery',
    name: 'Fire Mastery',
    description: 'Master the flames',
    tier: 2,
    providers: [
      {
        granted: { specificIds: ['capstone-fire-control'] },
        selector: {
          id: 'fire-capstone-selector',
          name: 'Choose Fire Capstone',
          entityIds: ['capstone-fire-mastery'],
          min: 1,
          max: 1,
        },
      },
    ],
  },
  {
    id: 'mastery-ice',
    entityType: 'mastery',
    name: 'Ice Mastery',
    description: 'Command the cold',
    tier: 2,
    providers: [
      {
        granted: { specificIds: ['capstone-ice-control'] },
        selector: {
          id: 'ice-capstone-selector',
          name: 'Choose Ice Capstone',
          entityIds: ['capstone-ice-mastery'],
          min: 1,
          max: 1,
        },
      },
    ],
  },
  {
    id: 'mastery-blade',
    entityType: 'mastery',
    name: 'Blade Mastery',
    description: 'Perfect your swordplay',
    tier: 2,
    providers: [
      {
        selector: {
          id: 'blade-capstone-selector',
          name: 'Choose Blade Capstone',
          entityIds: ['capstone-blade-mastery', 'capstone-blade-guard'],
          min: 1,
          max: 1,
        },
      },
    ],
  },
  {
    id: 'mastery-shield',
    entityType: 'mastery',
    name: 'Shield Mastery',
    description: 'Become an immovable fortress',
    tier: 2,
    providers: [
      {
        granted: { specificIds: ['capstone-shield-wall', 'capstone-shield-bash'] },
      },
    ],
  },
]

// =============================================================================
// DOUBLE NESTING TEST: Specializations (Tier 1 - Have providers with Masteries)
// =============================================================================
export const specializationEntities: SpecializationEntity[] = [
  {
    id: 'spec-elementalist',
    entityType: 'specialization',
    name: 'Elementalist Path',
    description: 'Harness elemental magic',
    tier: 1,
    providers: [
      {
        selector: {
          id: 'element-mastery-selector',
          name: 'Choose Element Mastery',
          entityType: 'mastery',
          filter: {
            type: 'OR',
            filterPolicy: 'strict',
            conditions: [
              { field: 'id', operator: '==', value: 'mastery-fire' },
              { field: 'id', operator: '==', value: 'mastery-ice' },
            ],
          },
          min: 1,
          max: 1,
        },
      },
    ],
  },
  {
    id: 'spec-warrior',
    entityType: 'specialization',
    name: 'Warrior Path',
    description: 'Master martial combat',
    tier: 1,
    providers: [
      {
        granted: { specificIds: ['mastery-blade'] },
        selector: {
          id: 'combat-mastery-selector',
          name: 'Choose Combat Mastery',
          entityIds: ['mastery-shield'],
          min: 0,
          max: 1,
        },
      },
    ],
  },
]

// =============================================================================
// DOUBLE NESTING TEST: Root Feature (Tier 0 - Entry point with Specializations)
// =============================================================================
export const advancedClassFeatureEntities: ClassFeatureEntity[] = [
  {
    id: 'prestige-specialization',
    entityType: 'classFeature',
    name: 'Prestige Specialization',
    description: 'Choose your path of power. Each path unlocks further choices.',
    providers: [
      {
        selector: {
          id: 'specialization-selector',
          name: 'Choose Your Path',
          entityType: 'specialization',
          min: 1,
          max: 1,
        },
      },
    ],
  },
  {
    id: 'dual-path-mastery',
    entityType: 'classFeature',
    name: 'Dual Path Mastery',
    description: 'A rare ability that grants both paths with granted + selection.',
    providers: [
      {
        granted: { specificIds: ['spec-elementalist'] },
        selector: {
          id: 'second-path-selector',
          name: 'Choose Second Path',
          entityIds: ['spec-warrior'],
          min: 1,
          max: 1,
        },
      },
    ],
  },
]

const spellEntitiesArray: SpellEntity[] = []
for (let i = 0; i < allSpells.length; i++) {
  const spell = allSpells[i]
  spellEntitiesArray.push({
    id: spell.id,
    entityType: 'spell' as const,
    name: spell.name,
    description: spell.description ? spell.description.substring(0, 100) + '...' : undefined,
    level: spell.level,
    school: spell.school,
    classes: spell.classes ? [...spell.classes] : undefined,
  })
}
export const spellEntities = spellEntitiesArray

export const testEntities: TestEntity[] = [
  ...featEntities,
  ...talentEntities,
  ...spellEntities,
  ...classFeatureEntities,
  ...capstoneEntities,
  ...masteryEntities,
  ...specializationEntities,
  ...advancedClassFeatureEntities,
]

export function getEntityById(id: string): TestEntity | undefined {
  return testEntities.find(e => e.id === id)
}

// =============================================================================
// EntityOption format for shared components
// =============================================================================

export type EntityOption = {
  id: string
  name: string
  entityType: string
  description?: string
  category?: string
  level?: number
  school?: string
  tags?: string[]
}

const entityOptionsArray: EntityOption[] = []
for (let i = 0; i < featEntities.length; i++) {
  const e = featEntities[i]
  entityOptionsArray.push({
    id: e.id,
    name: e.name,
    entityType: e.entityType,
    description: e.description,
    category: e.category,
    level: e.level,
    tags: e.tags,
  })
}
for (let i = 0; i < talentEntities.length; i++) {
  const e = talentEntities[i]
  entityOptionsArray.push({
    id: e.id,
    name: e.name,
    entityType: e.entityType,
    description: e.description,
    level: e.level,
  })
}
for (let i = 0; i < spellEntities.length; i++) {
  const e = spellEntities[i]
  entityOptionsArray.push({
    id: e.id,
    name: e.name,
    entityType: e.entityType,
    description: e.description,
    level: e.level,
    school: e.school,
  })
}
for (let i = 0; i < classFeatureEntities.length; i++) {
  const e = classFeatureEntities[i]
  entityOptionsArray.push({
    id: e.id,
    name: e.name,
    entityType: e.entityType,
    description: e.description,
  })
}
for (let i = 0; i < capstoneEntities.length; i++) {
  const e = capstoneEntities[i]
  entityOptionsArray.push({
    id: e.id,
    name: e.name,
    entityType: e.entityType,
    description: e.description,
  })
}
for (let i = 0; i < masteryEntities.length; i++) {
  const e = masteryEntities[i]
  entityOptionsArray.push({
    id: e.id,
    name: e.name,
    entityType: e.entityType,
    description: e.description,
  })
}
for (let i = 0; i < specializationEntities.length; i++) {
  const e = specializationEntities[i]
  entityOptionsArray.push({
    id: e.id,
    name: e.name,
    entityType: e.entityType,
    description: e.description,
  })
}
for (let i = 0; i < advancedClassFeatureEntities.length; i++) {
  const e = advancedClassFeatureEntities[i]
  entityOptionsArray.push({
    id: e.id,
    name: e.name,
    entityType: e.entityType,
    description: e.description,
  })
}
export const testEntitiesAsOptions: EntityOption[] = entityOptionsArray

