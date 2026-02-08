import type { SubstitutionIndex } from '../character/calculation/sources/calculateSources';
import type { StandardEntity } from '../entities/types/base';
import type {
  ActionDefinition,
  ActionExecutionResult,
  ActionOutcome,
  ContextualEffectGroup,
  ContextualEffectState,
  ResolvedParams,
} from './types';
import { ACTION_TYPE_TO_CONTEXT } from './types';
import { resolveParams } from './resolveParams';
import { resolveOutputs } from './resolveOutputs';
import { applyContextualEffects, compileContextualEffects } from './contextualEffects';
import { executeInjectEntity } from './results/injectEntity';
import { executeModifyHP } from './results/modifyHP';
import { executeDiceRoll } from './results/diceRoll';
import { executeConsumeResource } from './results/consumeResource';

export type ExecuteActionInput = {
  action: ActionDefinition;
  entity: StandardEntity;
  substitutionIndex: SubstitutionIndex;
  dynamicValues?: Record<string, number | string | boolean>;
  contextualEffectState?: ContextualEffectState;
  characterEntities?: Array<{ contextualEffects?: ContextualEffectGroup[] }>;
  entityLookup: (id: string) => Record<string, unknown> | undefined;
};

export function executeAction(input: ExecuteActionInput): ActionExecutionResult {
  const {
    action,
    entity,
    substitutionIndex,
    dynamicValues,
    contextualEffectState,
    characterEntities,
    entityLookup,
  } = input;

  // 1. Resolve params
  let resolvedParams: ResolvedParams = resolveParams(
    action,
    entity,
    substitutionIndex,
    dynamicValues,
  );

  // 2. Apply contextual effects if any
  if (contextualEffectState && characterEntities) {
    const context = ACTION_TYPE_TO_CONTEXT[action.actionType];
    const compiled = compileContextualEffects(characterEntities);
    const contextGroups = compiled.byContext[context] ?? [];

    const activeGroups = contextGroups.filter((g) =>
      contextualEffectState.activeGroupIds.includes(g.id),
    );

    if (activeGroups.length > 0) {
      resolvedParams = applyContextualEffects(
        resolvedParams,
        activeGroups,
        contextualEffectState.variableValues,
      );
    }
  }

  // 3. Resolve outputs
  const outputValues = action.outputs
    ? resolveOutputs(action.outputs, resolvedParams)
    : {};

  // 4. Execute results
  const outcomes: ActionOutcome[] = [];

  for (const result of action.results) {
    switch (result.type) {
      case 'inject_entity': {
        const outcome = executeInjectEntity(result, outputValues, entityLookup);
        outcomes.push(outcome);
        break;
      }
      case 'heal': {
        const outcome = executeModifyHP(result, resolvedParams);
        outcomes.push(outcome);
        break;
      }
      case 'dice_roll': {
        const outcome = executeDiceRoll(result, resolvedParams);
        outcomes.push(outcome);
        break;
      }
      case 'consume_resource': {
        const outcome = executeConsumeResource(result, resolvedParams);
        outcomes.push(outcome);
        break;
      }
    }
  }

  return { outcomes, resolvedParams };
}
