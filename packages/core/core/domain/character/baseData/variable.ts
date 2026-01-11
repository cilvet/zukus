
export type ContextualVariable = {
    name: string;
    max: number;
    min: number;
    identifier: string;
}


export type ResolvedContextualVariable = ContextualVariable & {
    value: number;
}