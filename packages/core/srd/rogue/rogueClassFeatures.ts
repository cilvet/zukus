/**
 * Rogue Class Features for D&D 3.5
 * 
 * This file defines all class features (aptitudes) for the Rogue class
 * as StandardEntity objects with the 'classFeature' entityType.
 * 
 * ## Variables System
 * 
 * Scalable abilities use CUSTOM_VARIABLE_DEFINITION in `legacy_specialChanges`:
 * - Sneak Attack defines: `sneakAttackDiceAmount`, `sneakAttackDiceType`
 * - Trap Sense defines: `trapSenseBonus`
 * 
 * Variables are referenced in formulas as `@customVariable.{variableId}`
 * 
 * These variables can be expanded by prestige classes or modified by
 * other sources (feats, items, etc.) using CUSTOM_VARIABLE changes.
 * 
 * ## Effects vs Legacy Changes
 * 
 * - `effects`: New system using target paths (e.g., "savingThrow.reflex.total")
 * - `legacy_changes`: Old system using ChangeTypes enum (for backwards compatibility)
 * - `legacy_specialChanges`: For special changes like variable definitions
 */

import type { StandardEntity } from '../../core/domain/entities/types/base';
import type { Effect } from '../../core/domain/character/baseData/effects';
import { effectTargets } from '../../core/domain/character/baseData/effects';
import type { AttackContextualChange } from '../../core/domain/character/baseData/contextualChange';
import { ChangeTypes } from '../../core/domain/character/baseData/changes';
import type { CustomVariableDefinitionChange } from '../../core/domain/character/baseData/specialChanges';

// =============================================================================
// SNEAK ATTACK
// =============================================================================

/**
 * Sneak Attack - Core Rogue ability
 * 
 * Deals extra damage when flanking or when target is denied Dex to AC.
 * Uses variables for maximum extensibility:
 * - sneakAttackDiceAmount: ceil(@class.rogue.level / 2) → 1 at L1, 10 at L19
 * - sneakAttackDiceType: 6 (d6 by default, can be modified)
 * 
 * Damage formula: (@customVariable.sneakAttackDiceAmount)d(@customVariable.sneakAttackDiceType)
 */
export const sneakAttack: StandardEntity = {
  id: 'rogue-sneak-attack',
  entityType: 'classFeature',
  name: 'Sneak Attack',
  description: `If a rogue can catch an opponent when he is unable to defend himself effectively from her attack, she can strike a vital spot for extra damage.

The rogue's attack deals extra damage any time her target would be denied a Dexterity bonus to AC (whether the target actually has a Dexterity bonus or not), or when the rogue flanks her target. This extra damage is 1d6 at 1st level, and it increases by 1d6 every two rogue levels thereafter.

Should the rogue score a critical hit with a sneak attack, this extra damage is not multiplied.

Ranged attacks can count as sneak attacks only if the target is within 30 feet.

A rogue can sneak attack only living creatures with discernible anatomies—undead, constructs, oozes, plants, and incorporeal creatures lack vital areas to attack. Any creature that is immune to critical hits is not vulnerable to sneak attacks.`,
  tags: ['rogueAbility', 'damage', 'precision'],
  
  // Special changes to define custom variables for sneak attack
  legacy_specialChanges: [
    {
      type: 'CUSTOM_VARIABLE_DEFINITION',
      variableId: 'sneakAttackDiceAmount',
      name: 'Sneak Attack Dice Amount',
      description: 'Number of dice for sneak attack damage',
      baseSources: [
        {
          type: 'CUSTOM_VARIABLE',
          uniqueId: 'sneakAttackDiceAmount',
          bonusTypeId: 'BASE',
          formula: { expression: 'ceil(@class.rogue.level / 2)' },
          name: 'Rogue Sneak Attack Progression',
          createVariableForSource: true,
        },
      ],
    } as CustomVariableDefinitionChange,
    {
      type: 'CUSTOM_VARIABLE_DEFINITION',
      variableId: 'sneakAttackDiceType',
      name: 'Sneak Attack Dice Type',
      description: 'Type of die for sneak attack damage (6 = d6)',
      baseSources: [
        {
          type: 'CUSTOM_VARIABLE',
          uniqueId: 'sneakAttackDiceType',
          bonusTypeId: 'BASE',
          formula: { expression: '6' }, // d6 by default
          name: 'Sneak Attack Dice Type Base',
          createVariableForSource: true,
        },
      ],
    } as CustomVariableDefinitionChange,
  ],
  
  // Contextual change for attack damage (situational)
  // Applied when flanking or target is denied Dex to AC
  legacy_contextualChanges: [
    {
      type: 'attack',
      name: 'Sneak Attack',
      appliesTo: 'all', // Both melee and ranged (within 30 ft for ranged)
      optional: true,   // Player chooses when conditions are met
      available: true,
      variables: [],    // No user-configurable variables, dice are automatic
      changes: [
        {
          type: ChangeTypes.DAMAGE,
          // Formula uses the variables defined above
          // This produces: 1d6 at L1, 2d6 at L3, ... 10d6 at L19
          formula: { expression: '(@customVariable.sneakAttackDiceAmount)d(@customVariable.sneakAttackDiceType)' },
          bonusTypeId: 'UNTYPED',
          // Context fields required by ContextualizedChange
          name: 'Sneak Attack',
          originType: 'classFeature',
          originId: 'rogue-sneak-attack',
        },
      ],
    } as AttackContextualChange,
  ],
} as StandardEntity;

// =============================================================================
// TRAPFINDING
// =============================================================================

/**
 * Trapfinding - Allows finding magical and high-DC traps
 * 
 * This is a qualitative ability (no numeric bonus).
 * Without this ability, rogues cannot find traps with DC > 20.
 */
export const trapfinding: StandardEntity = {
  id: 'rogue-trapfinding',
  entityType: 'classFeature',
  name: 'Trapfinding',
  description: `Rogues (and only rogues) can use the Search skill to locate traps when the task has a Difficulty Class higher than 20.

Finding a nonmagical trap has a DC of at least 20, or higher if it is well hidden. Finding a magic trap has a DC of 25 + the level of the spell used to create it.

Rogues (and only rogues) can use the Disable Device skill to disarm magic traps. A magic trap generally has a DC of 25 + the level of the spell used to create it.

A rogue who beats a trap's DC by 10 or more with a Disable Device check can study a trap, figure out how it works, and bypass it (with her party) without disarming it.`,
  tags: ['rogueAbility', 'skill', 'traps'],
} as StandardEntity;

// =============================================================================
// EVASION
// =============================================================================

/**
 * Evasion - Take no damage on successful Reflex save
 * 
 * This is a qualitative ability that modifies how Reflex saves work.
 * When a Reflex save would result in half damage, success means no damage.
 */
export const evasion: StandardEntity = {
  id: 'rogue-evasion',
  entityType: 'classFeature',
  name: 'Evasion',
  description: `At 2nd level and higher, a rogue can avoid even magical and unusual attacks with great agility.

If she makes a successful Reflex saving throw against an attack that normally deals half damage on a successful save, she instead takes no damage.

Evasion can be used only if the rogue is wearing light armor or no armor.

A helpless rogue does not gain the benefit of evasion.`,
  tags: ['rogueAbility', 'defensive', 'reflex'],
} as StandardEntity;

// =============================================================================
// TRAP SENSE
// =============================================================================

/**
 * Trap Sense - Bonus to AC and Reflex saves vs traps
 * 
 * Uses variables for extensibility:
 * - trapSenseBonus: floor((@class.rogue.level + 1) / 3) → +1 at L3, +2 at L6, etc.
 * 
 * Provides bonus to:
 * - Reflex saves vs traps
 * - AC vs attacks made by traps
 */
export const trapSense: StandardEntity = {
  id: 'rogue-trap-sense',
  entityType: 'classFeature',
  name: 'Trap Sense',
  description: `At 3rd level, a rogue gains an intuitive sense that alerts her to danger from traps, giving her a +1 bonus on Reflex saves made to avoid traps and a +1 dodge bonus to AC against attacks made by traps.

These bonuses rise to +2 when the rogue reaches 6th level, to +3 when she reaches 9th level, to +4 when she reaches 12th level, to +5 at 15th, and to +6 at 18th level.

Trap sense bonuses gained from multiple classes stack.`,
  tags: ['rogueAbility', 'defensive', 'traps'],
  
  // Special change to define custom variable for trap sense bonus
  legacy_specialChanges: [
    {
      type: 'CUSTOM_VARIABLE_DEFINITION',
      variableId: 'trapSenseBonus',
      name: 'Trap Sense Bonus',
      description: 'Bonus to Reflex saves and AC vs traps',
      baseSources: [
        {
          type: 'CUSTOM_VARIABLE',
          uniqueId: 'trapSenseBonus',
          bonusTypeId: 'BASE',
          // Formula: +1 at L3, +2 at L6, +3 at L9, +4 at L12, +5 at L15, +6 at L18
          formula: { expression: 'floor((@class.rogue.level + 1) / 3)' },
          name: 'Rogue Trap Sense Progression',
          createVariableForSource: true,
        },
      ],
    } as CustomVariableDefinitionChange,
  ],
  
  // Effects: Bonus to Reflex saves and AC vs traps
  // Note: These are conditional bonuses (only vs traps)
  // In a full implementation, these would have conditions attached
  effects: [
    {
      target: effectTargets.CUSTOM_VARIABLE('trapSenseReflexBonus'),
      formula: '@customVariable.trapSenseBonus',
      bonusType: 'UNTYPED',
    } as Effect,
    {
      target: effectTargets.CUSTOM_VARIABLE('trapSenseACBonus'),
      formula: '@customVariable.trapSenseBonus',
      bonusType: 'DODGE',
    } as Effect,
  ],
} as StandardEntity;

// =============================================================================
// UNCANNY DODGE
// =============================================================================

/**
 * Uncanny Dodge - Retain Dex bonus to AC when flat-footed
 * 
 * This is a qualitative ability that modifies AC calculation conditions.
 */
export const uncannyDodge: StandardEntity = {
  id: 'rogue-uncanny-dodge',
  entityType: 'classFeature',
  name: 'Uncanny Dodge',
  description: `Starting at 4th level, a rogue can react to danger before her senses would normally allow her to do so.

She retains her Dexterity bonus to AC (if any) even if she is caught flat-footed or struck by an invisible attacker.

However, she still loses her Dexterity bonus to AC if immobilized.

If a rogue already has uncanny dodge from a different class, she automatically gains improved uncanny dodge instead.`,
  tags: ['rogueAbility', 'defensive', 'awareness'],
} as StandardEntity;

// =============================================================================
// IMPROVED UNCANNY DODGE
// =============================================================================

/**
 * Improved Uncanny Dodge - Cannot be flanked
 * 
 * Suppresses the base Uncanny Dodge feature (replaces it).
 * Adds flanking immunity on top of the base benefits.
 */
export const improvedUncannyDodge: StandardEntity = {
  id: 'rogue-improved-uncanny-dodge',
  entityType: 'classFeature',
  name: 'Improved Uncanny Dodge',
  description: `A rogue of 8th level or higher can no longer be flanked.

This defense denies another rogue the ability to sneak attack the character by flanking her, unless the attacker has at least four more rogue levels than the target does.

If a character already has uncanny dodge from a second class, the character automatically gains improved uncanny dodge instead, and the levels from the classes that grant uncanny dodge stack to determine the minimum rogue level required to flank the character.`,
  tags: ['rogueAbility', 'defensive', 'awareness'],
  
  // Suppress base Uncanny Dodge when this is active
  suppression: [
    { scope: 'applied', ids: ['rogue-uncanny-dodge'] },
  ],
} as StandardEntity;

// =============================================================================
// SPECIAL ABILITIES (Selections at levels 10, 13, 16, 19)
// =============================================================================

/**
 * Crippling Strike - Strength damage on sneak attack
 */
export const cripplingStrike: StandardEntity = {
  id: 'rogue-crippling-strike',
  entityType: 'classFeature',
  name: 'Crippling Strike',
  description: `A rogue with this ability can sneak attack opponents with such precision that her blows weaken and hamper them.

An opponent damaged by one of her sneak attacks also takes 2 points of Strength damage.

Ability points lost to damage return on their own at the rate of 1 point per day for each damaged ability.`,
  tags: ['rogueAbility', 'rogueSpecialAbility', 'damage', 'debuff'],
} as StandardEntity;

/**
 * Defensive Roll - Avoid lethal blows
 */
export const defensiveRoll: StandardEntity = {
  id: 'rogue-defensive-roll',
  entityType: 'classFeature',
  name: 'Defensive Roll',
  description: `The rogue can roll with a potentially lethal blow to take less damage from it than she otherwise would.

Once per day, when she would be reduced to 0 or fewer hit points by damage in combat (from a weapon or other blow, not a spell or special ability), the rogue can attempt to roll with the damage.

To use this ability, the rogue must attempt a Reflex saving throw (DC = damage dealt). If the save succeeds, she takes only half damage from the blow; if it fails, she takes full damage.

She must be aware of the attack and able to react to it in order to execute her defensive roll—if she is denied her Dexterity bonus to AC, she can't use this ability.

Since this effect would not normally allow a character to make a Reflex save for half damage, the rogue's evasion ability does not apply to the defensive roll.`,
  tags: ['rogueAbility', 'rogueSpecialAbility', 'defensive', 'survival'],
} as StandardEntity;

/**
 * Improved Evasion - Take half damage even on failed save
 */
export const improvedEvasion: StandardEntity = {
  id: 'rogue-improved-evasion',
  entityType: 'classFeature',
  name: 'Improved Evasion',
  description: `This ability works like evasion, except that while the rogue still takes no damage on a successful Reflex saving throw against attacks, she henceforth takes only half damage on a failed save.

A helpless rogue does not gain the benefit of improved evasion.`,
  tags: ['rogueAbility', 'rogueSpecialAbility', 'defensive', 'reflex'],
  
  // Suppress base Evasion when this is active
  suppression: [
    { scope: 'applied', ids: ['rogue-evasion'] },
  ],
} as StandardEntity;

/**
 * Opportunist - Extra attack of opportunity
 */
export const opportunist: StandardEntity = {
  id: 'rogue-opportunist',
  entityType: 'classFeature',
  name: 'Opportunist',
  description: `Once per round, the rogue can make an attack of opportunity against an opponent who has just been struck for damage in melee by another character.

This attack counts as the rogue's attack of opportunity for that round.

Even a rogue with the Combat Reflexes feat can't use the opportunist ability more than once per round.`,
  tags: ['rogueAbility', 'rogueSpecialAbility', 'offensive', 'reaction'],
} as StandardEntity;

/**
 * Skill Mastery - Take 10 on certain skills under pressure
 */
export const skillMastery: StandardEntity = {
  id: 'rogue-skill-mastery',
  entityType: 'classFeature',
  name: 'Skill Mastery',
  description: `The rogue becomes so certain in the use of certain skills that she can use them reliably even under adverse conditions.

Upon gaining this ability, she selects a number of skills equal to 3 + her Intelligence modifier.

When making a skill check with one of these skills, she may take 10 even if stress and distractions would normally prevent her from doing so.

A rogue may gain this special ability multiple times, selecting additional skills for it to apply to each time.`,
  tags: ['rogueAbility', 'rogueSpecialAbility', 'skill'],
  
  // This feature has a selector for choosing skills
  // The providable addon allows it to grant skill selections
  providers: [
    {
      selector: {
        id: 'skill-mastery-skills',
        name: 'Skill Mastery Skills',
        entityType: 'skill',
        // In a full implementation, this would filter to class skills only
        // and limit to 3 + INT modifier selections
        min: 3,
        max: 10, // 3 base + up to 7 from INT (for INT 24)
      },
    },
  ],
} as StandardEntity;

/**
 * Slippery Mind - Second save vs enchantments
 */
export const slipperyMind: StandardEntity = {
  id: 'rogue-slippery-mind',
  entityType: 'classFeature',
  name: 'Slippery Mind',
  description: `This ability represents the rogue's ability to wriggle free from magical effects that would otherwise control or compel her.

If a rogue with slippery mind is affected by an enchantment spell or effect and fails her saving throw, she can attempt it again 1 round later at the same DC.

She gets only this one extra chance to succeed on her saving throw.`,
  tags: ['rogueAbility', 'rogueSpecialAbility', 'defensive', 'mental'],
} as StandardEntity;

/**
 * Feat - Select a bonus feat
 * 
 * This special ability allows selecting any feat the rogue qualifies for.
 */
export const rogueBonusFeat: StandardEntity = {
  id: 'rogue-bonus-feat',
  entityType: 'classFeature',
  name: 'Bonus Feat',
  description: `A rogue may select a bonus feat in place of a special ability.

The feat must be one for which the rogue meets the prerequisites.`,
  tags: ['rogueAbility', 'rogueSpecialAbility', 'feat'],
  
  // Provider to select any feat
  providers: [
    {
      selector: {
        id: 'rogue-bonus-feat-selection',
        name: 'Bonus Feat',
        entityType: 'feat',
        // No filter = any feat the character qualifies for
        min: 1,
        max: 1,
      },
    },
  ],
} as StandardEntity;

// =============================================================================
// EXPORT ALL CLASS FEATURES
// =============================================================================

/**
 * All Rogue class features as an array
 */
export const rogueClassFeatures: StandardEntity[] = [
  // Core abilities
  sneakAttack,
  trapfinding,
  evasion,
  trapSense,
  uncannyDodge,
  improvedUncannyDodge,
  
  // Special abilities (selections)
  cripplingStrike,
  defensiveRoll,
  improvedEvasion,
  opportunist,
  skillMastery,
  slipperyMind,
  rogueBonusFeat,
];

/**
 * Map of feature IDs to features for quick lookup
 */
export const rogueClassFeaturesById: Record<string, StandardEntity> = 
  Object.fromEntries(rogueClassFeatures.map(f => [f.id, f]));

