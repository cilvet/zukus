import { featureTypes } from "../core/domain/character/baseData/features/feature";
import { BabType } from "../core/domain/class/baseAttackBonus";
import { CharacterClass } from "../core/domain/class/class";
import { SaveType } from "../core/domain/class/saves";

export const fighter: CharacterClass = {
  name: "Fighter",
  uniqueId: "fighter",
  hitDie: 10,
  baseAttackBonusProgression: BabType.GOOD,
  baseSavesProgression: {
    fortitude: SaveType.GOOD,
    reflex: SaveType.POOR,
    will: SaveType.POOR,
  },
  classFeatures: [],
  levels: [
    {
      level: 1,
      classFeatures: [],
    },
  ],
  spellCasting: false,
};

const variantRogue = {
  entities: [
    {
      entityType: 'classAbility',
      tags: ['rogue-1'],
      description: 'Super sneak attack',
      name: 'Super sneak attack',
      suppresses: ['sneak-attack'],
    }
  ]
}

export const rogue: CharacterClass = {
  name: "Rogue",
  uniqueId: "rogue",
  hitDie: 6,
  baseAttackBonusProgression: BabType.AVERAGE,
  baseSavesProgression: {
    fortitude: SaveType.POOR,
    reflex: SaveType.GOOD,
    will: SaveType.POOR,
  },
  classFeatures: [],
  levels: [
    {
      level: 1,
      classFeatures: [
        {
          description: `Trapfinding
Rogues (and only rogues) can use the Search skill to locate traps when the task has a Difficulty Class higher than 20.

Finding a nonmagical trap has a DC of at least 20, or higher if it is well hidden. Finding a magic trap has a DC of 25 + the level of the spell used to create it.

Rogues (and only rogues) can use the Disable Device skill to disarm magic traps. A magic trap generally has a DC of 25 + the level of the spell used to create it.

A rogue who beats a trap’s DC by 10 or more with a Disable Device check can study a trap, figure out how it works, and bypass it (with her party) without disarming it.

`,
          featureType: featureTypes.CLASS_FEATURE,
          name: "Trapfinding",
          uniqueId: "trapfinding",
          changes: [],
        },
        {
          description: `
  If a rogue can catch an opponent when he is unable to defend himself effectively from her attack, she can strike a vital spot for extra damage.

The rogue’s attack deals extra damage any time her target would be denied a Dexterity bonus to AC (whether the target actually has a Dexterity bonus or not), or when the rogue flanks her target. This extra damage is 1d6 at 1st level, and it increases by 1d6 every two rogue levels thereafter. Should the rogue score a critical hit with a sneak attack, this extra damage is not multiplied.

Ranged attacks can count as sneak attacks only if the target is within 30 feet.

With a sap (blackjack) or an unarmed strike, a rogue can make a sneak attack that deals nonlethal damage instead of lethal damage. She cannot use a weapon that deals lethal damage to deal nonlethal damage in a sneak attack, not even with the usual -4 penalty.

A rogue can sneak attack only living creatures with discernible anatomies—undead, constructs, oozes, plants, and incorporeal creatures lack vital areas to attack. Any creature that is immune to critical hits is not vulnerable to sneak attacks. The rogue must be able to see the target well enough to pick out a vital spot and must be able to reach such a spot. A rogue cannot sneak attack while striking a creature with concealment or striking the limbs of a creature whose vitals are beyond reach.
  `,
          featureType: featureTypes.CLASS_FEATURE,
          name: "Sneak attack",
          uniqueId: "trapfinding",
          contextualChanges: [],
        },
        {
            name: 'Evasion',
            description: `
            Evasion (Ex)
At 2nd level and higher, a rogue can avoid even magical and unusual attacks with great agility. If she makes a successful Reflex saving throw against an attack that normally deals half damage on a successful save, she instead takes no damage. Evasion can be used only if the rogue is wearing light armor or no armor. A helpless rogue does not gain the benefit of evasion.
            `,
            featureType: featureTypes.CLASS_FEATURE,
            uniqueId: "evasion",
            contextualChanges: [],
        }
      ],
    },
    {
        level: 2,
        classFeatures:[]
    },
    {
        level: 3,
        classFeatures:[]
    },
    {
        level: 4,
        classFeatures:[]
    },
    {
        level: 5,
        classFeatures:[]
    },
    

  ],
  spellCasting: false,
};

export const bard: CharacterClass = {
  name: "Bard",
  uniqueId: "bard",
  hitDie: 6,
  classSkills: [
    "appraise",
    "balance",
    "bluff",
    "climb",
    "concentration",
    "craft",
    "decipherScript",
    "diplomacy",
    "disguise",
    "escapeArtist",
    "gatherInformation",
    "hide",
    "jump",
    "knowledge",
    "listen",
    "moveSilently",
    "perform",
    "profession",
    "senseMotive",
    "sleightOfHand",
    "speakLanguage",
    "spellcraft",
    "swim",
    "tumble",
    "useMagicDevice",
    "useRope",
  ],
  baseAttackBonusProgression: BabType.AVERAGE,
  baseSavesProgression: {
    fortitude: SaveType.POOR,
    reflex: SaveType.GOOD,
    will: SaveType.GOOD,
  },
  classFeatures: [],
  levels: [
    {
      level: 1,
      classFeatures: [{
        name: 'Bardic Music',
        description: `
        Once per day per bard level, a bard can use his song or poetics to produce magical effects on those around him (usually including himself, if desired). While these abilities fall under the category of bardic music and the descriptions discuss singing or playing instruments, they can all be activated by reciting poetry, chanting, singing lyrical songs, singing melodies, whistling, playing an instrument, or playing an instrument in combination with some spoken performance. Each ability requires both a minimum bard level and a minimum number of ranks in the Perform skill to qualify; if a bard does not have the required number of ranks in at least one Perform skill, he does not gain the bardic music ability until he acquires the needed ranks.

Starting a bardic music effect is a standard action. Some bardic music abilities require concentration, which means the bard must take a standard action each round to maintain the ability. Even while using bardic music that doesn’t require concentration, a bard cannot cast spells, activate magic items by spell completion (such as scrolls), spell trigger (such as wands), or command word. Just as for casting a spell with a verbal component, a deaf bard has a 20% chance to fail when attempting to use bardic music. If he fails, the attempt still counts against his daily limit.`,
        featureType: featureTypes.CLASS_FEATURE,
        uniqueId: 'bardic_music',
        changes: [],
        specialChanges: [
          {
            type: 'RESOURCE_DEFINITION',
            resourceId: 'bardic_music_uses',
            name: 'Bardic Music',
            maxValueFormula: {
              expression: '@class.bard.level'
            },
            rechargeFormula: {
              expression: '@class.bard.level'
            },
            defaultChargesPerUseFormula: {
              expression: '1'
            },
          }
        ]
      }],
    },
  ],
  spellCasting: true,
  spellCastingAbilityUniqueId: "charisma",
  allSpellsKnown: true,
};
