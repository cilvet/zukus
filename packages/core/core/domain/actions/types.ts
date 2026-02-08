import type { Effect, EffectFormula, ManualEffectVariable, ResolvedManualEffectVariable } from '../character/baseData/effects';
import type { Condition } from '../character/baseData/conditions';

// =============================================================================
// Action Types
// =============================================================================

/**
 * Action types determine the context string used for contextual effects.
 * Each action type maps to a context: cast_spell → 'casting', etc.
 */
export type ActionType =
  | 'cast_spell'
  | 'use_maneuver'
  | 'use_item'
  | 'activate_ability';

/**
 * Maps action types to their context strings.
 */
export const ACTION_TYPE_TO_CONTEXT: Record<ActionType, string> = {
  cast_spell: 'casting',
  use_maneuver: 'maneuver',
  use_item: 'item_use',
  activate_ability: 'ability',
};

// =============================================================================
// Action Parameters
// =============================================================================

export type DynamicInput =
  | { kind: 'boolean'; label: string }
  | { kind: 'number'; min: EffectFormula; max: EffectFormula }
  | { kind: 'select'; options: { value: string; label: string }[] };

export type ParamSource =
  | { type: 'character'; path: string }
  | { type: 'entity'; path: string }
  | { type: 'formula'; expression: string }
  | { type: 'dynamic'; inputType: DynamicInput };

export type ActionParam = {
  id: string;
  name: string;
  source: ParamSource;
};

// =============================================================================
// Action Outputs
// =============================================================================

export type ActionOutput = {
  id: string;
  formula: EffectFormula;
  targetField: string;
};

// =============================================================================
// Action Results
// =============================================================================

export type ResourceType =
  | { kind: 'cge_slot'; trackId?: string }
  | { kind: 'cge_pool'; trackId?: string; cost: EffectFormula }
  | { kind: 'resource'; resourceId: string; cost: EffectFormula }
  | { kind: 'inventory_quantity'; amount: number };

export type InjectBuffResult = {
  type: 'inject_entity';
  entityId: string;
  target: 'self';
  active: boolean;
};

export type ConsumeResourceResult = {
  type: 'consume_resource';
  resourceType: ResourceType;
};

export type DiceRollResult = {
  type: 'dice_roll';
  id: string;
  label: string;
  diceFormula: EffectFormula;
};

export type HealResult = {
  type: 'heal';
  formula: EffectFormula;
  target: 'self';
};

export type ActionResult =
  | InjectBuffResult
  | ConsumeResourceResult
  | DiceRollResult
  | HealResult;

// =============================================================================
// Action Definition
// =============================================================================

export type ActionDefinition = {
  id: string;
  name: string;
  actionType: ActionType;
  params?: ActionParam[];
  defaultParamValues?: Record<string, unknown>;
  outputs?: ActionOutput[];
  results: ActionResult[];
};

// =============================================================================
// Actionable Fields (addon for entities)
// =============================================================================

export type ActionableFields = {
  actions?: ActionDefinition[];
};

// =============================================================================
// Contextual Effect Group (renamed from SituationalEffectGroup)
// =============================================================================

export type ContextualEffectGroup = {
  id: string;
  name: string;
  description?: string;
  context: string;
  appliesTo?: string;
  effects: Effect[];
  variables?: ManualEffectVariable[];
  optional: boolean;
  availabilityConditions?: Condition[];
};

export type ResolvedContextualEffectGroup = Omit<ContextualEffectGroup, 'variables'> & {
  variables?: ResolvedManualEffectVariable[];
};

// =============================================================================
// Compiled Contextual Effects
// =============================================================================

export type CompiledContextualEffects = {
  all: ContextualEffectGroup[];
  byContext: Record<string, ContextualEffectGroup[]>;
};

// =============================================================================
// Contextual Fields (addon for entities that provide contextual effects)
// =============================================================================

export type ContextualFields = {
  contextualEffects?: ContextualEffectGroup[];
};

// =============================================================================
// Resolved Parameters & Execution Types
// =============================================================================

export type ResolvedParams = Record<string, number | string | boolean>;

export type ResolvedOutputs = Record<string, unknown>;

/**
 * User-provided state for contextual effects:
 * which groups are active, and variable values for each.
 */
export type ContextualEffectState = {
  activeGroupIds: string[];
  variableValues: Record<string, Record<string, number>>;
};

// =============================================================================
// Execution Results
// =============================================================================

export type InjectEntityOutcome = {
  type: 'inject_entity';
  entity: Record<string, unknown>;
};

export type DiceRollOutcome = {
  type: 'dice_roll';
  id: string;
  label: string;
  result: number;
  formula: string;
};

export type ModifyHPOutcome = {
  type: 'modify_hp';
  mode: 'heal' | 'damage';
  amount: number;
  formula: string;
};

export type ResolvedResourceType =
  | { kind: 'cge_slot'; trackId?: string }
  | { kind: 'cge_pool'; trackId?: string; cost: number }
  | { kind: 'resource'; resourceId: string; cost: number }
  | { kind: 'inventory_quantity'; amount: number };

export type ConsumeResourceOutcome = {
  type: 'consume_resource';
  resourceType: ResolvedResourceType;
};

export type ActionOutcome =
  | InjectEntityOutcome
  | DiceRollOutcome
  | ModifyHPOutcome
  | ConsumeResourceOutcome;

export type ActionExecutionResult = {
  outcomes: ActionOutcome[];
  resolvedParams: ResolvedParams;
};
