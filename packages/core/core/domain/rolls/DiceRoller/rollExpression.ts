import { Dice } from "../dice";

export type RollExpression = {
  text: string;
  components: RollComponent[];
};

export type ResolvedRollExpression = {
  text: string;
  components: (ResolvedRollComponent | ResolvedRollExpressionComponent)[];
  result: number;
};

export enum RollComponentType {
  DICE_EXPRESSION = "DICE_EXPRESSION",
  NUMBER = "NUMBER",
  ROLL_EXPRESSION = "ROLL_EXPRESSION",
  OPERATOR = "OPERATOR",
  OPERATION = "OPERATION",
  FUNCTION = "FUNCTION",
}

export enum Operator {
  SUM = "+",
  DIFFERENCE = "-",
  MULTIPLICATION = "*",
  DIVISION = "/",
}

export const functions = [
  "min",
  "max",
  "floor",
  "ceil",
  "round",
  "abs",
] as const;
export type RollFunction = (typeof functions)[number];

export interface Operation {
  operator: Operator;
  firstOperand: RollComponent;
  secondOperand: RollComponent;
}

export const GroupOperatorsByPriority: Operator[] = [
  Operator.DIVISION,
  Operator.MULTIPLICATION,
];

export type BaseRollComponent = {
  type: RollComponentType;
  extraData?: Record<string, unknown>;
};

export type DiceRollComponent = BaseRollComponent & {
  type: RollComponentType.DICE_EXPRESSION;
  value: DiceExpression;
};

export type NumberRollComponent = BaseRollComponent & {
  type: RollComponentType.NUMBER;
  value: number;
};

export type RollExpressionComponent = BaseRollComponent & {
  type: RollComponentType.ROLL_EXPRESSION;
  value: RollExpression;
};

export type OperatorRollComponent = BaseRollComponent & {
  type: RollComponentType.OPERATOR;
  value: Operator;
};

export type OperationRollComponent = BaseRollComponent & {
  type: RollComponentType.OPERATION;
  value: Operation;
};

export type FunctionRollComponent = BaseRollComponent & {
  type: RollComponentType.FUNCTION;
  func: RollFunction;
  args: RollComponent[];
};

export type NormalRolComponent =
  | DiceRollComponent
  | NumberRollComponent
  | OperatorRollComponent
  | OperationRollComponent
  | FunctionRollComponent;
export type RollComponent = NormalRolComponent | RollExpressionComponent;

export type NormalResolvedRollComponent = NormalRolComponent & {
  result: RollComponentResult;
};

export type ResolvedRollExpressionComponent = {
  type: RollComponentType.ROLL_EXPRESSION;
  value: ResolvedRollExpression;
  result: RollComponentResult;
};
export type ResolvedRollComponent =
  | NormalResolvedRollComponent
  | ResolvedRollExpressionComponent;

export interface RollComponentResult {
  value: number;
  diceRolledData?: DiceRolledData[];
}

export interface DiceRolledData {
  dice: Dice;
  allResults: number[];
  keptResults: number[];
  discardedResults: number[];
  totalResult: number;
  extraData?: Record<string, unknown>;
}

export type BaseDiceExpression = {
  dice: Dice;
  diceSelectorExpressions?: DiceSelectorExpression[];
};

export type SimpleDiceExpression = BaseDiceExpression & {
  type: "simple";
  amount: number;
};

export type ComplexDiceExpression = BaseDiceExpression & {
  type: "complex";
  amount: RollExpression;
};

export type DiceExpression = SimpleDiceExpression | ComplexDiceExpression;

export enum DiceSelectorType {
  KEEP_HIGHER = "KEEP_HIGHER",
  KEEP_LOWER = "KEEP_LOWER",
  DROP_HIGHER = "DROP_HIGHER",
  DROP_LOWER = "DROP_LOWER",
}

export interface DiceSelectorExpression {
  type: DiceSelectorType;
  amount: number;
}

export interface RollExpressionResult {
  expression: RollExpression;
  result: number;
}
