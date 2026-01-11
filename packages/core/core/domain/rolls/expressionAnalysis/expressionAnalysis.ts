import {
  RollComponent,
  GroupOperatorsByPriority,
  Operation,
  RollComponentType,
  Operator,
  RollExpressionComponent,
  RollExpression,
  functions,
  FunctionRollComponent,
  RollFunction,
} from "../DiceRoller/rollExpression";
import {
  getComponentFromComplexDiceExpression,
  getComponentFromDiceSection,
  getComponentFromDiceExpressionWithParenthesesSides,
  getComponentFromDiceExpressionWithBothSidesParentheses,
  isComplexDiceExpression,
  isDiceSection,
  isDiceExpressionWithParenthesesSides,
  isDiceExpressionWithBothSidesParentheses,
  joinDiceExpressionsWithParenthesesSides,
} from "./dice/diceExpressionAnalysis";
import {
  isParenthesesSection,
  separateExpressionParentheses,
} from "./parentheses/parenthesesExpressionAnalysis";
import { separateByEnclosingCharacters, splitBySeparatorWithEnclosingChars } from "./utils/expressionAnalysisUtils";

const operators = ["+", "-", "*", "/"];
const comparators = ["<", ">", "<=", ">=", "==", "!="];

const AND = "&&";
const OR = "||";
const logicalOperators = [AND, OR];

const exactIncompleteDiceExpression = new RegExp(/^d\d[a-z0-9]*$/);

export type SubstitutionExpressions = {
  [key: string]: ExtraExpressionData;
};

export type ExtraExpressionData = {
  expression: string;
  extraData?: {
    [key: string]: any;
  };
};

export function getRollExpression(
  input: string,
  substitutionExpressions?: SubstitutionExpressions
): RollExpression {
  const components = getExpressionComponents(input, substitutionExpressions);
  return {
    components: components,
    text: input,
  };
}

function is<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function getExpressionComponents(
  input: string,
  substitutionExpressions?: SubstitutionExpressions
): RollComponent[] {
  const sectionComponents = separateExpressionParentheses(input)
    .flatMap(separateOperators)
    .map(joinComplexDiceExpressions)
    .filter(is<string>)
    .map(joinDiceExpressionsWithParenthesesSides)
    .filter(is<string>)
    .map(joinFunctionSections)
    .filter(is<string>)
    .map((section) =>
      getComponentFromSection(section, substitutionExpressions)
    );
  return createOperationComponents(sectionComponents);
}

export function isFunctionSection(input: string) {
  return functions.find((functionName) =>
    input.trim().startsWith(functionName)
  );
}

function joinComplexDiceExpressions(
  input: string,
  index: number,
  array: string[]
): string | undefined {
  if (exactIncompleteDiceExpression.test(input)) {
    return undefined;
  }
  const isLastItem = index === array.length - 1;
  if (isLastItem) {
    return input;
  }
  const nextItem = array[index + 1];
  if (
    isParenthesesSection(input) &&
    exactIncompleteDiceExpression.test(nextItem)
  ) {
    return input + nextItem;
  }
  return input;
}



function joinFunctionSections(
  input: string,
  index: number,
  array: string[]
): string | undefined {
  if (isFunctionSection(input)) {
    return undefined;
  }
  const isFirstItem = index === 0;
  if (isFirstItem) {
    return input;
  }
  const previousItem = array[index - 1];
  if (isParenthesesSection(input) && isFunctionSection(previousItem)) {
    return previousItem + input;
  }
  return input;
}

function createOperationComponents(
  sectionComponents: RollComponent[]
): RollComponent[] {
  const updatedComponents: RollComponent[] = [...sectionComponents];
  GroupOperatorsByPriority.forEach((operator) => {
    while (
      updatedComponents.find(
        (component) =>
          component.type === RollComponentType.OPERATOR &&
          component.value === operator
      )
    ) {
      const operatorIndex = updatedComponents.findIndex(
        (component) =>
          component.type === RollComponentType.OPERATOR &&
          component.value === operator
      );
      const firstOperand = updatedComponents[operatorIndex - 1];
      const secondOperand = updatedComponents[operatorIndex + 1];
      const operation = {
        operator: operator,
        firstOperand: firstOperand,
        secondOperand: secondOperand,
      } as Operation;
      const newComponent = {
        type: RollComponentType.OPERATION,
        value: operation,
      } as RollComponent;
      updatedComponents.fill(
        newComponent,
        operatorIndex - 1,
        operatorIndex + 2
      );
      updatedComponents.splice(operatorIndex - 1, 2);
    }
  });
  return updatedComponents;
}

function getComponentFromFunctionSection(
  section: string,
  substitutionExpressions?: SubstitutionExpressions
): FunctionRollComponent {
  const [functionName, paramString] = separateExpressionParentheses(section.trim());
  const paramsStringWithoutParentheses = paramString.substring(1, paramString.length - 1);
  const functionParams = splitBySeparatorWithEnclosingChars(paramsStringWithoutParentheses, ',', '(', ')');

  const functionComponents: RollExpressionComponent[] = functionParams.map(
    (param) => {
      return {
        type: RollComponentType.ROLL_EXPRESSION,
        value: getRollExpression(param, substitutionExpressions),
      };
    }
  );

  return {
    type: RollComponentType.FUNCTION,
    args: functionComponents,
    func: functionName as RollFunction,
  };
}

function getComponentFromSection(
  section: string,
  substitutionExpressions?: SubstitutionExpressions
): RollComponent {
  // Check for both sides parentheses first (most specific case)
  if (isDiceExpressionWithBothSidesParentheses(section)) {
    return getComponentFromDiceExpressionWithBothSidesParentheses(
      section,
      substitutionExpressions
    );
  }
  if (isComplexDiceExpression(section)) {
    return getComponentFromComplexDiceExpression(
      section,
      substitutionExpressions
    );
  }
  if (isDiceExpressionWithParenthesesSides(section)) {
    return getComponentFromDiceExpressionWithParenthesesSides(
      section,
      substitutionExpressions
    );
  }
  if (isFunctionSection(section)) {
    return getComponentFromFunctionSection(section, substitutionExpressions);
  }
  if (isParenthesesSection(section)) {
    return getComponentFromParenthesesSection(section, substitutionExpressions);
  }
  if (isSubstitutionSection(section)) {
    if (!substitutionExpressions) {
      throw new Error(`Substitution expression ${section} not found`);
    }
    return getComponentFromSubstitutionSection(
      section,
      substitutionExpressions
    );
  }
  if (isDiceSection(section)) {
    return getComponentFromDiceSection(section);
  }
  if (isOperator(section)) {
    return getComponentFromOperatorSection(section);
  }
  return getComponentFromNumberSection(section);
}

export function getComponentFromNumberSection(section: string): RollComponent {
  return {
    type: RollComponentType.NUMBER,
    value: Number(section.trim()),
  };
}

export function getComponentFromOperatorSection(
  section: string
): RollComponent {
  return {
    type: RollComponentType.OPERATOR,
    value: section as Operator,
  };
}

export function getComponentFromSubstitutionSection(
  section: string,
  substitutionExpressions: SubstitutionExpressions
): RollComponent {
  const expressionName = section.slice(1);
  const substitutionData = substitutionExpressions[expressionName] || {
    expression: '',
  };
  const expression = getRollExpression(
    substitutionData.expression,
    substitutionExpressions
  );
  return simplifyComponentValue({
    type: RollComponentType.ROLL_EXPRESSION,
    value: expression,
    extraData: substitutionData.extraData,
  });
}

export function simplifyComponentValue(
  component: RollComponent
): RollComponent {
  if (component.type !== RollComponentType.ROLL_EXPRESSION) {
    return component;
  }
  const rollExpression = component.value;
  if (rollExpression.components.length > 1) {
    return component;
  }
  const childComponent = rollExpression.components[0];
  return {
    ...childComponent,
    extraData: component.extraData,
  };
}

export function getComponentFromParenthesesSection(
  section: string,
  substitutionExpressions?: SubstitutionExpressions
): RollExpressionComponent {
  const cleanExpression = section.substring(1, section.length - 1);
  return {
    type: RollComponentType.ROLL_EXPRESSION,
    value: getRollExpression(cleanExpression, substitutionExpressions),
  };
}

function isOperator(input: string) {
  return operators.includes(input);
}

function isLogicalOperator(input: string) {
  return logicalOperators.includes(input);
}

function isComparator(input: string) {
  return comparators.includes(input);
}

function isSubstitutionSection(input: string) {
  return input.startsWith("@");
}

export function separateOperators(input: string | undefined) {
  if (!input) {
    return [];
  }
  if (isParenthesesSection(input)) {
    return [input];
  }

  let result: string[] = [input];
  operators.forEach((operator) => {
    result = result
      .flatMap((section) => {
        return splitAndKeepInArray(section, operator);
      })
      .filter(Boolean);
  });
  return result;
}

export function splitAndKeepInArray(
  input: string,
  splitValue: string
): string[] {
  if (!input.includes(splitValue)) {
    return [input];
  }
  const splitIndex = input.indexOf(splitValue);
  return [
    input.substring(0, splitIndex),
    splitValue,
    ...splitAndKeepInArray(
      input.substring(splitIndex + splitValue.length),
      splitValue
    ),
  ]
    .map((section) => section.trim())
    .filter(Boolean);
}
