import { Formula } from "../../formulae/formula";
import { Condition } from "./conditions";

// =============================================================================
// EFFECT FORMULA - Simplified formula input
// =============================================================================

/**
 * EffectFormula can be:
 * - A simple string: "2 + @bab"
 * - A full Formula object for complex cases (switch formulas, etc.)
 */
export type EffectFormula = string | Formula;

/**
 * Normalizes an EffectFormula to a Formula object.
 * Simple strings are converted to { expression: string }
 */
export function normalizeFormula(formula: EffectFormula): Formula {
  if (typeof formula === "string") {
    return { expression: formula };
  }
  return formula;
}

// =============================================================================
// EFFECT - The fundamental atom of modification
// =============================================================================

/**
 * Effect is the minimal unit of modification.
 * Similar to CustomVariableChange but generalized.
 *
 * The 'target' is a path to any calculable stat:
 * - "size.total"
 * - "ability.strength.score"
 * - "ac.total"
 * - "bab.total"
 * - "savingThrow.fort.total"
 * - "skills.acrobatics.total"
 * - "customVariable.sneakAttackDice"
 *
 * Note: targets use the same paths as the substitution index (valueIndexKeys)
 */
export type Effect = {
  target: string;
  formula: EffectFormula;
  bonusType?: string; // Flexible: each system defines its own types
  conditions?: Condition[];
};

// =============================================================================
// SOURCED EFFECT - Effect with origin information (for traceability)
// =============================================================================

/**
 * Source reference format: "{sourceType}:{sourceId}"
 * Examples:
 * - "feat:power-attack"
 * - "item:belt-of-giant-strength-4"
 * - "spell:enlarge-person"
 * - "buff:rage"
 */
export type SourcedEffect = Effect & {
  sourceRef: string; // "feat:power-attack", "item:belt-of-giant-strength"
  sourceName: string; // For UI: "Power Attack", "Belt of Giant Strength +4"
};

/**
 * Parses a sourceRef into its components.
 * @param sourceRef Format: "{sourceType}:{sourceId}"
 * @returns { type, id } or null if invalid format
 */
export function parseSourceRef(sourceRef: string): {
  type: string;
  id: string;
} | null {
  const colonIndex = sourceRef.indexOf(":");
  if (colonIndex === -1) {
    return null;
  }
  return {
    type: sourceRef.substring(0, colonIndex),
    id: sourceRef.substring(colonIndex + 1),
  };
}

/**
 * Creates a sourceRef from type and id.
 * @param type The source type (e.g., "feat", "item", "spell")
 * @param id The source id
 * @returns The formatted sourceRef
 */
export function createSourceRef(type: string, id: string): string {
  return `${type}:${id}`;
}

// =============================================================================
// MANUAL EFFECT VARIABLE - User-configurable variables for situational effects
// =============================================================================

/**
 * A variable that the user can manipulate (shows as a slider in UI).
 * Used in situational effects like Power Attack.
 */
export type ManualEffectVariable = {
  id: string; // Identifier in formulas: "@points"
  name: string; // Display name: "Power Attack Points"
  min: EffectFormula; // Can be dynamic: 1 or "@minValue"
  max: EffectFormula; // Can be dynamic: "@bab"
  default?: EffectFormula;
};

/**
 * A resolved variable with computed numeric bounds and current value.
 */
export type ResolvedManualEffectVariable = {
  id: string;
  name: string;
  min: number;
  max: number;
  default: number;
  currentValue: number;
};

// =============================================================================
// SITUATIONAL EFFECT GROUP - Effects that apply in specific contexts
// =============================================================================

/**
 * Context types are extensible strings.
 * Common contexts: 'attack', 'skill', 'save', 'damage', 'casting'
 */
export type SituationalContext = string;

/**
 * A group of effects that apply in a specific situational context.
 * Replaces ContextualChange/AttackContextualChange.
 */
export type SituationalEffectGroup = {
  id: string;
  name: string;
  description?: string;

  // Situational context
  context: SituationalContext;
  appliesTo?: string; // Subtype: 'melee' | 'ranged' | 'all' for attacks

  // The effects to apply
  effects: Effect[];

  // User-configurable variables (sliders in UI)
  variables?: ManualEffectVariable[];

  // Behavior
  optional: boolean; // Can be toggled on/off
  availabilityConditions?: Condition[]; // Conditions for availability
};

/**
 * A resolved situational effect group with computed variable values.
 */
export type ResolvedSituationalEffectGroup = Omit<
  SituationalEffectGroup,
  "variables"
> & {
  variables?: ResolvedManualEffectVariable[];
};

// =============================================================================
// EFFECT TARGETS - Common target paths
// =============================================================================

/**
 * Common effect target paths (mirrors valueIndexKeys structure).
 * These are the valid targets for effects.
 */
export const effectTargets = {
  // Size
  SIZE_TOTAL: "size.total",

  // Abilities
  ABILITY_SCORE: (ability: string) => `ability.${ability}.score`,
  ABILITY_MODIFIER: (ability: string) => `ability.${ability}.modifier`,

  // Saving Throws
  SAVING_THROW_TOTAL: (save: string) => `savingThrow.${save}.total`,

  // Combat
  BAB_TOTAL: "bab.total",
  AC_TOTAL: "ac.total",
  AC_TOUCH: "ac.touch.total",
  AC_FLAT_FOOTED: "ac.flatFooted.total",
  INITIATIVE_TOTAL: "initiative.total",

  // Skills
  SKILL_TOTAL: (skill: string) => `skills.${skill}.total`,

  // HP
  HP_MAX: "hp.max",
  HP_TEMPORARY: "hp.temporary",

  // Custom Variables
  CUSTOM_VARIABLE: (id: string) => `customVariable.${id}`,
} as const;


