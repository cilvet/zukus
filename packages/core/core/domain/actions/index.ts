// Types
export type {
  ActionType,
  ActionParam,
  ParamSource,
  DynamicInput,
  ActionOutput,
  ActionResult,
  InjectBuffResult,
  ConsumeResourceResult,
  DiceRollResult,
  HealResult,
  ResourceType,
  ActionDefinition,
  ActionableFields,
  ContextualEffectGroup,
  ResolvedContextualEffectGroup,
  CompiledContextualEffects,
  ContextualFields,
  ResolvedParams,
  ResolvedOutputs,
  ContextualEffectState,
  InjectEntityOutcome,
  DiceRollOutcome,
  ModifyHPOutcome,
  ConsumeResourceOutcome,
  ActionOutcome,
  ActionExecutionResult,
} from './types';

export { ACTION_TYPE_TO_CONTEXT } from './types';

// Logic
export { resolveParams } from './resolveParams';
export { resolveOutputs } from './resolveOutputs';
export { compileContextualEffects, applyContextualEffects } from './contextualEffects';

// Result primitives
export { executeInjectEntity } from './results/injectEntity';
export { executeModifyHP } from './results/modifyHP';
export { executeDiceRoll } from './results/diceRoll';

// Orchestrator
export { executeAction } from './executeAction';
export type { ExecuteActionInput } from './executeAction';
