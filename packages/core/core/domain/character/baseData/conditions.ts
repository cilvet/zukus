import { z } from "zod";
import type { EntityPropertyCondition } from "../../levels/filtering/types";

// =============================================================================
// Relational Operators (for simple conditions)
// =============================================================================

export const RelationalOperatorsSchema = z.enum(["==", "!=", "<", ">", "<=", ">="]);

export type RelationalOperators = z.infer<typeof RelationalOperatorsSchema>;

export const RELATIONAL_OPERATORS = ["==", "!=", "<", ">", "<=", ">="] as const;

// =============================================================================
// Simple Condition (numeric comparisons with formulas)
// =============================================================================

/**
 * A condition that compares two numeric formulas.
 * Variables in formulas are substituted before evaluation.
 * 
 * @example
 * ```typescript
 * const condition: SimpleCondition = {
 *   type: 'simple',
 *   firstFormula: '@character.bab',
 *   operator: '>=',
 *   secondFormula: '6',
 * };
 * ```
 */
export type SimpleCondition = {
  type: 'simple';
  /** First formula, can contain variables like @character.bab */
  firstFormula: string;
  /** Second formula, can contain variables */
  secondFormula: string;
  /** Relational operator for comparison */
  operator: RelationalOperators;
};

export const SimpleConditionSchema = z.object({
  type: z.literal("simple").describe("Numeric comparison condition"),
  firstFormula: z.string().describe("First formula, can contain variables"),
  secondFormula: z.string().describe("Second formula, can contain variables"),
  operator: RelationalOperatorsSchema.describe("Relational operator"),
});

// =============================================================================
// Has Entity Condition (checks if character has entities)
// =============================================================================

/**
 * A condition that checks if the character has specific entities.
 * 
 * Can check by:
 * - Specific entity ID
 * - Entity type (any entity of that type)
 * - Filter (entities matching conditions)
 * - Count requirements (min/max)
 * 
 * @example
 * ```typescript
 * // Has specific feat
 * const hasPowerAttack: HasEntityCondition = {
 *   type: 'has_entity',
 *   entityId: 'power-attack',
 * };
 * 
 * // Has any combat feat
 * const hasCombatFeat: HasEntityCondition = {
 *   type: 'has_entity',
 *   entityType: 'feat',
 *   filter: [{ field: 'tags', operator: 'contains', value: 'combat' }],
 * };
 * 
 * // Has at least 2 metamagic feats
 * const hasMetamagicFeats: HasEntityCondition = {
 *   type: 'has_entity',
 *   entityType: 'feat',
 *   filter: [{ field: 'tags', operator: 'contains', value: 'metamagic' }],
 *   count: { min: 2 },
 * };
 * ```
 */
export type HasEntityCondition = {
  type: 'has_entity';
  /** Specific entity ID to check for */
  entityId?: string;
  /** Entity type to check for (any entity of this type) */
  entityType?: string;
  /** Additional filter conditions on the entity */
  filter?: EntityPropertyCondition[];
  /** Count requirements */
  count?: {
    /** Minimum number of matching entities required */
    min?: number;
    /** Maximum number of matching entities allowed */
    max?: number;
  };
};

// Note: HasEntityCondition uses EntityPropertyCondition which has its own operators
// including 'contains', 'in', etc. No Zod schema needed for runtime - TypeScript only.

// =============================================================================
// Condition (discriminated union)
// =============================================================================

/**
 * A condition that can be evaluated against character state.
 * 
 * Two types:
 * - `simple`: Numeric comparison between formulas with variables
 * - `has_entity`: Check if character has specific entities
 * 
 * @see SimpleCondition
 * @see HasEntityCondition
 */
export type Condition = SimpleCondition | HasEntityCondition;

/**
 * Zod schema for Condition.
 * Note: Only validates SimpleCondition. HasEntityCondition is TypeScript-only
 * because it uses EntityPropertyCondition which doesn't have a Zod schema.
 */
export const ConditionSchema = SimpleConditionSchema;

// =============================================================================
// Context for evaluating conditions
// =============================================================================

/**
 * Base entity type for condition evaluation.
 * Only requires id and entityType for has_entity checks.
 */
export type ConditionEntity = {
  id: string;
  entityType: string;
  [key: string]: unknown;
};

/**
 * Context needed to evaluate conditions.
 * 
 * - `variables`: Required for all conditions (substitution of @variable references)
 * - `characterEntities`: Required only for has_entity conditions
 */
export type ConditionContext = {
  /** Variable values for substitution (e.g., { 'character.bab': 6 }) */
  variables: Record<string, string | number>;
  /** Entities the character has (for has_entity conditions) */
  characterEntities?: ConditionEntity[];
};
