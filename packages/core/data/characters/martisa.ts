import { Feat } from "../../core/domain/character/baseData/features/feats/feat";
import { featureTypes } from "../../core/domain/character/baseData/features/feature";
import { ChangeTypes } from "../../core/domain/character/baseData/changes";
import { CharacterClass } from "../../core/domain/class/class";
import { BabType } from "../../core/domain/class/baseAttackBonus";
import { SaveType } from "../../core/domain/class/saves";
import { Race } from "../../core/domain/character/baseData/race";
import { Armor, Equipment, BaseItem, Misc } from "../../core/domain/character/baseData/equipment";
import { MeleeWeapon } from "../../core/domain/weapons/weapon";
import { buildCharacter } from "../../core/tests/character";

// --- Definiciones en Español ---

// Clase: Bardo
const bardo: CharacterClass = {
  name: "Bardo",
  uniqueId: "bardo",
  hitDie: 6,
  baseAttackBonusProgression: BabType.AVERAGE,
  baseSavesProgression: {
    fortitude: SaveType.POOR,
    reflex: SaveType.GOOD,
    will: SaveType.GOOD
  },
  classSkills: [
    "actuar", // Perform
    "abrir cerraduras", // Open Lock
    "artesanía", // Craft
    "averiguar intenciones", // Sense Motive
    "avistar", // Spot
    "buscar", // Search
    "concentración", // Concentration
    "conocimiento de conjuros", // Spellcraft
    "diplomacia", // Diplomacy
    "disfrazarse", // Disguise
    "engañar", // Bluff
    "equilibrio", // Balance
    "escalar", // Climb
    "escabullirse", // Escape Artist
    "esconderse", // Hide
    "escuchar", // Listen
    "falsificar", // Forgery
    "interpretar", // Perform (specific instrument)
    "intimidar", // Intimidate
    "inutilizar mecanismo", // Disable Device
    "juego de manos", // Sleight of Hand
    "mover sigilosamente", // Move Silently
    "nadar", // Swim
    "oficio", // Profession
    "piruetas", // Tumble
    "reunir información", // Gather Information
    "saber", // Knowledge (all)
    "saltar", // Jump
    "tasar", // Appraise
    "trepar", // Climb (duplicate, but often listed separately if skills are granular)
    "usar objeto mágico" // Use Magic Device
  ],
  classFeatures: [ // Features inherent to the class definition
    { name: "Música de bardo", uniqueId: "musica-de-bardo", description: "Un bardo puede usar música o poesía para producir efectos mágicos.", featureType: featureTypes.CLASS_FEATURE, changes: [] },
    { name: "Conocimiento de bardo", uniqueId: "conocimiento-de-bardo", description: "Un bardo elige un número de canciones o poemas de la lista de conjuros de bardo.", featureType: featureTypes.CLASS_FEATURE, changes: [] },
  ],
  levels: [
    { level: 1, classFeatures: [{ name: "Contracanción", uniqueId: "contracancion", description: "Puede usar su música para contrarrestar efectos mágicos que dependan del sonido.", featureType: featureTypes.CLASS_FEATURE, changes: [] }, { name: "Fascinar", uniqueId: "fascinar", description: "Puede usar su música o poesía para fascinar a una o más criaturas.", featureType: featureTypes.CLASS_FEATURE, changes: [] }, { name: "Inspirar valor +1", uniqueId: "inspirar-valor-1", description: "Cualquier aliado afectado recibe un bonificador +1 de moral a las tiradas de salvación contra efectos de hechizo y miedo y un bonificador +1 de moral a las tiradas de ataque y daño con arma.", featureType: featureTypes.CLASS_FEATURE, changes: [] }] },
    { level: 2, classFeatures: [] },
    { level: 3, classFeatures: [{ name: "Inspirar pericia", uniqueId: "inspirar-pericia", description: "Un bardo de nivel 3º o superior con 6 o más rangos en una habilidad de Interpretar puede usar su música o poesía para ayudar a un aliado a tener éxito en una tarea.", featureType: featureTypes.CLASS_FEATURE, changes: [] }] },
    { level: 4, classFeatures: [] },
    { level: 5, classFeatures: [] } // Note: Inspire Courage often improves at later levels. Simplified here.
  ],
  spellCasting: true,
  spellCastingAbilityUniqueId: "charisma",
  allSpellsKnown: false, // Bards learn spells
};

// Raza: Humano
const humano: Race = {
  uniqueId: "humano",
  name: "Humano",
  size: "MEDIUM",
  baseSpeeds: {
    landSpeed: {
      value: 30,
    },
  },
  languages: [
    {
      en_US: "Common",
      es_ES: "Común"
    }
  ],
  racialFeatures: [
      { name: "Dote adicional", uniqueId: "dote-adicional-humano", description: "Los humanos reciben una dote adicional en el nivel 1.", featureType: featureTypes.CLASS_FEATURE, changes: [] },
      { name: "Habilidoso", uniqueId: "habilidoso-humano", description: "Los humanos reciben 4 puntos de habilidad adicionales en el nivel 1, y 1 punto de habilidad adicional en cada nivel subsiguiente.", featureType: featureTypes.CLASS_FEATURE, changes: [] }
  ],
  levelAdjustment: 0,
  changes: [], // Specific changes like skill points or bonus feats are often handled by character creation logic or by selecting feats.
};


const laud: Misc = {
  uniqueId: "laud_de_martisa",
  name: "Laúd de Martisa",
  itemType: "MISC",
  weight: 3,
  description: "Un laúd finamente elaborado, regalo de un errante elfo. Parece resonar con una sutil magia.",
  equipped: true,
  equipable: true,
  changes: [],
  specialChanges: [],
  equippedChanges: [],
  equippedContextChanges: [],
};

// Equipo Adicional
const armaduraDeCuero: Armor = {
    uniqueId: "armadura_de_cuero_simple",
    name: "Armadura de Cuero",
    arcaneSpellFailureChance: 10,
    armorCheckPenalty: 0,
    baseArmorBonus: 2,
    enhancementBonus: 0, // Standard leather
    maxDexBonus: 6,
    speed20: 20,
    speed30: 30,
    itemType: "ARMOR",
    weight: 15,
    description: "Una armadura de cuero estándar.",
    equipped: true,
    equipable: true,
    enhancements: [],
    changes: [],
    specialChanges: [],
    equippedChanges: [],
    equippedContextChanges: [],
};

const estoque: MeleeWeapon = {
  equipable: true,
  equipped: true,
  wielded: true,
  name: "Estoque",
  itemType: "WEAPON",
  uniqueId: "estoque_confiable",
  damageDice: "1d6",
  isMasterwork: false,
  baseCritRange: 18,
  baseCritMultiplier: 2,
  size: "MEDIUM",
  weaponAttackType: "melee",
  proficiencyType: "martial", // Bards are proficient with rapiers
  defaultWieldType: "primary",
  damageType: {
    type: "basic",
    damageType: "piercing",
  },
  twoHanded: false,
  description: "Un estoque ligero y rápido, ideal para un ágil combatiente.",
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

// Dotes (Feats)
const silencioImpenetrable: Feat = {
  name: "Silencio Impenetrable",
  description: "Martisa puede, una vez al día, crear un área de 20 pies de radio de silencio mágico absoluto centrado en ella misma durante 1 minuto. Ningún sonido puede originarse dentro o pasar a través de esta área. Es necesaria una gran concentración (acción estándar para iniciar, acción gratuita para mantener).",
  featureType: featureTypes.FEAT,
  uniqueId: "silencio-impenetrable",
  changes: [], // For now, no direct mechanical changes via 'Change' objects. Effect is descriptive.
};

const iniciativaMejorada: Feat = {
  name: "Iniciativa Mejorada",
  description: "Recibes un bonificador +4 en las pruebas de iniciativa.",
  featureType: featureTypes.FEAT,
  uniqueId: "iniciativa-mejorada",
  changes: [
    {
      type: ChangeTypes.INITIATIVE,
      bonusTypeId: "UNTYPED", // Standard type for this kind of bonus
      formula: {
        expression: "4",
      },
    },
  ],
};

const musicaPersistente: Feat = {
  name: "Música Persistente",
  description: "Los efectos de tu música de bardo continúan durante 2 asaltos adicionales después de que dejes de mantener la música.",
  featureType: featureTypes.FEAT,
  uniqueId: "musica-persistente",
  changes: [], // Effect is specific to bardic music rules, not a simple stat change.
};


// --- Construcción del Personaje: Martisa ---
export const martisa = buildCharacter()
  .withName("Martisa")
  .withRace(humano)
  .withClassLevels(bardo, 5)
  .withBaseAbilityScores({
    strength: 10,
    dexterity: 18,
    constitution: 14,
    intelligence: 12,
    wisdom: 10,
    charisma: 20,
  })
  .withItem(laud)
  .withItem(armaduraDeCuero)
  .withItem(estoque)
  .withFeats([
    silencioImpenetrable,     // Dote especial de Martisa
    iniciativaMejorada,       // Dote de humano de nivel 1
    musicaPersistente         // Dote de personaje de nivel 3
  ])
  .build();
