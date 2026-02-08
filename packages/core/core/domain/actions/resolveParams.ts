import type { SubstitutionIndex } from '../character/calculation/sources/calculateSources';
import type { StandardEntity } from '../entities/types/base';
import { substituteExpression } from '../formulae/formula';
import { DiceRollerImpl } from '../rolls/DiceRoller/diceRoller';
import type { ActionDefinition, ResolvedParams } from './types';

const diceRoller = new DiceRollerImpl();

function getValueByPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function stripLeadingAt(path: string): string {
  return path.startsWith('@') ? path.slice(1) : path;
}

export function resolveParams(
  action: ActionDefinition,
  entity: StandardEntity,
  substitutionIndex: SubstitutionIndex,
  dynamicValues?: Record<string, number | string | boolean>,
): ResolvedParams {
  const params = action.params;
  if (!params) return {};

  const resolved: ResolvedParams = {};

  for (const param of params) {
    const source = param.source;

    switch (source.type) {
      case 'character': {
        const path = stripLeadingAt(source.path);
        resolved[param.id] = substitutionIndex[path] ?? 0;
        break;
      }
      case 'entity': {
        const path = stripLeadingAt(source.path);
        const cleanPath = path.startsWith('entity.') ? path.slice('entity.'.length) : path;
        const value = getValueByPath(entity as unknown as Record<string, unknown>, cleanPath);
        if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
          resolved[param.id] = value;
        } else {
          resolved[param.id] = 0;
        }
        break;
      }
      case 'formula': {
        const paramIndex: SubstitutionIndex = { ...substitutionIndex };
        for (const [key, val] of Object.entries(resolved)) {
          if (typeof val === 'number') {
            paramIndex[`param.${key}`] = val;
          }
        }
        const substituted = substituteExpression(source.expression, paramIndex);
        const result = diceRoller.roll(substituted);
        resolved[param.id] = result.result;
        break;
      }
      case 'dynamic': {
        const provided = dynamicValues?.[param.id];
        if (provided !== undefined) {
          resolved[param.id] = provided;
        } else {
          const input = source.inputType;
          switch (input.kind) {
            case 'boolean':
              resolved[param.id] = false;
              break;
            case 'number':
              resolved[param.id] = 0;
              break;
            case 'select':
              resolved[param.id] = input.options.length > 0 ? input.options[0].value : '';
              break;
          }
        }
        break;
      }
    }
  }

  return resolved;
}
