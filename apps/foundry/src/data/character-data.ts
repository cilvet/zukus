/**
 * Foundry VTT Data Model for Character Actors
 *
 * This defines the schema for character data as stored in Foundry.
 * The actual calculations are performed by @zukus/core.
 */

const fields = foundry.data.fields;

/**
 * Base ability scores schema (STR, DEX, CON, INT, WIS, CHA)
 */
function createAbilitySchema() {
  return new fields.SchemaField({
    value: new fields.NumberField({
      required: true,
      integer: true,
      initial: 10,
      min: 1
    }),
    drain: new fields.NumberField({ integer: true, initial: 0 }),
    damage: new fields.NumberField({ integer: true, initial: 0 }),
  });
}

/**
 * Character Data Model for FoundryVTT
 *
 * Stores base data that will be converted to CharacterBaseData
 * for calculation by @zukus/core
 */
export class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      // Biography (HTML field for rich text)
      biography: new fields.HTMLField(),

      // Base Ability Scores (input to calculations)
      abilities: new fields.SchemaField({
        strength: createAbilitySchema(),
        dexterity: createAbilitySchema(),
        constitution: createAbilitySchema(),
        intelligence: createAbilitySchema(),
        wisdom: createAbilitySchema(),
        charisma: createAbilitySchema(),
      }),

      // HP tracking
      hp: new fields.SchemaField({
        value: new fields.NumberField({ integer: true, initial: 10, min: 0 }),
        max: new fields.NumberField({ integer: true, initial: 10, min: 0 }),
        temp: new fields.NumberField({ integer: true, initial: 0, min: 0 }),
        damage: new fields.NumberField({ integer: true, initial: 0, min: 0 }),
      }),

      // Combat stats (calculated, but editable for overrides)
      ac: new fields.SchemaField({
        total: new fields.NumberField({ integer: true, initial: 10 }),
        touch: new fields.NumberField({ integer: true, initial: 10 }),
        flatFooted: new fields.NumberField({ integer: true, initial: 10 }),
      }),

      bab: new fields.NumberField({ integer: true, initial: 0 }),

      initiative: new fields.NumberField({ integer: true, initial: 0 }),

      // Saving throws
      saves: new fields.SchemaField({
        fortitude: new fields.NumberField({ integer: true, initial: 0 }),
        reflex: new fields.NumberField({ integer: true, initial: 0 }),
        will: new fields.NumberField({ integer: true, initial: 0 }),
      }),

      // Level info
      details: new fields.SchemaField({
        level: new fields.NumberField({ integer: true, initial: 1, min: 1 }),
        xp: new fields.NumberField({ integer: true, initial: 0, min: 0 }),
      }),

      // Size category
      size: new fields.StringField({ initial: 'MEDIUM' }),

      // Speeds
      speed: new fields.SchemaField({
        land: new fields.NumberField({ integer: true, initial: 30, min: 0 }),
      }),

      // Skills stored as object (flexible for any skill system)
      skills: new fields.ObjectField(),

      // Calculated data from @zukus/core (stored for display)
      calculated: new fields.ObjectField(),

      // Source breakdowns for tooltips
      sourceBreakdowns: new fields.ObjectField(),
    };
  }

  /**
   * Prepare base data before embedded documents
   */
  prepareBaseData() {
    // Initialize calculated object if not present
    if (!this.calculated) {
      (this as any).calculated = {};
    }
    if (!this.sourceBreakdowns) {
      (this as any).sourceBreakdowns = {};
    }
  }

  /**
   * Calculate derived values using @zukus/core
   * This is called AFTER active effects are applied
   */
  prepareDerivedData() {
    // The actual calculation happens in ZukusActor.prepareDerivedData()
    // because we need access to the parent Actor and its Items
  }
}

// Type declaration for the schema
export type CharacterDataSchema = {
  biography: string;
  abilities: {
    strength: { value: number; drain: number; damage: number };
    dexterity: { value: number; drain: number; damage: number };
    constitution: { value: number; drain: number; damage: number };
    intelligence: { value: number; drain: number; damage: number };
    wisdom: { value: number; drain: number; damage: number };
    charisma: { value: number; drain: number; damage: number };
  };
  hp: { value: number; max: number; temp: number; damage: number };
  ac: { total: number; touch: number; flatFooted: number };
  bab: number;
  initiative: number;
  saves: { fortitude: number; reflex: number; will: number };
  details: { level: number; xp: number };
  size: string;
  speed: { land: number };
  skills: Record<string, unknown>;
  calculated: Record<string, unknown>;
  sourceBreakdowns: Record<string, unknown>;
};
