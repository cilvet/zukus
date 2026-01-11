/**
 * Fighter Bonus Feats for D&D 3.5
 * 
 * These feats are available as bonus feats for the Fighter class.
 * All feats have the tag "fighterBonusFeat" for filtering in selectors.
 */

import type { StandardEntity } from '../../core/domain/entities/types/base';
import { ChangeTypes } from '../../core/domain/character/baseData/changes';
import type { AttackContextualChange } from '../../core/domain/character/baseData/contextualChange';

/**
 * Type for feat entities with feat-specific fields
 */
type FeatEntity = StandardEntity & {
  category?: string;
  prerequisites?: string[];
  benefit: string;
  normal?: string;
  special?: string;
};

// =============================================================================
// Power Attack
// =============================================================================

export const powerAttack: FeatEntity = {
  id: 'feat-power-attack',
  entityType: 'feat',
  name: 'Power Attack',
  description: 'You can make exceptionally powerful melee attacks.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat'],
  benefit: 'On your action, before making attack rolls for a round, you may choose to subtract a number from all melee attack rolls and add the same number to all melee damage rolls. This number may not exceed your base attack bonus. The penalty on attacks and bonus on damage apply until your next turn. If you attack with a two-handed weapon, or with a one-handed weapon wielded in two hands, instead add twice the number subtracted from your attack rolls.',
  normal: 'You cannot trade attack bonus for damage.',
  special: 'A fighter may select Power Attack as one of his fighter bonus feats.',
  // Prerequisite: Str 13
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
          max: 20, // Should be limited by BAB in practice
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
          formula: { expression: '@powerAttackPoints' },
          bonusTypeId: 'UNTYPED',
        },
      ],
    } as AttackContextualChange,
  ],
};

// =============================================================================
// Cleave
// =============================================================================

export const cleave: FeatEntity = {
  id: 'feat-cleave',
  entityType: 'feat',
  name: 'Cleave',
  description: 'You can strike another opponent when you drop your current foe.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat'],
  prerequisites: ['feat-power-attack'],
  benefit: 'If you deal a creature enough damage to make it drop (typically by dropping it to below 0 hit points or killing it), you get an immediate, extra melee attack against another creature within reach. You cannot take a 5-foot step before making this extra attack. The extra attack is with the same weapon and at the same bonus as the attack that dropped the previous creature. You can use this ability once per round.',
  special: 'A fighter may select Cleave as one of his fighter bonus feats.',
  // Prerequisite: Str 13, Power Attack
};

// =============================================================================
// Great Cleave
// =============================================================================

export const greatCleave: FeatEntity = {
  id: 'feat-great-cleave',
  entityType: 'feat',
  name: 'Great Cleave',
  description: 'You can cleave through multiple opponents.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat'],
  prerequisites: ['feat-power-attack', 'feat-cleave'],
  benefit: 'This feat works like Cleave, except that there is no limit to the number of times you can use it per round.',
  special: 'A fighter may select Great Cleave as one of his fighter bonus feats.',
  // Prerequisite: Str 13, Cleave, Power Attack, base attack bonus +4
};

// =============================================================================
// Weapon Focus
// =============================================================================

export const weaponFocus: FeatEntity = {
  id: 'feat-weapon-focus',
  entityType: 'feat',
  name: 'Weapon Focus',
  description: 'You are especially skilled with a specific weapon.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat', 'weapon'],
  benefit: 'You gain a +1 bonus on all attack rolls you make using the selected weapon.',
  special: 'You can gain this feat multiple times. Its effects do not stack. Each time you take the feat, it applies to a new type of weapon. A fighter may select Weapon Focus as one of his fighter bonus feats. He must have Weapon Focus with a weapon to gain the Weapon Specialization feat for that weapon.',
  // Prerequisite: Proficiency with selected weapon, base attack bonus +1
  legacy_changes: [
    {
      type: ChangeTypes.ATTACK_ROLLS,
      attackType: 'all',
      formula: { expression: '1' },
      bonusTypeId: 'COMPETENCE',
    },
  ],
  // Note: Weapon selection should be handled by conditions or UI selection
};

// =============================================================================
// Weapon Specialization
// =============================================================================

export const weaponSpecialization: FeatEntity = {
  id: 'feat-weapon-specialization',
  entityType: 'feat',
  name: 'Weapon Specialization',
  description: 'You deal extra damage with a specific weapon.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat', 'weapon'],
  prerequisites: ['feat-weapon-focus'],
  benefit: 'You gain a +2 bonus on all damage rolls you make using the selected weapon.',
  special: 'You can gain this feat multiple times. Its effects do not stack. Each time you take the feat, it applies to a new type of weapon. A fighter may select Weapon Specialization as one of his fighter bonus feats.',
  // Prerequisite: Proficiency with weapon, Weapon Focus with weapon, fighter level 4th
  legacy_changes: [
    {
      type: ChangeTypes.DAMAGE,
      formula: { expression: '2' },
      bonusTypeId: 'COMPETENCE',
    },
  ],
  // Note: Weapon selection should be handled by conditions or UI selection
};

// =============================================================================
// Greater Weapon Focus
// =============================================================================

export const greaterWeaponFocus: FeatEntity = {
  id: 'feat-greater-weapon-focus',
  entityType: 'feat',
  name: 'Greater Weapon Focus',
  description: 'You have exceptional skill with a specific weapon.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat', 'weapon'],
  prerequisites: ['feat-weapon-focus'],
  benefit: 'You gain a +1 bonus on all attack rolls you make using the selected weapon. This bonus stacks with the bonus from Weapon Focus.',
  special: 'You can gain this feat multiple times. Its effects do not stack. Each time you take the feat, it applies to a new type of weapon. A fighter may select Greater Weapon Focus as one of his fighter bonus feats.',
  // Prerequisite: Proficiency with weapon, Weapon Focus with weapon, fighter level 8th
  legacy_changes: [
    {
      type: ChangeTypes.ATTACK_ROLLS,
      attackType: 'all',
      formula: { expression: '1' },
      bonusTypeId: 'COMPETENCE',
    },
  ],
  // Note: Weapon selection should be handled by conditions or UI selection
};

// =============================================================================
// Greater Weapon Specialization
// =============================================================================

export const greaterWeaponSpecialization: FeatEntity = {
  id: 'feat-greater-weapon-specialization',
  entityType: 'feat',
  name: 'Greater Weapon Specialization',
  description: 'You deal even more damage with a specific weapon.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat', 'weapon'],
  prerequisites: ['feat-weapon-focus', 'feat-weapon-specialization', 'feat-greater-weapon-focus'],
  benefit: 'You gain a +2 bonus on all damage rolls you make using the selected weapon. This bonus stacks with the bonus from Weapon Specialization.',
  special: 'You can gain this feat multiple times. Its effects do not stack. Each time you take the feat, it applies to a new type of weapon. A fighter may select Greater Weapon Specialization as one of his fighter bonus feats.',
  // Prerequisite: Proficiency, Weapon Focus, Weapon Specialization, Greater Weapon Focus, fighter level 12th
  legacy_changes: [
    {
      type: ChangeTypes.DAMAGE,
      formula: { expression: '2' },
      bonusTypeId: 'COMPETENCE',
    },
  ],
  // Note: Weapon selection should be handled by conditions or UI selection
};

// =============================================================================
// Dodge
// =============================================================================

export const dodge: FeatEntity = {
  id: 'feat-dodge',
  entityType: 'feat',
  name: 'Dodge',
  description: 'You are adept at dodging blows.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat', 'defensive'],
  benefit: 'During your action, you designate an opponent and receive a +1 dodge bonus to Armor Class against attacks from that opponent. You can select a new opponent on any action. A condition that makes you lose your Dexterity bonus to Armor Class (if any) also makes you lose dodge bonuses. Also, dodge bonuses stack with each other, unlike most other types of bonuses.',
  special: 'A fighter may select Dodge as one of his fighter bonus feats.',
  // Prerequisite: Dex 13
  legacy_changes: [
    {
      type: ChangeTypes.AC,
      formula: { expression: '1' },
      bonusTypeId: 'DODGE',
    },
  ],
  // Note: Opponent selection and conditional application should be handled by the UI/combat system
};

// =============================================================================
// Mobility
// =============================================================================

export const mobility: FeatEntity = {
  id: 'feat-mobility',
  entityType: 'feat',
  name: 'Mobility',
  description: 'You are skilled at dodging past opponents.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat', 'defensive', 'movement'],
  prerequisites: ['feat-dodge'],
  benefit: 'You get a +4 dodge bonus to Armor Class against attacks of opportunity caused when you move out of or within a threatened area. A condition that makes you lose your Dexterity bonus to Armor Class (if any) also makes you lose dodge bonuses. Dodge bonuses stack with each other, unlike most types of bonuses.',
  special: 'A fighter may select Mobility as one of his fighter bonus feats.',
  // Prerequisite: Dex 13, Dodge
  legacy_changes: [
    {
      type: ChangeTypes.AC,
      formula: { expression: '4' },
      bonusTypeId: 'DODGE',
    },
  ],
  // Note: Attacks of opportunity detection and conditional application should be handled by the combat system
};

// =============================================================================
// Spring Attack
// =============================================================================

export const springAttack: FeatEntity = {
  id: 'feat-spring-attack',
  entityType: 'feat',
  name: 'Spring Attack',
  description: 'You can deftly move up to a foe, strike, and withdraw.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat', 'movement'],
  prerequisites: ['feat-dodge', 'feat-mobility'],
  benefit: 'When using the attack action with a melee weapon, you can move both before and after the attack, provided that your total distance moved is not greater than your speed. Moving in this way does not provoke an attack of opportunity from the defender you attack, though it might provoke attacks of opportunity from other creatures, if appropriate. You cannot use this feat if you are wearing heavy armor. You must move at least 5 feet both before and after you make your attack in order to utilize the benefits of Spring Attack.',
  special: 'A fighter may select Spring Attack as one of his fighter bonus feats.',
  // Prerequisite: Dex 13, Dodge, Mobility, base attack bonus +4
};

// =============================================================================
// Combat Expertise
// =============================================================================

export const combatExpertise: FeatEntity = {
  id: 'feat-combat-expertise',
  entityType: 'feat',
  name: 'Combat Expertise',
  description: 'You are trained at using your combat skill for defense as well as offense.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat', 'defensive'],
  benefit: 'When you use the attack action or the full attack action in melee, you can take a penalty of as much as -5 on your attack roll and add the same number (+5 or less) as a dodge bonus to your Armor Class. This number may not exceed your base attack bonus. The changes to attack rolls and Armor Class last until your next action.',
  normal: 'A character without the Combat Expertise feat can fight defensively while using the attack or full attack action to take a -4 penalty on attack rolls and gain a +2 dodge bonus to Armor Class.',
  special: 'A fighter may select Combat Expertise as one of his fighter bonus feats.',
  // Prerequisite: Int 13
  legacy_contextualChanges: [
    {
      type: 'attack',
      name: 'Combat Expertise',
      appliesTo: 'melee',
      optional: true,
      available: true,
      variables: [
        {
          name: 'Combat Expertise Points',
          identifier: 'combatExpertisePoints',
          min: 1,
          max: 5,
        },
      ],
      changes: [
        {
          type: ChangeTypes.ATTACK_ROLLS,
          attackType: 'melee',
          formula: { expression: '-@combatExpertisePoints' },
          bonusTypeId: 'UNTYPED',
        },
      ],
    } as AttackContextualChange,
  ],
  // Note: AC bonus should be handled separately as AC changes cannot be in AttackContextualChange
  // The AC bonus is applied through legacy_changes when Combat Expertise is active
};

// =============================================================================
// Improved Trip
// =============================================================================

export const improvedTrip: FeatEntity = {
  id: 'feat-improved-trip',
  entityType: 'feat',
  name: 'Improved Trip',
  description: 'You are trained in tripping opponents.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat'],
  prerequisites: ['feat-combat-expertise'],
  benefit: 'You do not provoke an attack of opportunity when you attempt to trip an opponent while you are unarmed. You also gain a +4 bonus on your Strength check to trip your opponent. If you trip an opponent in melee combat, you immediately get a melee attack against that opponent as if you had not used your attack for the trip attempt.',
  normal: 'Without this feat, you provoke an attack of opportunity when you attempt to trip an opponent while you are unarmed.',
  special: 'A fighter may select Improved Trip as one of his fighter bonus feats.',
  // Prerequisite: Int 13, Combat Expertise
};

// =============================================================================
// Improved Disarm
// =============================================================================

export const improvedDisarm: FeatEntity = {
  id: 'feat-improved-disarm',
  entityType: 'feat',
  name: 'Improved Disarm',
  description: 'You know how to disarm opponents in melee combat.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat'],
  prerequisites: ['feat-combat-expertise'],
  benefit: 'You do not provoke an attack of opportunity when you attempt to disarm an opponent, nor does the opponent have a chance to disarm you. You also gain a +4 bonus on the opposed attack roll you make to disarm your opponent.',
  normal: 'See the normal disarm rules.',
  special: 'A fighter may select Improved Disarm as one of his fighter bonus feats.',
  // Prerequisite: Int 13, Combat Expertise
};

// =============================================================================
// Improved Initiative
// =============================================================================

export const improvedInitiative: FeatEntity = {
  id: 'feat-improved-initiative',
  entityType: 'feat',
  name: 'Improved Initiative',
  description: 'You can react more quickly than normal in a fight.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat'],
  benefit: 'You get a +4 bonus on initiative checks.',
  special: 'A fighter may select Improved Initiative as one of his fighter bonus feats.',
  legacy_changes: [
    {
      type: ChangeTypes.INITIATIVE,
      formula: { expression: '4' },
      bonusTypeId: 'UNTYPED',
    },
  ],
};

// =============================================================================
// Combat Reflexes
// =============================================================================

export const combatReflexes: FeatEntity = {
  id: 'feat-combat-reflexes',
  entityType: 'feat',
  name: 'Combat Reflexes',
  description: 'You can respond quickly and repeatedly to opponents who let their guard down.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat'],
  benefit: 'You may make a number of additional attacks of opportunity equal to your Dexterity bonus. With this feat, you may also make attacks of opportunity while flat-footed.',
  normal: 'A character without this feat can make only one attack of opportunity per round and cannot make attacks of opportunity while flat-footed.',
  special: 'The Combat Reflexes feat does not allow a rogue to use her opportunist ability more than once per round. A fighter may select Combat Reflexes as one of his fighter bonus feats.',
};

// =============================================================================
// Improved Critical
// =============================================================================

export const improvedCritical: FeatEntity = {
  id: 'feat-improved-critical',
  entityType: 'feat',
  name: 'Improved Critical',
  description: 'Attacks you make with a weapon are more likely to be critical hits.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat', 'weapon'],
  benefit: 'When using the weapon you selected, your threat range is doubled.',
  special: 'You can gain Improved Critical multiple times. The effects do not stack. Each time you take the feat, it applies to a new type of weapon. This effect does not stack with any other effect that expands the threat range of a weapon. A fighter may select Improved Critical as one of his fighter bonus feats.',
  // Prerequisite: Proficient with weapon, base attack bonus +8
};

// =============================================================================
// Blind-Fight
// =============================================================================

export const blindFight: FeatEntity = {
  id: 'feat-blind-fight',
  entityType: 'feat',
  name: 'Blind-Fight',
  description: 'You know how to fight in melee without being able to see your foes.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat'],
  benefit: 'In melee, every time you miss because of concealment, you can reroll your miss chance percentile roll one time to see if you actually hit. An invisible attacker gets no advantages related to hitting you in melee. That is, you do not lose your Dexterity bonus to Armor Class, and the attacker does not get the usual +2 bonus for being invisible. The invisible attacker\'s bonuses do still apply for ranged attacks, however. You take only half the usual penalty to speed for being unable to see. Darkness and poor visibility in general reduces your speed to three-quarters normal, instead of one-half.',
  normal: 'Regular attack roll modifiers for invisible attackers trying to hit you apply, and you lose your Dexterity bonus to AC. The speed reduction for darkness is one-half, not three-quarters.',
  special: 'The Blind-Fight feat is of no use against a character who is the subject of a blink spell. A fighter may select Blind-Fight as one of his fighter bonus feats.',
};

// =============================================================================
// Two-Weapon Fighting
// =============================================================================

export const twoWeaponFighting: FeatEntity = {
  id: 'feat-two-weapon-fighting',
  entityType: 'feat',
  name: 'Two-Weapon Fighting',
  description: 'You can fight with a weapon in each hand. You can make one extra attack each round with the secondary weapon.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat'],
  benefit: 'Your penalties on attack rolls for fighting with two weapons are reduced. The penalty for your primary hand lessens by 2 and the one for your off hand lessens by 6.',
  normal: 'If you wield a second weapon in your off hand, you can get one extra attack per round with that weapon. When fighting in this way you suffer a -6 penalty with your regular attack or attacks with your primary hand and a -10 penalty to the attack with your off hand.',
  special: 'A 2nd-level ranger who has chosen the two-weapon combat style is treated as having Two-Weapon Fighting, even if he does not have the prerequisite for it. A fighter may select Two-Weapon Fighting as one of his fighter bonus feats.',
  // Prerequisite: Dex 15
};

// =============================================================================
// Improved Two-Weapon Fighting
// =============================================================================

export const improvedTwoWeaponFighting: FeatEntity = {
  id: 'feat-improved-two-weapon-fighting',
  entityType: 'feat',
  name: 'Improved Two-Weapon Fighting',
  description: 'You are an expert in fighting with two weapons.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat'],
  prerequisites: ['feat-two-weapon-fighting'],
  benefit: 'In addition to the standard single extra attack you get with an off-hand weapon, you get a second attack with the off-hand weapon, albeit at a -5 penalty.',
  normal: 'Without this feat, you can only get a single extra attack with an off-hand weapon.',
  special: 'A 6th-level ranger who has chosen the two-weapon combat style is treated as having Improved Two-Weapon Fighting, even if he does not have the prerequisites for it. A fighter may select Improved Two-Weapon Fighting as one of his fighter bonus feats.',
  // Prerequisite: Dex 17, Two-Weapon Fighting, base attack bonus +6
};

// =============================================================================
// Greater Two-Weapon Fighting
// =============================================================================

export const greaterTwoWeaponFighting: FeatEntity = {
  id: 'feat-greater-two-weapon-fighting',
  entityType: 'feat',
  name: 'Greater Two-Weapon Fighting',
  description: 'You are a master of fighting with two weapons.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat'],
  prerequisites: ['feat-two-weapon-fighting', 'feat-improved-two-weapon-fighting'],
  benefit: 'You get a third attack with your off-hand weapon, albeit at a -10 penalty.',
  special: 'An 11th-level ranger who has chosen the two-weapon combat style is treated as having Greater Two-Weapon Fighting, even if he does not have the prerequisites for it. A fighter may select Greater Two-Weapon Fighting as one of his fighter bonus feats.',
  // Prerequisite: Dex 19, Improved Two-Weapon Fighting, Two-Weapon Fighting, base attack bonus +11
};

// =============================================================================
// Point Blank Shot
// =============================================================================

export const pointBlankShot: FeatEntity = {
  id: 'feat-point-blank-shot',
  entityType: 'feat',
  name: 'Point Blank Shot',
  description: 'You are especially accurate when making ranged attacks against close targets.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat', 'ranged'],
  benefit: 'You get a +1 bonus on attack and damage rolls with ranged weapons at ranges of up to 30 feet.',
  special: 'A fighter may select Point Blank Shot as one of his fighter bonus feats.',
  legacy_contextualChanges: [
    {
      type: 'attack',
      name: 'Point Blank Shot',
      appliesTo: 'ranged',
      optional: false,
      available: true,
      variables: [],
      changes: [
        {
          type: ChangeTypes.ATTACK_ROLLS,
          attackType: 'ranged',
          formula: { expression: '1' },
          bonusTypeId: 'CIRCUMNSTANCE',
        },
        {
          type: ChangeTypes.DAMAGE,
          formula: { expression: '1' },
          bonusTypeId: 'CIRCUMNSTANCE',
        },
      ],
    } as unknown as AttackContextualChange,
  ],
  // Note: Range check (30 feet) should be handled by the UI/combat system
};

// =============================================================================
// Precise Shot
// =============================================================================

export const preciseShot: FeatEntity = {
  id: 'feat-precise-shot',
  entityType: 'feat',
  name: 'Precise Shot',
  description: 'You are skilled at timing and aiming ranged attacks.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat', 'ranged'],
  prerequisites: ['feat-point-blank-shot'],
  benefit: 'You can shoot or throw ranged weapons at an opponent engaged in melee without taking the standard -4 penalty on your attack roll.',
  special: 'A fighter may select Precise Shot as one of his fighter bonus feats.',
  // Prerequisite: Point Blank Shot
};

// =============================================================================
// Rapid Shot
// =============================================================================

export const rapidShot: FeatEntity = {
  id: 'feat-rapid-shot',
  entityType: 'feat',
  name: 'Rapid Shot',
  description: 'You can use ranged weapons with exceptional speed.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat', 'ranged'],
  prerequisites: ['feat-point-blank-shot'],
  benefit: 'You can get one extra attack per round with a ranged weapon. The attack is at your highest base attack bonus, but each attack you make in that round (the extra one and the normal ones) takes a -2 penalty. You must use the full attack action to use this feat.',
  special: 'A 2nd-level ranger who has chosen the archery combat style is treated as having Rapid Shot, even if he does not have the prerequisites for it. A fighter may select Rapid Shot as one of his fighter bonus feats.',
  // Prerequisite: Dex 13, Point Blank Shot
};

// =============================================================================
// Manyshot
// =============================================================================

export const manyshot: FeatEntity = {
  id: 'feat-manyshot',
  entityType: 'feat',
  name: 'Manyshot',
  description: 'You can fire multiple arrows simultaneously against a nearby target.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat', 'ranged'],
  prerequisites: ['feat-point-blank-shot', 'feat-rapid-shot'],
  benefit: 'As a standard action, you may fire two arrows at a single opponent within 30 feet. Both arrows use the same attack roll (with a -4 penalty) to determine success and deal damage normally (but see Special). For every five points of base attack bonus you have above +6, you may add one additional arrow to this attack, to a maximum of four arrows at a base attack bonus of +16. However, each arrow after the second adds a cumulative -2 penalty on the attack roll (for a total penalty of -6 for three arrows and -8 for four).',
  special: 'Regardless of the number of arrows you fire, you apply precision-based damage only once. If you score a critical hit, only the first arrow fired deals critical damage; all others deal regular damage. A 6th-level ranger who has chosen the archery combat style is treated as having Manyshot even if he does not have the prerequisites for it. A fighter may select Manyshot as one of his fighter bonus feats.',
  // Prerequisite: Dex 17, Point Blank Shot, Rapid Shot, base attack bonus +6
};

// =============================================================================
// Improved Unarmed Strike
// =============================================================================

export const improvedUnarmedStrike: FeatEntity = {
  id: 'feat-improved-unarmed-strike',
  entityType: 'feat',
  name: 'Improved Unarmed Strike',
  description: 'You are skilled at fighting while unarmed.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat'],
  benefit: 'You are considered to be armed even when unarmed — that is, you do not provoke attacks of opportunity from armed opponents when you attack them while unarmed. However, you still get an attack of opportunity against any opponent who makes an unarmed attack on you. In addition, your unarmed strikes can deal lethal or nonlethal damage, at your option.',
  normal: 'Without this feat, you are considered unarmed when attacking with an unarmed strike, and you can deal only nonlethal damage with such an attack.',
  special: 'A monk automatically gains Improved Unarmed Strike as a bonus feat at 1st level. She need not select it. A fighter may select Improved Unarmed Strike as one of his fighter bonus feats.',
};

// =============================================================================
// Stunning Fist
// =============================================================================

export const stunningFist: FeatEntity = {
  id: 'feat-stunning-fist',
  entityType: 'feat',
  name: 'Stunning Fist',
  description: 'You know how to strike opponents in vulnerable areas.',
  category: 'Combat',
  tags: ['fighterBonusFeat', 'combat'],
  prerequisites: ['feat-improved-unarmed-strike'],
  benefit: 'You must declare that you are using this feat before you make your attack roll (thus, a failed attack roll ruins the attempt). Stunning Fist forces a foe damaged by your unarmed attack to make a Fortitude saving throw (DC 10 + 1/2 your character level + your Wis modifier), in addition to dealing damage normally. A defender who fails this saving throw is stunned for 1 round (until just before your next action). A stunned character cannot act, loses any Dexterity bonus to AC, and takes a -2 penalty to AC. You may attempt a stunning attack once per day for every four levels you have attained (but see Special), and no more than once per round. Constructs, oozes, plants, undead, incorporeal creatures, and creatures immune to critical hits cannot be stunned.',
  special: 'A monk may select Stunning Fist as a bonus feat at 1st level, even if she does not meet the prerequisites. A monk who selects this feat may attempt a stunning attack a number of times per day equal to her monk level, plus one more time per day for every four levels she has in classes other than monk. A fighter may select Stunning Fist as one of his fighter bonus feats.',
  // Prerequisite: Dex 13, Wis 13, Improved Unarmed Strike, base attack bonus +8
};

// =============================================================================
// Toughness
// =============================================================================

export const toughness: FeatEntity = {
  id: 'feat-toughness',
  entityType: 'feat',
  name: 'Toughness',
  description: 'You are tougher than normal.',
  category: 'General',
  tags: ['fighterBonusFeat', 'general', 'vitality'],
  benefit: 'You gain +3 hit points.',
  special: 'A character may gain this feat multiple times. Its effects stack.',
  effects: [
    {
      target: 'hp.max',
      formula: '3',
      bonusType: 'UNTYPED',
    },
  ],
};

// =============================================================================
// Export all fighter bonus feats
// =============================================================================

export const fighterBonusFeats: FeatEntity[] = [
  // Power Attack tree
  powerAttack,
  cleave,
  greatCleave,
  
  // Weapon Focus tree
  weaponFocus,
  weaponSpecialization,
  greaterWeaponFocus,
  greaterWeaponSpecialization,
  
  // Dodge tree
  dodge,
  mobility,
  springAttack,
  
  // Combat Expertise tree
  combatExpertise,
  improvedTrip,
  improvedDisarm,
  
  // Initiative and Reflexes
  improvedInitiative,
  combatReflexes,
  
  // Critical and misc melee
  improvedCritical,
  blindFight,
  
  // Two-Weapon Fighting tree
  twoWeaponFighting,
  improvedTwoWeaponFighting,
  greaterTwoWeaponFighting,
  
  // Ranged tree
  pointBlankShot,
  preciseShot,
  rapidShot,
  manyshot,
  
  // Unarmed
  improvedUnarmedStrike,
  stunningFist,
  
  // General
  toughness,
];

