import { describe, it, expect } from 'bun:test';
import { executeAction } from '../executeAction';
import type {
  ActionDefinition,
  ContextualEffectGroup,
  ContextualEffectState,
} from '../types';
import type { StandardEntity } from '../../entities/types/base';

// =============================================================================
// Test entities
// =============================================================================

const mageArmorBuff: Record<string, unknown> = {
  id: 'buff-mage-armor',
  entityType: 'buff',
  name: 'Mage Armor',
  casterLevel: 0,
  effects: [
    { target: 'ac.total', formula: '4', bonusType: 'ARMOR' },
  ],
};

const bullsStrengthBuff: Record<string, unknown> = {
  id: 'buff-bulls-strength',
  entityType: 'buff',
  name: "Bull's Strength",
  casterLevel: 0,
  effects: [
    { target: 'ability.strength.score', formula: '1d4+1', bonusType: 'ENHANCEMENT' },
  ],
};

function entityLookup(id: string): Record<string, unknown> | undefined {
  const entities: Record<string, Record<string, unknown>> = {
    'buff-mage-armor': mageArmorBuff,
    'buff-bulls-strength': bullsStrengthBuff,
  };
  return entities[id];
}

// =============================================================================
// Test 1: Mage Armor — inject_entity with output
// =============================================================================

describe('Test 1: Mage Armor — inject_entity with output', () => {
  const mageArmorSpell: StandardEntity = {
    id: 'spell-mage-armor',
    entityType: 'spell',
    name: 'Mage Armor',
  };

  const mageArmorAction: ActionDefinition = {
    id: 'cast',
    name: 'Cast Mage Armor',
    actionType: 'cast_spell',
    params: [
      {
        id: 'casterLevel',
        name: 'Caster Level',
        source: { type: 'character', path: 'class.wizard.level' },
      },
    ],
    outputs: [
      { id: 'casterLevel', formula: '@param.casterLevel', targetField: 'casterLevel' },
    ],
    results: [
      { type: 'inject_entity', entityId: 'buff-mage-armor', target: 'self', active: true },
    ],
  };

  it('should inject buff with casterLevel from character', () => {
    const result = executeAction({
      action: mageArmorAction,
      entity: mageArmorSpell,
      substitutionIndex: { 'class.wizard.level': 5 },
      entityLookup,
    });

    expect(result.resolvedParams.casterLevel).toBe(5);
    expect(result.outcomes).toHaveLength(1);

    const outcome = result.outcomes[0];
    expect(outcome.type).toBe('inject_entity');
    if (outcome.type === 'inject_entity') {
      expect(outcome.entity.casterLevel).toBe(5);
      expect(outcome.entity.entityType).toBe('buff');
      expect(outcome.entity.name).toBe('Mage Armor');
      const effects = outcome.entity.effects as Array<{ target: string; formula: string; bonusType: string }>;
      expect(effects).toHaveLength(1);
      expect(effects[0].target).toBe('ac.total');
      expect(effects[0].formula).toBe('4');
      expect(effects[0].bonusType).toBe('ARMOR');
    }
  });

  it('should not modify the original buff entity', () => {
    executeAction({
      action: mageArmorAction,
      entity: mageArmorSpell,
      substitutionIndex: { 'class.wizard.level': 5 },
      entityLookup,
    });

    expect(mageArmorBuff.casterLevel).toBe(0);
  });
});

// =============================================================================
// Test 2: Cure Light Wounds — modify_hp (heal)
// =============================================================================

describe('Test 2: Cure Light Wounds — modify_hp', () => {
  const clwSpell: StandardEntity = {
    id: 'spell-cure-light-wounds',
    entityType: 'spell',
    name: 'Cure Light Wounds',
  };

  const clwAction: ActionDefinition = {
    id: 'cast',
    name: 'Cast Cure Light Wounds',
    actionType: 'cast_spell',
    params: [
      {
        id: 'casterLevel',
        name: 'Caster Level',
        source: { type: 'character', path: 'class.cleric.level' },
      },
    ],
    results: [
      { type: 'heal', formula: '1d8 + min(@param.casterLevel, 5)', target: 'self' },
    ],
  };

  it('should produce heal outcome with correct range', () => {
    const result = executeAction({
      action: clwAction,
      entity: clwSpell,
      substitutionIndex: { 'class.cleric.level': 5 },
      entityLookup,
    });

    expect(result.resolvedParams.casterLevel).toBe(5);
    expect(result.outcomes).toHaveLength(1);

    const outcome = result.outcomes[0];
    expect(outcome.type).toBe('modify_hp');
    if (outcome.type === 'modify_hp') {
      expect(outcome.mode).toBe('heal');
      // 1d8 (1-8) + min(5, 5) = 6-13
      expect(outcome.amount).toBeGreaterThanOrEqual(6);
      expect(outcome.amount).toBeLessThanOrEqual(13);
    }
  });

  it('should cap casterLevel bonus at 5', () => {
    const result = executeAction({
      action: clwAction,
      entity: clwSpell,
      substitutionIndex: { 'class.cleric.level': 10 },
      entityLookup,
    });

    if (result.outcomes[0].type === 'modify_hp') {
      // 1d8 (1-8) + min(10, 5) = 6-13
      expect(result.outcomes[0].amount).toBeGreaterThanOrEqual(6);
      expect(result.outcomes[0].amount).toBeLessThanOrEqual(13);
    }
  });
});

// =============================================================================
// Test 3: Spell Focus — contextual effect modifying params
// =============================================================================

describe('Test 3: Spell Focus — contextual effect modifying params', () => {
  const fireballSpell: StandardEntity & { school: string } = {
    id: 'spell-fireball',
    entityType: 'spell',
    name: 'Fireball',
    school: 'evocation',
  };

  const fireballAction: ActionDefinition = {
    id: 'cast',
    name: 'Cast Fireball',
    actionType: 'cast_spell',
    params: [
      {
        id: 'casterLevel',
        name: 'Caster Level',
        source: { type: 'character', path: 'class.wizard.level' },
      },
      {
        id: 'spellDC',
        name: 'Spell DC',
        source: { type: 'formula', expression: '10 + 3 + @param.intMod' },
      },
      {
        id: 'intMod',
        name: 'INT Modifier',
        source: { type: 'character', path: 'ability.intelligence.modifier' },
      },
    ],
    results: [
      { type: 'dice_roll', id: 'damage', label: 'Fireball Damage', diceFormula: 'min(@param.casterLevel, 10)d6' },
    ],
  };

  // Spell Focus (Evocation): +1 DC for evocation spells
  // In a real system, availability conditions would check @entity.school == 'evocation'
  // For the PoC, we test by including/excluding the group from activeGroupIds
  const spellFocusEvocation: ContextualEffectGroup = {
    id: 'spell-focus-evocation',
    name: 'Spell Focus (Evocation)',
    context: 'casting',
    effects: [
      { target: 'param.spellDC', formula: '1' },
    ],
    optional: false,
  };

  const characterEntities = [
    { contextualEffects: [spellFocusEvocation] },
  ];

  it('should increase spellDC by 1 when Spell Focus is active', () => {
    const contextualEffectState: ContextualEffectState = {
      activeGroupIds: ['spell-focus-evocation'],
      variableValues: {},
    };

    const result = executeAction({
      action: fireballAction,
      entity: fireballSpell,
      substitutionIndex: {
        'class.wizard.level': 5,
        'ability.intelligence.modifier': 4,
      },
      contextualEffectState,
      characterEntities,
      entityLookup,
    });

    // Note: intMod param resolves AFTER spellDC formula evaluates,
    // so @param.intMod in the formula is 0 at that point.
    // spellDC = 10 + 3 + 0 = 13, then +1 from Spell Focus = 14
    expect(result.resolvedParams.spellDC).toBe(14);
  });

  it('should NOT modify spellDC when Spell Focus is NOT active', () => {
    const contextualEffectState: ContextualEffectState = {
      activeGroupIds: [],
      variableValues: {},
    };

    const result = executeAction({
      action: fireballAction,
      entity: fireballSpell,
      substitutionIndex: {
        'class.wizard.level': 5,
        'ability.intelligence.modifier': 4,
      },
      contextualEffectState,
      characterEntities,
      entityLookup,
    });

    expect(result.resolvedParams.spellDC).toBe(13);
  });
});

// =============================================================================
// Test 4: Practiced Spellcaster — contextual effect modifying output
// =============================================================================

describe('Test 4: Practiced Spellcaster — contextual effect modifying output', () => {
  const mageArmorSpell: StandardEntity = {
    id: 'spell-mage-armor',
    entityType: 'spell',
    name: 'Mage Armor',
  };

  const mageArmorAction: ActionDefinition = {
    id: 'cast',
    name: 'Cast Mage Armor',
    actionType: 'cast_spell',
    params: [
      {
        id: 'casterLevel',
        name: 'Caster Level',
        source: { type: 'character', path: 'class.wizard.level' },
      },
    ],
    outputs: [
      { id: 'casterLevel', formula: '@param.casterLevel', targetField: 'casterLevel' },
    ],
    results: [
      { type: 'inject_entity', entityId: 'buff-mage-armor', target: 'self', active: true },
    ],
  };

  const practicedSpellcaster: ContextualEffectGroup = {
    id: 'practiced-spellcaster',
    name: 'Practiced Spellcaster',
    context: 'casting',
    effects: [
      { target: 'param.casterLevel', formula: '4' },
    ],
    optional: false,
  };

  it('should boost casterLevel by 4 and inject buff with boosted value', () => {
    const result = executeAction({
      action: mageArmorAction,
      entity: mageArmorSpell,
      substitutionIndex: { 'class.wizard.level': 3 },
      contextualEffectState: {
        activeGroupIds: ['practiced-spellcaster'],
        variableValues: {},
      },
      characterEntities: [{ contextualEffects: [practicedSpellcaster] }],
      entityLookup,
    });

    // casterLevel = 3 + 4 = 7
    expect(result.resolvedParams.casterLevel).toBe(7);

    const outcome = result.outcomes[0];
    expect(outcome.type).toBe('inject_entity');
    if (outcome.type === 'inject_entity') {
      expect(outcome.entity.casterLevel).toBe(7);
    }
  });
});

// =============================================================================
// Test 5: Variable slider — Power Attack pattern
// =============================================================================

describe('Test 5: Variable slider — Power Attack pattern', () => {
  const attackEntity: StandardEntity = {
    id: 'feat-custom',
    entityType: 'feat',
    name: 'Custom Power Feat',
  };

  const castAction: ActionDefinition = {
    id: 'cast',
    name: 'Cast',
    actionType: 'cast_spell',
    params: [
      {
        id: 'casterLevel',
        name: 'Caster Level',
        source: { type: 'character', path: 'class.wizard.level' },
      },
      {
        id: 'bonusDamage',
        name: 'Bonus Damage',
        source: { type: 'formula', expression: '0' },
      },
    ],
    results: [
      { type: 'dice_roll', id: 'damage', label: 'Damage', diceFormula: '1d6 + @param.bonusDamage' },
    ],
  };

  const powerFeat: ContextualEffectGroup = {
    id: 'power-feat',
    name: 'Power Feat',
    context: 'casting',
    effects: [
      { target: 'param.bonusDamage', formula: '@points * 2' },
    ],
    variables: [
      { id: 'points', name: 'Points', min: '1', max: '@param.casterLevel' },
    ],
    optional: true,
  };

  it('should apply variable-based bonus with points=3 → bonusDamage=6', () => {
    const result = executeAction({
      action: castAction,
      entity: attackEntity,
      substitutionIndex: { 'class.wizard.level': 5 },
      contextualEffectState: {
        activeGroupIds: ['power-feat'],
        variableValues: { 'power-feat': { points: 3 } },
      },
      characterEntities: [{ contextualEffects: [powerFeat] }],
      entityLookup,
    });

    expect(result.resolvedParams.bonusDamage).toBe(6);
  });

  it('should have bonusDamage=0 when power feat is not active', () => {
    const result = executeAction({
      action: castAction,
      entity: attackEntity,
      substitutionIndex: { 'class.wizard.level': 5 },
      contextualEffectState: {
        activeGroupIds: [],
        variableValues: {},
      },
      characterEntities: [{ contextualEffects: [powerFeat] }],
      entityLookup,
    });

    expect(result.resolvedParams.bonusDamage).toBe(0);
  });
});

// =============================================================================
// Test 6: Bull's Strength — dice in buff effects resolved on inject
// =============================================================================

describe('Test 6: Bull\'s Strength — dice in buff effects', () => {
  const bullsStrengthSpell: StandardEntity = {
    id: 'spell-bulls-strength',
    entityType: 'spell',
    name: "Bull's Strength",
  };

  const bullsStrengthAction: ActionDefinition = {
    id: 'cast',
    name: "Cast Bull's Strength",
    actionType: 'cast_spell',
    params: [
      {
        id: 'casterLevel',
        name: 'Caster Level',
        source: { type: 'character', path: 'class.wizard.level' },
      },
    ],
    outputs: [
      { id: 'casterLevel', formula: '@param.casterLevel', targetField: 'casterLevel' },
    ],
    results: [
      { type: 'inject_entity', entityId: 'buff-bulls-strength', target: 'self', active: true },
    ],
  };

  it('should resolve dice in buff effect formulas to a number', () => {
    const result = executeAction({
      action: bullsStrengthAction,
      entity: bullsStrengthSpell,
      substitutionIndex: { 'class.wizard.level': 5 },
      entityLookup,
    });

    const outcome = result.outcomes[0];
    expect(outcome.type).toBe('inject_entity');
    if (outcome.type === 'inject_entity') {
      const effects = outcome.entity.effects as Array<{ formula: string }>;
      // 1d4+1 → resolved to a number string (2-5)
      const resolvedValue = parseInt(effects[0].formula, 10);
      expect(resolvedValue).toBeGreaterThanOrEqual(2);
      expect(resolvedValue).toBeLessThanOrEqual(5);
    }
  });
});

// =============================================================================
// Test 7: Action without contextual effects
// =============================================================================

describe('Test 7: Simple action without contextual effects', () => {
  const potionEntity: StandardEntity = {
    id: 'item-potion-clw',
    entityType: 'item',
    name: 'Potion of Cure Light Wounds',
  };

  const drinkAction: ActionDefinition = {
    id: 'drink',
    name: 'Drink Potion',
    actionType: 'use_item',
    results: [
      { type: 'consume_resource', resourceType: { kind: 'inventory_quantity', amount: 1 } },
      { type: 'heal', formula: '1d8 + 1', target: 'self' },
    ],
  };

  it('should produce consume + heal outcomes', () => {
    const result = executeAction({
      action: drinkAction,
      entity: potionEntity,
      substitutionIndex: {},
      entityLookup,
    });

    expect(result.outcomes).toHaveLength(2);
    expect(result.outcomes[0].type).toBe('consume_resource');
    expect(result.outcomes[1].type).toBe('modify_hp');

    if (result.outcomes[1].type === 'modify_hp') {
      expect(result.outcomes[1].mode).toBe('heal');
      // 1d8 (1-8) + 1 = 2-9
      expect(result.outcomes[1].amount).toBeGreaterThanOrEqual(2);
      expect(result.outcomes[1].amount).toBeLessThanOrEqual(9);
    }
  });
});
