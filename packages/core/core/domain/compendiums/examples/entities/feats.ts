/**
 * D&D 3.5 Example Feats
 *
 * Includes general feats and fighter bonus feats.
 */

import type { StandardEntity } from '../../../entities/types/base';
import type { AttackContextualChange } from '../../../character/baseData/contextualChange';
import type { Effect } from '../../../character/baseData/effects';
import { effectTargets } from '../../../character/baseData/effects';
import { ChangeTypes } from '../../../character/baseData/changes';

// =============================================================================
// General Combat Feats
// =============================================================================

const generalFeats: StandardEntity[] = [
  {
    id: 'feat-power-attack',
    entityType: 'feat',
    name: 'Power Attack',
    description: 'You can trade accuracy for power in melee combat.',
    category: 'Combat',
    benefit: 'On your turn, before making attack rolls with a melee weapon, you can choose to subtract a number of your choice (up to your BAB) from all melee attack rolls and add the same number to all melee damage rolls.',
    tags: ['fighterBonusFeat', 'combat', 'attack'],
    legacy_contextualChanges: [
      {
        type: 'attack',
        name: 'Power Attack',
        appliesTo: 'melee',
        optional: true,
        available: true,
        variables: [
          {
            name: 'Power Attack Points',
            identifier: 'powerAttackPoints',
            min: 1,
            max: 5,
          },
        ],
        changes: [
          {
            type: ChangeTypes.ATTACK_ROLLS,
            formula: { expression: '-@powerAttackPoints' },
            bonusTypeId: 'UNTYPED',
          },
          {
            type: ChangeTypes.DAMAGE,
            formula: { expression: '@powerAttackPoints * 2' },
            bonusTypeId: 'UNTYPED',
          },
        ],
      } as AttackContextualChange,
    ],
  } as StandardEntity,
  {
    id: 'feat-cleave',
    entityType: 'feat',
    name: 'Cleave',
    description: 'You can follow through with powerful blows after felling enemies.',
    category: 'Combat',
    prerequisites: ['feat-power-attack'],
    benefit: 'If you deal an opponent enough damage to drop them with a melee attack, you get an immediate extra melee attack against another opponent adjacent to you.',
    tags: ['fighterBonusFeat', 'combat', 'attack'],
  } as StandardEntity,
  {
    id: 'feat-great-cleave',
    entityType: 'feat',
    name: 'Great Cleave',
    description: 'You can cleave through multiple opponents.',
    category: 'Combat',
    prerequisites: ['feat-power-attack', 'feat-cleave'],
    benefit: 'This feat works like Cleave, except there is no limit to the number of times you can use it per round.',
    tags: ['fighterBonusFeat', 'combat', 'attack'],
  } as StandardEntity,
  {
    id: 'feat-dodge',
    entityType: 'feat',
    name: 'Dodge',
    description: 'You are adept at dodging attacks.',
    category: 'General',
    benefit: 'During your turn, you may designate an opponent and receive a +1 dodge bonus to AC against attacks from that opponent.',
    tags: ['fighterBonusFeat', 'defensive', 'general'],
    effects: [
      {
        target: effectTargets.AC_TOTAL,
        formula: '1',
        bonusType: 'DODGE',
      } as Effect,
    ],
  } as StandardEntity,
  {
    id: 'feat-mobility',
    entityType: 'feat',
    name: 'Mobility',
    description: 'You are adept at moving in combat.',
    category: 'General',
    prerequisites: ['feat-dodge'],
    benefit: 'You receive a +4 dodge bonus to AC against attacks of opportunity.',
    tags: ['fighterBonusFeat', 'movement', 'general'],
    effects: [
      {
        target: effectTargets.AC_TOTAL,
        formula: '4',
        bonusType: 'DODGE',
      } as Effect,
    ],
  } as StandardEntity,
  {
    id: 'feat-spring-attack',
    entityType: 'feat',
    name: 'Spring Attack',
    description: 'You can move toward an enemy, strike, and withdraw.',
    category: 'Combat',
    prerequisites: ['feat-dodge', 'feat-mobility'],
    benefit: 'You can move both before and after the attack without provoking attacks of opportunity from the defender.',
    tags: ['fighterBonusFeat', 'combat', 'movement'],
  } as StandardEntity,
  {
    id: 'feat-improved-initiative',
    entityType: 'feat',
    name: 'Improved Initiative',
    description: 'You react faster than most in combat.',
    category: 'General',
    benefit: 'You receive a +4 bonus to your initiative rolls.',
    tags: ['fighterBonusFeat', 'initiative', 'general'],
    effects: [
      {
        target: effectTargets.INITIATIVE_TOTAL,
        formula: '4',
        bonusType: 'ENHANCEMENT',
      } as Effect,
    ],
  } as StandardEntity,
  {
    id: 'feat-toughness',
    entityType: 'feat',
    name: 'Toughness',
    description: 'You are tougher than most.',
    category: 'General',
    benefit: 'You receive +3 hit points.',
    tags: ['fighterBonusFeat', 'vitality', 'general'],
    effects: [
      {
        target: effectTargets.HP_MAX,
        formula: '3',
        bonusType: 'UNTYPED',
      } as Effect,
    ],
  } as StandardEntity,
  {
    id: 'feat-combat-reflexes',
    entityType: 'feat',
    name: 'Combat Reflexes',
    description: 'You can make multiple attacks of opportunity.',
    category: 'General',
    benefit: 'You can make a number of attacks of opportunity equal to 1 + your Dexterity modifier.',
    tags: ['fighterBonusFeat', 'combat', 'general'],
  } as StandardEntity,
];

// =============================================================================
// Weapon Feats
// =============================================================================

const weaponFeats: StandardEntity[] = [
  {
    id: 'feat-weapon-focus',
    entityType: 'feat',
    name: 'Weapon Focus',
    description: 'You are especially skilled with a specific weapon type.',
    category: 'Combat',
    benefit: 'You receive a +1 bonus on all attack rolls made with the selected weapon.',
    tags: ['fighterBonusFeat', 'combat', 'weapon'],
  } as StandardEntity,
  {
    id: 'feat-weapon-specialization',
    entityType: 'feat',
    name: 'Weapon Specialization',
    description: 'You deal extra damage with a specific weapon type.',
    category: 'Combat',
    prerequisites: ['feat-weapon-focus'],
    benefit: 'You gain a +2 bonus on all damage rolls made with the selected weapon.',
    tags: ['fighterBonusFeat', 'combat', 'weapon'],
  } as StandardEntity,
  {
    id: 'feat-greater-weapon-focus',
    entityType: 'feat',
    name: 'Greater Weapon Focus',
    description: 'You have exceptional skill with a specific weapon type.',
    category: 'Combat',
    prerequisites: ['feat-weapon-focus'],
    benefit: 'You gain an additional +1 bonus on attack rolls made with the selected weapon.',
    tags: ['fighterBonusFeat', 'combat', 'weapon'],
  } as StandardEntity,
  {
    id: 'feat-greater-weapon-specialization',
    entityType: 'feat',
    name: 'Greater Weapon Specialization',
    description: 'You deal even more damage with a specific weapon type.',
    category: 'Combat',
    prerequisites: ['feat-weapon-focus', 'feat-weapon-specialization', 'feat-greater-weapon-focus'],
    benefit: 'You gain an additional +2 bonus on damage rolls made with the selected weapon.',
    tags: ['fighterBonusFeat', 'combat', 'weapon'],
  } as StandardEntity,
  {
    id: 'feat-improved-critical',
    entityType: 'feat',
    name: 'Improved Critical',
    description: 'Attacks with the weapon are more likely to be critical hits.',
    category: 'Combat',
    benefit: 'Your threat range is doubled with the selected weapon.',
    tags: ['fighterBonusFeat', 'combat', 'weapon'],
  } as StandardEntity,
  {
    id: 'feat-weapon-finesse',
    entityType: 'feat',
    name: 'Weapon Finesse',
    description: 'You can use Dexterity instead of Strength for attacks with light weapons.',
    category: 'Combat',
    benefit: 'Use your Dexterity modifier instead of Strength on attack rolls with light weapons.',
    tags: ['fighterBonusFeat', 'combat', 'weapon'],
  } as StandardEntity,
];

// =============================================================================
// Ranged Combat Feats
// =============================================================================

const rangedFeats: StandardEntity[] = [
  {
    id: 'feat-point-blank-shot',
    entityType: 'feat',
    name: 'Point Blank Shot',
    description: 'You are skilled with ranged attacks against nearby opponents.',
    category: 'Combat',
    benefit: 'You receive +1 on attack and damage rolls with ranged attacks at 30 feet or less.',
    tags: ['fighterBonusFeat', 'combat', 'ranged'],
  } as StandardEntity,
  {
    id: 'feat-precise-shot',
    entityType: 'feat',
    name: 'Precise Shot',
    description: 'You can shoot at enemies in melee without penalty.',
    category: 'Combat',
    prerequisites: ['feat-point-blank-shot'],
    benefit: 'You do not take the -4 penalty when shooting at enemies engaged in melee combat.',
    tags: ['fighterBonusFeat', 'combat', 'ranged'],
  } as StandardEntity,
  {
    id: 'feat-rapid-shot',
    entityType: 'feat',
    name: 'Rapid Shot',
    description: 'You can fire with exceptional speed.',
    category: 'Combat',
    prerequisites: ['feat-point-blank-shot'],
    benefit: 'You gain an extra attack per round at -2 to all attacks.',
    tags: ['fighterBonusFeat', 'combat', 'ranged'],
  } as StandardEntity,
  {
    id: 'feat-manyshot',
    entityType: 'feat',
    name: 'Manyshot',
    description: 'You can fire multiple arrows simultaneously.',
    category: 'Combat',
    prerequisites: ['feat-point-blank-shot', 'feat-rapid-shot'],
    benefit: 'As a standard action, fire two arrows with one attack roll (-4).',
    tags: ['fighterBonusFeat', 'combat', 'ranged'],
  } as StandardEntity,
  {
    id: 'feat-shot-on-the-run',
    entityType: 'feat',
    name: 'Shot on the Run',
    description: 'You can move, shoot, and move again.',
    category: 'Combat',
    prerequisites: ['feat-dodge', 'feat-mobility', 'feat-point-blank-shot'],
    benefit: 'You can move before and after a ranged attack.',
    tags: ['fighterBonusFeat', 'combat', 'ranged', 'movement'],
  } as StandardEntity,
];

// =============================================================================
// Two-Weapon Fighting Feats
// =============================================================================

const twoWeaponFeats: StandardEntity[] = [
  {
    id: 'feat-two-weapon-fighting',
    entityType: 'feat',
    name: 'Two-Weapon Fighting',
    description: 'You can fight with a weapon in each hand.',
    category: 'Combat',
    benefit: 'You reduce the penalties for fighting with two weapons.',
    tags: ['fighterBonusFeat', 'combat'],
  } as StandardEntity,
  {
    id: 'feat-improved-two-weapon-fighting',
    entityType: 'feat',
    name: 'Improved Two-Weapon Fighting',
    description: 'You are an expert at fighting with two weapons.',
    category: 'Combat',
    prerequisites: ['feat-two-weapon-fighting'],
    benefit: 'You gain a second attack with the off-hand weapon at -5.',
    tags: ['fighterBonusFeat', 'combat'],
  } as StandardEntity,
  {
    id: 'feat-greater-two-weapon-fighting',
    entityType: 'feat',
    name: 'Greater Two-Weapon Fighting',
    description: 'You are a master at fighting with two weapons.',
    category: 'Combat',
    prerequisites: ['feat-two-weapon-fighting', 'feat-improved-two-weapon-fighting'],
    benefit: 'You gain a third attack with the off-hand weapon at -10.',
    tags: ['fighterBonusFeat', 'combat'],
  } as StandardEntity,
];

// =============================================================================
// Combat Maneuver Feats
// =============================================================================

const maneuverFeats: StandardEntity[] = [
  {
    id: 'feat-combat-expertise',
    entityType: 'feat',
    name: 'Combat Expertise',
    description: 'You can trade attack for defense.',
    category: 'Combat',
    benefit: 'Take up to -5 on attack to add the same value to AC as a dodge bonus.',
    tags: ['fighterBonusFeat', 'combat', 'defensive'],
  } as StandardEntity,
  {
    id: 'feat-improved-trip',
    entityType: 'feat',
    name: 'Improved Trip',
    description: 'You are trained at tripping opponents.',
    category: 'Combat',
    prerequisites: ['feat-combat-expertise'],
    benefit: 'You do not provoke attacks of opportunity when tripping. +4 to the attempt.',
    tags: ['fighterBonusFeat', 'combat'],
  } as StandardEntity,
  {
    id: 'feat-improved-disarm',
    entityType: 'feat',
    name: 'Improved Disarm',
    description: 'You know how to disarm opponents.',
    category: 'Combat',
    prerequisites: ['feat-combat-expertise'],
    benefit: 'You do not provoke attacks of opportunity when disarming. +4 to the attempt.',
    tags: ['fighterBonusFeat', 'combat'],
  } as StandardEntity,
  {
    id: 'feat-improved-bull-rush',
    entityType: 'feat',
    name: 'Improved Bull Rush',
    description: 'You know how to push opponents.',
    category: 'Combat',
    prerequisites: ['feat-power-attack'],
    benefit: 'You do not provoke attacks of opportunity when bull rushing. +4 to the attempt.',
    tags: ['fighterBonusFeat', 'combat'],
  } as StandardEntity,
  {
    id: 'feat-improved-overrun',
    entityType: 'feat',
    name: 'Improved Overrun',
    description: 'You are skilled at overrunning opponents.',
    category: 'Combat',
    prerequisites: ['feat-power-attack'],
    benefit: 'You do not provoke attacks of opportunity when overrunning. +4 to the attempt.',
    tags: ['fighterBonusFeat', 'combat'],
  } as StandardEntity,
  {
    id: 'feat-improved-sunder',
    entityType: 'feat',
    name: 'Improved Sunder',
    description: 'You are skilled at destroying weapons and shields.',
    category: 'Combat',
    prerequisites: ['feat-power-attack'],
    benefit: 'You do not provoke attacks of opportunity when sundering. +4 to the attempt.',
    tags: ['fighterBonusFeat', 'combat'],
  } as StandardEntity,
  {
    id: 'feat-whirlwind-attack',
    entityType: 'feat',
    name: 'Whirlwind Attack',
    description: 'You can attack all enemies within reach.',
    category: 'Combat',
    prerequisites: ['feat-dodge', 'feat-mobility', 'feat-spring-attack'],
    benefit: 'Make one attack against each opponent within reach.',
    tags: ['fighterBonusFeat', 'combat'],
  } as StandardEntity,
];

// =============================================================================
// Unarmed Combat Feats
// =============================================================================

const unarmedFeats: StandardEntity[] = [
  {
    id: 'feat-improved-unarmed-strike',
    entityType: 'feat',
    name: 'Improved Unarmed Strike',
    description: 'You are skilled at fighting unarmed.',
    category: 'Combat',
    benefit: 'You are considered armed when unarmed.',
    tags: ['fighterBonusFeat', 'combat'],
  } as StandardEntity,
  {
    id: 'feat-stunning-fist',
    entityType: 'feat',
    name: 'Stunning Fist',
    description: 'You can stun opponents with unarmed strikes.',
    category: 'Combat',
    prerequisites: ['feat-improved-unarmed-strike'],
    benefit: 'The enemy must make a Fortitude save or be stunned.',
    tags: ['fighterBonusFeat', 'combat'],
  } as StandardEntity,
];

// =============================================================================
// Mounted Combat Feats
// =============================================================================

const mountedFeats: StandardEntity[] = [
  {
    id: 'feat-mounted-combat',
    entityType: 'feat',
    name: 'Mounted Combat',
    description: 'You are skilled at mounted combat.',
    category: 'Combat',
    benefit: 'Once per round, you can negate a hit on your mount with a Ride check.',
    tags: ['fighterBonusFeat', 'combat', 'mounted'],
  } as StandardEntity,
  {
    id: 'feat-ride-by-attack',
    entityType: 'feat',
    name: 'Ride-By Attack',
    description: 'You can attack while charging on a mount.',
    category: 'Combat',
    prerequisites: ['feat-mounted-combat'],
    benefit: 'You can move before and after attacking during a mounted charge.',
    tags: ['fighterBonusFeat', 'combat', 'mounted'],
  } as StandardEntity,
  {
    id: 'feat-spirited-charge',
    entityType: 'feat',
    name: 'Spirited Charge',
    description: 'You deal devastating damage on mounted charges.',
    category: 'Combat',
    prerequisites: ['feat-mounted-combat', 'feat-ride-by-attack'],
    benefit: 'Double damage (triple with a lance) on a mounted charge.',
    tags: ['fighterBonusFeat', 'combat', 'mounted'],
  } as StandardEntity,
];

// =============================================================================
// Other Combat Feats
// =============================================================================

const otherCombatFeats: StandardEntity[] = [
  {
    id: 'feat-blind-fight',
    entityType: 'feat',
    name: 'Blind-Fight',
    description: 'You know how to fight without seeing your enemies.',
    category: 'Combat',
    benefit: 'You can reroll the miss chance for concealment.',
    tags: ['fighterBonusFeat', 'combat'],
  } as StandardEntity,
];

// =============================================================================
// Magic Feats
// =============================================================================

const magicFeats: StandardEntity[] = [
  {
    id: 'feat-spell-focus',
    entityType: 'feat',
    name: 'Spell Focus',
    description: 'You are skilled with a school of magic.',
    category: 'General',
    benefit: '+1 to the DC of saving throws against your spells from the chosen school.',
    tags: ['magic', 'general'],
  } as StandardEntity,
];

// =============================================================================
// Export All Feats
// =============================================================================

export const allFeats: StandardEntity[] = [
  ...generalFeats,
  ...weaponFeats,
  ...rangedFeats,
  ...twoWeaponFeats,
  ...maneuverFeats,
  ...unarmedFeats,
  ...mountedFeats,
  ...otherCombatFeats,
  ...magicFeats,
];

// Export individual groups for reference
export {
  generalFeats,
  weaponFeats,
  rangedFeats,
  twoWeaponFeats,
  maneuverFeats,
  unarmedFeats,
  mountedFeats,
  magicFeats,
};
