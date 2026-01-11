import type { Spell } from '../schemas/spell.schema';

/**
 * Conjuros de Ejemplo para D&D 3.5
 * 
 * Estos conjuros están basados en el SRD y sirven para:
 * - Validar el schema de conjuros
 * - Probar el sistema de filtrado
 * - Demostrar casos de uso del CGE
 */

// ============================================================================
// Nivel 0 - Cantrips / Trucos
// ============================================================================

export const detectMagic: Spell = {
  id: "detect_magic",
  name: "Detect Magic",
  type: "spell",
  description: "You detect magical auras. The amount of information revealed depends on how long you study a particular area or subject.",
  schools: ["divination"],
  components: ["V", "S"],
  castingTime: "1 standard action",
  range: "60 ft.",
  area: "Cone-shaped emanation",
  duration: "Concentration, up to 1 min./level (D)",
  savingThrow: "None",
  spellResistance: "No",
  shortDescription: "Detects spells and magic items within 60 ft.",
  classLevels: [
    { className: "Bard", level: 0 },
    { className: "Cleric", level: 0 },
    { className: "Druid", level: 0 },
    { className: "Sorcerer", level: 0 },
    { className: "Wizard", level: 0 }
  ]
};

export const light: Spell = {
  id: "light",
  name: "Light",
  type: "spell",
  description: "This spell causes an object to glow like a torch, shedding bright light in a 20-foot radius.",
  schools: ["evocation"],
  descriptors: ["light"],
  components: ["V", "M", "DF"],
  materialComponent: "A firefly or a piece of phosphorescent moss.",
  castingTime: "1 standard action",
  range: "Touch",
  target: "Object touched",
  duration: "10 min./level (D)",
  savingThrow: "None",
  spellResistance: "No",
  shortDescription: "Object shines like a torch.",
  classLevels: [
    { className: "Bard", level: 0 },
    { className: "Cleric", level: 0 },
    { className: "Druid", level: 0 },
    { className: "Sorcerer", level: 0 },
    { className: "Wizard", level: 0 }
  ]
};

export const readMagic: Spell = {
  id: "read_magic",
  name: "Read Magic",
  type: "spell",
  description: "By means of read magic, you can decipher magical inscriptions on objects that would otherwise be unintelligible.",
  schools: ["divination"],
  components: ["V", "S", "F"],
  focus: "A clear crystal or mineral prism.",
  castingTime: "1 standard action",
  range: "Personal",
  target: "You",
  duration: "10 min./level",
  savingThrow: "None",
  spellResistance: "No",
  shortDescription: "Read scrolls and spellbooks.",
  classLevels: [
    { className: "Bard", level: 0 },
    { className: "Cleric", level: 0 },
    { className: "Druid", level: 0 },
    { className: "Paladin", level: 1 },
    { className: "Ranger", level: 1 },
    { className: "Sorcerer", level: 0 },
    { className: "Wizard", level: 0 }
  ]
};

export const rayOfFrost: Spell = {
  id: "ray_of_frost",
  name: "Ray of Frost",
  type: "spell",
  description: "A ray of freezing air and ice projects from your pointing finger. You must succeed on a ranged touch attack with the ray to deal damage to a target.",
  schools: ["evocation"],
  descriptors: ["cold"],
  components: ["V", "S"],
  castingTime: "1 standard action",
  range: "Close (25 ft. + 5 ft./2 levels)",
  effect: "Ray",
  duration: "Instantaneous",
  savingThrow: "None",
  spellResistance: "Yes",
  shortDescription: "Ray deals 1d3 cold damage.",
  classLevels: [
    { className: "Sorcerer", level: 0 },
    { className: "Wizard", level: 0 }
  ]
};

export const prestidigitation: Spell = {
  id: "prestidigitation",
  name: "Prestidigitation",
  type: "spell",
  description: "Prestidigitations are minor tricks that novice spellcasters use for practice.",
  schools: ["universal"],
  components: ["V", "S"],
  castingTime: "1 standard action",
  range: "10 ft.",
  target: "See text",
  duration: "1 hour",
  savingThrow: "See text",
  spellResistance: "No",
  shortDescription: "Performs minor tricks.",
  classLevels: [
    { className: "Bard", level: 0 },
    { className: "Sorcerer", level: 0 },
    { className: "Wizard", level: 0 }
  ]
};

// ============================================================================
// Nivel 1
// ============================================================================

export const magicMissile: Spell = {
  id: "magic_missile",
  name: "Magic Missile",
  type: "spell",
  description: "A missile of magical energy darts forth from your fingertip and strikes its target, dealing 1d4+1 points of force damage. The missile strikes unerringly, even if the target is in melee combat or has less than total cover or total concealment.",
  schools: ["evocation"],
  descriptors: ["force"],
  components: ["V", "S"],
  castingTime: "1 standard action",
  range: "Medium (100 ft. + 10 ft./level)",
  target: "Up to five creatures, no two of which can be more than 15 ft. apart",
  duration: "Instantaneous",
  savingThrow: "None",
  spellResistance: "Yes",
  shortDescription: "1d4+1 damage; +1 missile per two levels above 1st (max 5).",
  classLevels: [
    { className: "Sorcerer", level: 1 },
    { className: "Wizard", level: 1 }
  ]
};

export const shield: Spell = {
  id: "shield",
  name: "Shield",
  type: "spell",
  description: "Shield creates an invisible, tower shield-sized mobile disk of force that hovers in front of you. It negates magic missile attacks directed at you. The disk also provides a +4 shield bonus to AC.",
  schools: ["abjuration"],
  descriptors: ["force"],
  components: ["V", "S"],
  castingTime: "1 standard action",
  range: "Personal",
  target: "You",
  duration: "1 min./level (D)",
  savingThrow: "None",
  spellResistance: "No",
  shortDescription: "Invisible disc gives +4 to AC, blocks magic missile.",
  classLevels: [
    { className: "Sorcerer", level: 1 },
    { className: "Wizard", level: 1 }
  ]
};

export const mageArmor: Spell = {
  id: "mage_armor",
  name: "Mage Armor",
  type: "spell",
  description: "An invisible but tangible field of force surrounds the subject of a mage armor spell, providing a +4 armor bonus to AC.",
  schools: ["conjuration"],
  subschools: ["creation"],
  descriptors: ["force"],
  components: ["V", "S", "F"],
  focus: "A piece of cured leather.",
  castingTime: "1 standard action",
  range: "Touch",
  target: "Creature touched",
  duration: "1 hour/level (D)",
  savingThrow: "Will negates (harmless)",
  spellResistance: "No",
  shortDescription: "Gives subject +4 armor bonus.",
  classLevels: [
    { className: "Sorcerer", level: 1 },
    { className: "Wizard", level: 1 }
  ]
};

export const colorSpray: Spell = {
  id: "color_spray",
  name: "Color Spray",
  type: "spell",
  description: "A vivid cone of clashing colors springs forth from your hand, causing creatures to become stunned, perhaps also blinded, and possibly knocking them unconscious.",
  schools: ["illusion"],
  subschools: ["pattern"],
  descriptors: ["mind-affecting"],
  components: ["V", "S", "M"],
  materialComponent: "A pinch each of powder or sand that is colored red, yellow, and blue.",
  castingTime: "1 standard action",
  range: "15 ft.",
  area: "Cone-shaped burst",
  duration: "Instantaneous; see text",
  savingThrow: "Will negates",
  spellResistance: "Yes",
  shortDescription: "Knocks unconscious, blinds, and/or stuns weak creatures.",
  classLevels: [
    { className: "Sorcerer", level: 1 },
    { className: "Wizard", level: 1 }
  ]
};

export const bless: Spell = {
  id: "bless",
  name: "Bless",
  type: "spell",
  description: "Bless fills your allies with courage. Each ally gains a +1 morale bonus on attack rolls and on saving throws against fear effects.",
  schools: ["enchantment"],
  subschools: ["compulsion"],
  descriptors: ["mind-affecting"],
  components: ["V", "S", "DF"],
  castingTime: "1 standard action",
  range: "50 ft.",
  area: "The caster and all allies within a 50-ft. burst, centered on the caster",
  duration: "1 min./level",
  savingThrow: "None",
  spellResistance: "Yes (harmless)",
  shortDescription: "Allies gain +1 on attack rolls and saves against fear.",
  classLevels: [
    { className: "Cleric", level: 1 },
    { className: "Paladin", level: 1 }
  ]
};

export const cureLight: Spell = {
  id: "cure_light_wounds",
  name: "Cure Light Wounds",
  type: "spell",
  description: "When laying your hand upon a living creature, you channel positive energy that cures 1d8 points of damage +1 point per caster level (maximum +5).",
  schools: ["conjuration"],
  subschools: ["healing"],
  components: ["V", "S"],
  castingTime: "1 standard action",
  range: "Touch",
  target: "Creature touched",
  duration: "Instantaneous",
  savingThrow: "Will half (harmless); see text",
  spellResistance: "Yes (harmless)",
  shortDescription: "Cures 1d8 damage +1/level (max +5).",
  classLevels: [
    { className: "Bard", level: 1 },
    { className: "Cleric", level: 1 },
    { className: "Druid", level: 1 },
    { className: "Paladin", level: 1 },
    { className: "Ranger", level: 2 }
  ]
};

// ============================================================================
// Nivel 2
// ============================================================================

export const invisibility: Spell = {
  id: "invisibility",
  name: "Invisibility",
  type: "spell",
  description: "The creature or object touched becomes invisible, vanishing from sight, even from darkvision.",
  schools: ["illusion"],
  subschools: ["glamer"],
  components: ["V", "S", "M", "DF"],
  materialComponent: "An eyelash encased in a bit of gum arabic.",
  castingTime: "1 standard action",
  range: "Touch",
  target: "You or a creature or object weighing no more than 100 lb./level",
  duration: "1 min./level (D)",
  savingThrow: "Will negates (harmless) or Will negates (harmless, object)",
  spellResistance: "Yes (harmless)",
  shortDescription: "Subject is invisible for 1 min./level or until it attacks.",
  classLevels: [
    { className: "Bard", level: 2 },
    { className: "Sorcerer", level: 2 },
    { className: "Wizard", level: 2 }
  ]
};

export const mirrorImage: Spell = {
  id: "mirror_image",
  name: "Mirror Image",
  type: "spell",
  description: "Several illusory duplicates of you pop into being, making it difficult for enemies to know which target to attack.",
  schools: ["illusion"],
  subschools: ["figment"],
  components: ["V", "S"],
  castingTime: "1 standard action",
  range: "Personal",
  target: "You",
  duration: "1 min./level (D)",
  savingThrow: "None",
  spellResistance: "No",
  shortDescription: "Creates decoy duplicates of you (1d4 +1 per three levels, max 8).",
  classLevels: [
    { className: "Bard", level: 2 },
    { className: "Sorcerer", level: 2 },
    { className: "Wizard", level: 2 }
  ]
};

export const holdPerson: Spell = {
  id: "hold_person",
  name: "Hold Person",
  type: "spell",
  description: "The subject becomes paralyzed and freezes in place. It is aware and breathes normally but cannot take any actions, even speech.",
  schools: ["enchantment"],
  subschools: ["compulsion"],
  descriptors: ["mind-affecting"],
  components: ["V", "S", "F", "DF"],
  focus: "A small, straight piece of iron.",
  castingTime: "1 standard action",
  range: "Medium (100 ft. + 10 ft./level)",
  target: "One humanoid creature",
  duration: "1 round/level (D); see text",
  savingThrow: "Will negates; see text",
  spellResistance: "Yes",
  shortDescription: "Paralyzes one humanoid for 1 round/level.",
  classLevels: [
    { className: "Bard", level: 2 },
    { className: "Cleric", level: 2 },
    { className: "Sorcerer", level: 3 },
    { className: "Wizard", level: 3 }
  ]
};

// ============================================================================
// Nivel 3
// ============================================================================

export const fireball: Spell = {
  id: "fireball",
  name: "Fireball",
  type: "spell",
  description: "A fireball spell is an explosion of flame that detonates with a low roar and deals 1d6 points of fire damage per caster level (maximum 10d6) to every creature within the area. Unattended objects also take this damage.",
  schools: ["evocation"],
  descriptors: ["fire"],
  components: ["V", "S", "M"],
  materialComponent: "A tiny ball of bat guano and sulfur.",
  castingTime: "1 standard action",
  range: "Long (400 ft. + 40 ft./level)",
  area: "20-ft.-radius spread",
  duration: "Instantaneous",
  savingThrow: "Reflex half",
  spellResistance: "Yes",
  shortDescription: "1d6 damage per level, 20-ft. radius.",
  classLevels: [
    { className: "Sorcerer", level: 3 },
    { className: "Wizard", level: 3 }
  ]
};

export const lightningBolt: Spell = {
  id: "lightning_bolt",
  name: "Lightning Bolt",
  type: "spell",
  description: "You release a powerful stroke of electrical energy that deals 1d6 points of electricity damage per caster level (maximum 10d6) to each creature within its area.",
  schools: ["evocation"],
  descriptors: ["electricity"],
  components: ["V", "S", "M"],
  materialComponent: "A bit of fur and an amber, crystal, or glass rod.",
  castingTime: "1 standard action",
  range: "120 ft.",
  area: "120-ft. line",
  duration: "Instantaneous",
  savingThrow: "Reflex half",
  spellResistance: "Yes",
  shortDescription: "Electricity deals 1d6/level damage.",
  classLevels: [
    { className: "Sorcerer", level: 3 },
    { className: "Wizard", level: 3 }
  ]
};

export const dispelMagic: Spell = {
  id: "dispel_magic",
  name: "Dispel Magic",
  type: "spell",
  description: "You can use dispel magic to end ongoing spells that have been cast on a creature or object, to temporarily suppress the magical abilities of a magic item, to end ongoing spells (or at least their effects) within an area, or to counter another spellcaster's spell.",
  schools: ["abjuration"],
  components: ["V", "S"],
  castingTime: "1 standard action",
  range: "Medium (100 ft. + 10 ft./level)",
  target: "One spellcaster, creature, or object; or 20-ft.-radius burst",
  duration: "Instantaneous",
  savingThrow: "None",
  spellResistance: "No",
  shortDescription: "Cancels magical spells and effects.",
  classLevels: [
    { className: "Bard", level: 3 },
    { className: "Cleric", level: 3 },
    { className: "Druid", level: 4 },
    { className: "Paladin", level: 3 },
    { className: "Sorcerer", level: 3 },
    { className: "Wizard", level: 3 }
  ]
};

// ============================================================================
// Nivel 4+
// ============================================================================

export const polymorphSelf: Spell = {
  id: "polymorph",
  name: "Polymorph",
  type: "spell",
  description: "This spell functions like alter self, except that you change the willing subject into another form of living creature.",
  schools: ["transmutation"],
  components: ["V", "S", "M"],
  materialComponent: "A piece of the creature whose form you choose.",
  castingTime: "1 standard action",
  range: "Touch",
  target: "Willing living creature touched",
  duration: "1 min./level (D)",
  savingThrow: "None",
  spellResistance: "No",
  shortDescription: "Gives one willing subject a new form.",
  classLevels: [
    { className: "Sorcerer", level: 4 },
    { className: "Wizard", level: 4 }
  ]
};

export const wallOfFire: Spell = {
  id: "wall_of_fire",
  name: "Wall of Fire",
  type: "spell",
  description: "An immobile, blazing curtain of shimmering violet fire springs into existence.",
  schools: ["evocation"],
  descriptors: ["fire"],
  components: ["V", "S", "M", "DF"],
  materialComponent: "A small piece of phosphorus.",
  castingTime: "1 standard action",
  range: "Medium (100 ft. + 10 ft./level)",
  effect: "Opaque sheet of flame up to 20 ft. long/level or a ring of fire with a radius of up to 5 ft. per two levels",
  duration: "Concentration + 1 round/level",
  savingThrow: "None",
  spellResistance: "Yes",
  shortDescription: "Deals 2d4 fire damage out to 10 ft. and 1d4 out to 20 ft.",
  classLevels: [
    { className: "Druid", level: 5 },
    { className: "Sorcerer", level: 4 },
    { className: "Wizard", level: 4 }
  ]
};

// ============================================================================
// Colecciones para tests y ejemplos
// ============================================================================

/** Todos los cantrips/nivel 0 */
export const level0Spells = [
  detectMagic,
  light,
  readMagic,
  rayOfFrost,
  prestidigitation
];

/** Conjuros de nivel 1 */
export const level1Spells = [
  magicMissile,
  shield,
  mageArmor,
  colorSpray,
  bless,
  cureLight
];

/** Conjuros de nivel 2 */
export const level2Spells = [
  invisibility,
  mirrorImage,
  holdPerson
];

/** Conjuros de nivel 3 */
export const level3Spells = [
  fireball,
  lightningBolt,
  dispelMagic
];

/** Conjuros de nivel 4+ */
export const level4PlusSpells = [
  polymorphSelf,
  wallOfFire
];

/** Todos los conjuros de ejemplo */
export const allSampleSpells: Spell[] = [
  ...level0Spells,
  ...level1Spells,
  ...level2Spells,
  ...level3Spells,
  ...level4PlusSpells
];

/** Solo conjuros arcanos (Wizard/Sorcerer) */
export const arcaneSpells = allSampleSpells.filter(spell =>
  spell.classLevels.some(cl => 
    cl.className === "Wizard" || cl.className === "Sorcerer"
  )
);

/** Solo conjuros divinos (Cleric/Druid) */
export const divineSpells = allSampleSpells.filter(spell =>
  spell.classLevels.some(cl => 
    cl.className === "Cleric" || cl.className === "Druid"
  )
);



