import { AttackChange, AttackType } from "./attacks";
import { ContextualizedChange } from "./changes";
import { ContextualVariable, ResolvedContextualVariable } from "./variable";

export type ContextType = 'attack' | 'skill'

export type BaseContextualChangeProps = {
    name: string;
    type: ContextType;
}

export type BaseContextualChange = BaseContextualChangeProps & {
    variables: ContextualVariable[];
    optional: boolean;
    available: boolean;
}

export type ResolvedContextualChange = BaseContextualChangeProps & {
    variables: ResolvedContextualVariable[];
}

export type AttackContextualChangeProps = {
    type: 'attack';
    changes: ContextualizedChange<AttackChange>[];
    appliesTo: 'all' | AttackType;
}

export type AttackContextualChange = BaseContextualChange & AttackContextualChangeProps

export type ResolvedAttackContextualChange = ResolvedContextualChange & AttackContextualChangeProps

export type ContextualChange = AttackContextualChange