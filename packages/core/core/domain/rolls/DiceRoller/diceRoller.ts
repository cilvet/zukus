import { randomInteger } from "../../../utils/random";
import {
  getRollExpression,
  SubstitutionExpressions,
} from "../expressionAnalysis/expressionAnalysis";
import { MockDiceRoller } from "./MockDiceRoller";
import { DiceRoller } from "./diceRoller.types";

import {
  RollExpressionResult,
  DiceExpression,
  RollExpression,
  RollComponent,
  RollComponentType,
  Operator,
  RollComponentResult,
  Operation,
  DiceSelectorExpression,
  DiceSelectorType,
  ResolvedRollExpression,
  ResolvedRollComponent,
  ResolvedRollExpressionComponent,
  RollExpressionComponent,
  NumberRollComponent,
  DiceRollComponent,
  OperationRollComponent,
  OperatorRollComponent,
  FunctionRollComponent,
} from "./rollExpression";

export class DiceRollerImpl implements DiceRoller {
  roll(
    textInput: string,
    substitutionExpressions?: SubstitutionExpressions
  ): ResolvedRollExpression {
    const rollExpression = getRollExpression(
      textInput,
      substitutionExpressions
    );
    return getResolvedRollExpression(rollExpression, randomInteger);
  }
  getRollExpression(
    textInput: string,
    substitutionExpressions?: SubstitutionExpressions | undefined
  ): RollExpression {
    return getRollExpression(textInput, substitutionExpressions);
  }
  resolveRollExpression(rollExpression: RollExpression) {
    return getResolvedRollExpression(rollExpression, randomInteger);
  }
}

export const roll = (
  textInput: string,
  substitutionExpressions?: SubstitutionExpressions
): ResolvedRollExpression => {
  const rollExpression = getRollExpression(textInput, substitutionExpressions);
  return getResolvedRollExpression(rollExpression, randomInteger);
};

export function getResolvedRollExpression(
  rollExpression: RollExpression,
  randomInteger: (min: number, max: number) => number
): ResolvedRollExpression {
  const resolvedComponents = rollExpression.components.map((component) =>
    getResolvedComponent(component, randomInteger)
  );

  return {
    ...rollExpression,
    components: resolvedComponents,
    result: calculateRollExpressionComponentsResult(resolvedComponents),
  };
}

function calculateRollExpressionComponentsResult(
  components: ResolvedRollComponent[]
): number {
  return components
    .map((currentComponent, index, allComponents) => {
      if (currentComponent.type === RollComponentType.OPERATOR) {
        return 0;
      }
      const leftComponent = allComponents[index - 1];
      if (
        leftComponent?.type === RollComponentType.OPERATOR &&
        leftComponent.value === Operator.DIFFERENCE
      ) {
        return -currentComponent.result.value;
      }
      return currentComponent.result!!.value;
    })
    .reduce((previous, current) => previous + current);
}

function getResolvedRollExpressionComponent(
  component: RollExpressionComponent,
  randomInteger: (min: number, max: number) => number
): ResolvedRollExpressionComponent {
  const resolvedRollExpression = getResolvedRollExpression(
    component.value,
    randomInteger
  );
  return {
    ...component,
    value: resolvedRollExpression,
    result: {
      value: resolvedRollExpression.result,
    },
  };
}

function getResolvedNumberComponent(
  component: NumberRollComponent
): ResolvedRollComponent {
  return {
    ...component,
    result: {
      value: component.value,
    },
  };
}

function getResolvedDiceExpressionComponent(
  component: DiceRollComponent,
  randomInteger: (min: number, max: number) => number
): ResolvedRollComponent {
  const diceExpression = component.value;
  const result = getDiceExpressionResult(diceExpression, randomInteger);
  return {
    ...component,
    result,
  };
}

function getResolvedOperationComponent(
  component: OperationRollComponent,
  randomInteger: (min: number, max: number) => number
): ResolvedRollComponent {
  const operation = component.value;
  const firstOperand = getResolvedComponent(
    operation.firstOperand,
    randomInteger
  );
  const secondOperand = getResolvedComponent(
    operation.secondOperand,
    randomInteger
  );

  if (operation.operator === Operator.DIVISION) {
    return {
      ...component,
      result: {
        value: firstOperand.result!!.value / secondOperand.result!!.value,
      },
    };
  }

  return {
    ...component,
    result: {
      value: firstOperand.result!!.value * secondOperand.result!!.value,
    },
  };
}

function getResolvedOperatorComponent(
  component: OperatorRollComponent
): ResolvedRollComponent {
  return {
    ...component,
    result: {
      value: 0,
    },
  };
}

function getResolvedFunctionComponent(
  component: FunctionRollComponent,
  randomInteger: (min: number, max: number) => number
): ResolvedRollComponent {
  const func = Math[component.func] as (...args: number[]) => number;
  const resolvedArgs = component.args.map((arg) =>
    getResolvedComponent(arg, randomInteger)
  );
  const resolvedComponents = component.args.map((component) =>
    getResolvedComponent(component, randomInteger)
  );
  const results = resolvedComponents.map((component) => component.result!!.value)
  const result = func(...results);
  return {
    ...component,
    result: {
      value: result,
    },
  };
}

function getResolvedComponent(
  component: RollComponent,
  randomInteger: (min: number, max: number) => number
): ResolvedRollComponent {
  switch (component.type) {
    case RollComponentType.ROLL_EXPRESSION:
      return getResolvedRollExpressionComponent(component, randomInteger);
    case RollComponentType.NUMBER:
      return getResolvedNumberComponent(component);
    case RollComponentType.DICE_EXPRESSION:
      return getResolvedDiceExpressionComponent(component, randomInteger);
    case RollComponentType.OPERATION:
      return getResolvedOperationComponent(component, randomInteger);
    case RollComponentType.OPERATOR:
      return getResolvedOperatorComponent(component);
    case RollComponentType.FUNCTION:
      return getResolvedFunctionComponent(component, randomInteger);
  }
}

function getDiceExpressionResult(
  diceExpression: DiceExpression,
  randomInteger: (min: number, max: number) => number
): RollComponentResult {
  const allResults: number[] = [];
  let keptResults: number[] = [];
  let discardedResults: number[] = [];
  const amountOfDiceToRoll =
    diceExpression.type === "simple"
      ? diceExpression.amount
      : getResolvedRollExpression(diceExpression.amount, randomInteger).result;

  for (let i = 0; i < amountOfDiceToRoll; i++) {
    const diceResult = randomInteger(1, diceExpression.dice.sides);
    allResults.push(diceResult);
  }
  if (!diceExpression.diceSelectorExpressions) {
    keptResults.push(...allResults);
  } else {
    diceExpression.diceSelectorExpressions.forEach((diceSelectorExpression) => {
      const selectedResults = getSelectedDiceResults(
        diceSelectorExpression,
        keptResults.length ? keptResults : allResults
      );
      keptResults = selectedResults.keptResults;
      discardedResults = selectedResults.discardedResults;
    });
  }
  const result = keptResults.reduce(
    (previous, current) => previous + current,
    0
  );
  return {
    value: result,
    diceRolledData: [
      {
        dice: diceExpression.dice,
        allResults: allResults,
        keptResults: keptResults,
        discardedResults: discardedResults,
        totalResult: result,
      },
    ],
  };
}

function getSelectedDiceResults(
  diceSelectorExpression: DiceSelectorExpression,
  diceResults: number[]
): { keptResults: number[]; discardedResults: number[] } {
  const { amount, type } = diceSelectorExpression;
  const lowerToHigher = (a: number, b: number) => a - b;
  const higherToLower = (a: number, b: number) => b - a;

  const keptResults: number[] = [];
  const discardedResults: number[] = [];
  switch (type) {
    case DiceSelectorType.KEEP_HIGHER:
      keptResults.push(...diceResults.sort(higherToLower).slice(0, amount));
      break;
    case DiceSelectorType.KEEP_LOWER:
      keptResults.push(...diceResults.sort(lowerToHigher).slice(0, amount));
      break;
    case DiceSelectorType.DROP_HIGHER:
      keptResults.push(
        ...diceResults.sort(lowerToHigher).slice(0, diceResults.length - amount)
      );
      break;
    case DiceSelectorType.DROP_LOWER:
      keptResults.push(
        ...diceResults.sort(higherToLower).slice(0, diceResults.length - amount)
      );
      break;
  }
  discardedResults.push(
    ...diceResults.filter((result) => !keptResults.includes(result))
  );
  return { keptResults, discardedResults };
}
