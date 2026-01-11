import { Buff } from "../../core/domain/character/baseData/buffs";
import { ChangeTypes } from "../../core/domain/character/baseData/changes";
import { AttackContextualChange } from "../../core/domain/character/baseData/contextualChange";
import { Feat } from "../../core/domain/character/baseData/features/feats/feat";
import { featureTypes } from "../../core/domain/character/baseData/features/feature";
import { valueIndexKeys } from "../../core/domain/character/calculation/valuesIndex/valuesIndex";
import { MeleeWeapon, RangedWeapon } from "../../core/domain/weapons/weapon";
import { buildCharacter } from "../../core/tests/character";
import { rogue } from "../../srd/classes";
import { BabType } from "../../core/domain/class/baseAttackBonus";
import { CharacterClass } from "../../core/domain/class/class";
import { SaveType } from "../../core/domain/class/saves";
import { Race } from "../../core/domain/character/baseData/race";
import { Size } from "../../core/domain/character/baseData/sizes";
import { Armor, Misc } from "../../core/domain/character/baseData/equipment";
import { chainShirtArmor } from "../../srd";

// Define Sorcerer class
const sorcerer: CharacterClass = {
  name: "Sorcerer",
  uniqueId: "sorcerer",
  hitDie: 4,
  baseAttackBonusProgression: BabType.POOR,
  baseSavesProgression: {
    fortitude: SaveType.POOR,
    reflex: SaveType.POOR,
    will: SaveType.GOOD,
  },
  classSkills: [
    "bluff",
    "concentration",
    "craft",
    "knowledge",
    "profession",
    "spellcraft",
  ],
  classFeatures: [],
  levels: [
    {
      level: 1,
      classFeatures: [],
    },
  ],
  spellCasting: true,
  spellCastingAbilityUniqueId: "charisma",
  allSpellsKnown: true,
};

const elf: Race = {
  uniqueId: "elf",
  name: "Elf",
  size: "MEDIUM",
  baseSpeeds: {
    landSpeed: {
      value: 30,
    },
  },
  languages: [
    {
      en_US: "Common",
      es_ES: "Común",
    },
    {
      en_US: "Elven",
      es_ES: "Élfico",
    },
  ],
  racialFeatures: [],
  levelAdjustment: 0,
  changes: [
    {
      type: ChangeTypes.ABILITY_SCORE,
      abilityUniqueId: "dexterity",
      bonusTypeId: "RACIAL",
      formula: {
        expression: "2",
      },
    },
    {
      type: ChangeTypes.ABILITY_SCORE,
      abilityUniqueId: "constitution",
      bonusTypeId: "RACIAL",
      formula: {
        expression: "-2",
      },
    },
    {
      type: ChangeTypes.SKILL,
      skillUniqueId: "listen",
      bonusTypeId: "RACIAL",
      formula: {
        expression: "2",
      },
    },
    {
      type: ChangeTypes.SKILL,
      skillUniqueId: "search",
      bonusTypeId: "RACIAL",
      formula: {
        expression: "2",
      },
    },
    {
      type: ChangeTypes.SKILL,
      skillUniqueId: "spot",
      bonusTypeId: "RACIAL",
      formula: {
        expression: "2",
      },
    },
  ],
};

// Dervin's equipment
const rapier: MeleeWeapon = {
  equipable: true,
  equipped: true,
  wielded: true,
  name: "Rapier",
  itemType: "WEAPON",
  uniqueId: "rapier",
  damageDice: "1d6",
  isMasterwork: false,
  baseCritRange: 18,
  baseCritMultiplier: 2,
  size: "MEDIUM",
  weaponAttackType: "melee",
  proficiencyType: "martial",
  defaultWieldType: "primary",
  damageType: {
    type: "basic",
    damageType: "piercing",
  },
  twoHanded: false,
  description: "",
  specialChanges: [],
  weight: 2,
  equippedChanges: [],
  equippedContextChanges: [],
  wieldedChanges: [],
  wieldedContextChanges: [],
  finesse: true,
  weightType: "LIGHT",
  thrown: false,
};

const shortbow: RangedWeapon = {
  equipable: true,
  equipped: true,
  wielded: false,
  name: "Shortbow",
  itemType: "WEAPON",
  uniqueId: "shortbow",
  damageDice: "1d6",
  isMasterwork: false,
  baseCritRange: 20,
  baseCritMultiplier: 3,
  size: "MEDIUM",
  weaponAttackType: "ranged",
  proficiencyType: "simple",
  defaultWieldType: "primary",
  damageType: {
    type: "basic",
    damageType: "piercing",
  },
  changes: [],
  description: "",
  specialChanges: [],
  twoHanded: true,
  weight: 2,
  equippedChanges: [],
  equippedContextChanges: [],
  wieldedChanges: [],
  wieldedContextChanges: [],
  ammunitionType: "ARROW",
  rangeIncrement: 60,
  requiresLoading: false,
};

// Define leather armor
const leatherArmor: Armor = {
  uniqueId: "leatherArmor",
  name: "Leather Armor",
  arcaneSpellFailureChance: 10,
  armorCheckPenalty: 0,
  baseArmorBonus: 2,
  enhancementBonus: 1,
  maxDexBonus: 6,
  speed20: 20,
  speed30: 30,
  itemType: "ARMOR",
  weight: 15,
  description: "Leather Armor",
  equipped: true,
  equipable: true,
  enhancements: [],
  changes: [],
  specialChanges: [],
  equippedChanges: [],
  equippedContextChanges: [],
};

// Feats
const weaponFinesseFeat: Feat = {
  name: "Weapon Finesse",
  description:
    "With a light weapon, rapier, whip, or spiked chain made for a creature of your size category, you may use your Dexterity modifier instead of your Strength modifier on attack rolls.",
  featureType: featureTypes.FEAT,
  uniqueId: "weapon-finesse",
  changes: [],
};

const improvedInitiativeFeat: Feat = {
  name: "Improved Initiative",
  description: "You get a +4 bonus on initiative checks.",
  featureType: featureTypes.FEAT,
  uniqueId: "improved-initiative",
  changes: [
    {
      type: ChangeTypes.INITIATIVE,
      bonusTypeId: "UNTYPED",
      formula: {
        expression: "4",
      },
    },
  ],
};

const dagger: MeleeWeapon = {
  name: "Daga",
  baseCritMultiplier: 2,
  baseCritRange: 19,
  damageDice: "1d4",
  damageType: {
    damageType: "piercing",
    type: "basic",
  },
  defaultWieldType: "primary",
  description: "",
  equipable: true,
  equipped: true,
  finesse: true,
  isMasterwork: true,
  itemType: "WEAPON",
  proficiencyType: "simple",
  size: "MEDIUM",
  thrown: true,
  twoHanded: false,
  uniqueId: "dagger",
  weight: 1,
  weaponAttackType: "melee",
  weightType: "LIGHT",
  wielded: true,
};

const objetoDeCampoAntimagia: Misc = {
  uniqueId: "objetoDeCampoAntimagia",
  name: "Objeto de campo antimagia",
  itemType: "MISC",
  weight: 1,
  description:
    "Un pequeño objeto del tamaño de un puño que al ser activado (palabra arcana) crea un campo antimagia de 10 pies de radio durante 1 minuto. 1/día",
  equipable: true,
  equipped: true,
};

// Build Dervin
export const dervin = buildCharacter()
  .withName("Dervin")
  .withRace(elf)
  .withClassLevels(rogue, 3)
  .withClassLevels(sorcerer, 2)
  .withBaseAbilityScores({
    strength: 12,
    dexterity: 18,
    constitution: 14,
    intelligence: 14,
    wisdom: 12,
    charisma: 12,
  })
  .withSkillRanks("knowledgeArcana", 11)
  .withSkillRanks("openLock", 11)
  .withSkillRanks("appraise", 6)
  .withSkillRanks("disableDevice", 6)
  .withSkillRanks("hide", 11)
  .withSkillRanks("moveSilently", 11)
  .withSkillRanks("search", 11)
  .withSkillRanks("spot", 11)
  .withSkillRanks("listen", 11)
  .withSkillRanks("tumble", 6)
  .withSkillRanks("useMagicDevice", 6)
  .withSkillRanks("useRope", 6)
  .withItemEquipped({
    ...dagger,
    damageDice: "1d6",
    enhancementBonus: 2,
    name: "Daga viciosa",
  } as MeleeWeapon)
  .withItemEquipped({
    ...chainShirtArmor,
    baseArmorBonus: 5,
    enhancementBonus: 1,
  } as Armor)
  .withItemEquipped({
    ...objetoDeCampoAntimagia,
  } as Misc)
  .withSpecialFeatures([
    {
        title: "Conjuros nivel 0",
        uniqueId: "conjurosNivel0",
        description: `
            5 al día:

            Detectar magia, Lanzar virote, Mano de mago, Luz, Portal silencioso
        `,
    },
    {
      title: "Conjuros nivel 1",
      uniqueId: "conjurosNivel1",
      description: `

          3 al día:

          Transposición benigna:
          Dos criaturas, de las cuales tú puedes ser una, intercambian al instante sus posiciones. Ambos objetivos deben estar dentro del alcance. Los objetos transportados por las criaturas (hasta la carga máxima de cada una) también van con ellas, pero otros seres no (incluso si están siendo transportados). El movimiento es instantáneo y no provoca ataques de oportunidad.

          Sombras distractoras:
          Este conjuro causa que un objeto irradie sombras que distraen la percepción en una emanación de 10’. Un escrutinio casual en el área afectada no revelara nada más allá de lo ordinario, aunque en la zona haya roturas, trampas ocultas, puertas secretas, etc.
        
            Las criaturas en el área o que miren hacia ella serán confundidas subliminalmente por las sombras distractoras, y sufrirán un penalizador de -5 a sus pruebas de Avistar y Buscar. Sin embargo, las sombras no serán lo bastante profundas como para proporcionar ocultación a una criatura.
          `,
    },
    
  ])
  .withFeats([weaponFinesseFeat, improvedInitiativeFeat])
  .build();
