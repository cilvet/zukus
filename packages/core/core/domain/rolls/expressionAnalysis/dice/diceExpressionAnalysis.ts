
import { RollComponent, RollComponentType, DiceExpression, DiceSelectorExpression, DiceSelectorType } from "../../DiceRoller/rollExpression";
import {
  SubstitutionExpressions,
  getComponentFromParenthesesSection,
} from "../expressionAnalysis";
import { isParenthesesSection } from "../parentheses/parenthesesExpressionAnalysis";

const findDiceExpression = new RegExp(/\d+d\d+/g);
const endsInIncompleteDiceExpression = new RegExp(/\)d\d[a-z0-9]*/);
const findDiceExpressionWithParenthesesSides = new RegExp(/\d+d\(/g);

export function getComponentFromComplexDiceExpression(
  section: string,
  substitutionExpressions?: SubstitutionExpressions
): RollComponent {
  const parenthesesSection = section.substring(0, section.indexOf(")") + 1);
  const parenthesesSectionComponent = getComponentFromParenthesesSection(
    parenthesesSection,
    substitutionExpressions
  );
  const diceExpressionSection = section.substring(
    section.indexOf(")") + 1,
    section.length
  );
  const only_dX_part = diceExpressionSection.match(/d\d+/)?.[0] as string;
  const onlyExtraCharacters = diceExpressionSection
    .trim()
    .substring(only_dX_part.length);
  const diceSelectorExpressions =
    getDiceSelectorExpressions(onlyExtraCharacters);
  const diceSides = Number(only_dX_part.slice(1));

  return {
    type: RollComponentType.DICE_EXPRESSION,
    value: {
      type: "complex",
      dice: { sides: diceSides },
      amount: parenthesesSectionComponent.value,
      ...(diceSelectorExpressions.length && {
        diceSelectorExpressions,
      }),
    },
  };
}

export function getComponentFromDiceSection(section: string): RollComponent {
  const diceValue = section.match(findDiceExpression)?.[0];
  if (!diceValue) {
    throw new Error("No dice expression found");
  }
  const numberValues = diceValue.split("d").map(Number);

  const onlyExtraCharacters = section.trim().substring(diceValue.length);
  const diceSelectorExpressions =
    getDiceSelectorExpressions(onlyExtraCharacters);

  const diceExpression: DiceExpression = {
    dice: { sides: numberValues[1] },
    type: "simple",
    amount: numberValues[0],
    ...(diceSelectorExpressions.length && {
      diceSelectorExpressions: diceSelectorExpressions,
    }),
  };
  return {
    type: RollComponentType.DICE_EXPRESSION,
    value: diceExpression,
  };
}

export function isDiceSection(input: string) {
  return Boolean(input.match(findDiceExpression));
}

export function isComplexDiceExpression(input: string) {
  return input.startsWith("(") && endsInIncompleteDiceExpression.test(input);
}

export function isDiceExpressionWithParenthesesSides(input: string) {
  return Boolean(input.match(findDiceExpressionWithParenthesesSides));
}

// example: (6)d(6)
export function isDiceExpressionWithBothSidesParentheses(input: string) {
  // Pattern: (X)d(Y) - parentheses on both sides
  const pattern = /^\([^)]+\)d\([^)]+\)$/;
  return Boolean(input.match(pattern));
}

export function getComponentFromDiceExpressionWithBothSidesParentheses(
  section: string,
  substitutionExpressions?: SubstitutionExpressions
): RollComponent {
  // Split the expression into parts: (amount)d(sides)
  const pattern = /^\(([^)]+)\)d\(([^)]+)\)(.*)$/;
  const match = section.match(pattern);
  
  if (!match) {
    throw new Error("Invalid dice expression with both sides parentheses");
  }
  
  const [, amountExpression, sidesExpression, diceSelectorPart] = match;
  
  // Process the amount expression
  const amountComponent = getComponentFromParenthesesSection(
    `(${amountExpression})`,
    substitutionExpressions
  );
  
  // Process the sides expression
  const sidesComponent = getComponentFromParenthesesSection(
    `(${sidesExpression})`,
    substitutionExpressions
  );
  
  // Try to evaluate the sides expression if it's a simple number
  let sidesValue = 6; // Default fallback
  try {
    // If the sides expression is just a number, use it
    if (sidesComponent.value.components.length === 1 && 
        sidesComponent.value.components[0].type === RollComponentType.NUMBER) {
      sidesValue = sidesComponent.value.components[0].value as number;
    }
  } catch (error) {
    console.warn(`Could not evaluate sides expression, using default: ${error}`);
  }
  
  // Get any dice selectors
  const diceSelectorExpressions = getDiceSelectorExpressions(diceSelectorPart);
  
  // Create a complex dice expression
  const diceExpression: DiceExpression = {
    type: "complex",
    amount: amountComponent.value,
    dice: { sides: sidesValue },
    ...(diceSelectorExpressions.length && {
      diceSelectorExpressions,
    }),
  };

  return {
    type: RollComponentType.DICE_EXPRESSION,
    value: diceExpression,
    extraData: {
      sidesExpression: sidesComponent.value
    }
  };
}

// example: 1d(6)
export function getComponentFromDiceExpressionWithParenthesesSides(
  section: string,
  substitutionExpressions?: SubstitutionExpressions
): RollComponent {
  const diceExpressionMatch = section.match(findDiceExpressionWithParenthesesSides)?.[0];
  if (!diceExpressionMatch) {
    throw new Error("No dice expression with parentheses sides found");
  }
  
  // Extract the amount (number before 'd')
  const amount = Number(diceExpressionMatch.replace('d(', ''));
  
  // Find the parentheses section that contains the sides
  const remainingSection = section.substring(diceExpressionMatch.length);
  const closingParenIndex = remainingSection.indexOf(')');
  if (closingParenIndex === -1) {
    throw new Error("No closing parenthesis found for dice sides");
  }
  
  const sidesExpression = remainingSection.substring(0, closingParenIndex);
  const sidesComponent = getComponentFromParenthesesSection(
    `(${sidesExpression})`,
    substitutionExpressions
  );
  
  // Get any remaining dice selectors after the parentheses
  const afterParentheses = remainingSection.substring(closingParenIndex + 1);
  const diceSelectorExpressions = getDiceSelectorExpressions(afterParentheses);
  
  // Try to evaluate the sides expression if it's a simple number
  let sidesValue = 6; // Default fallback
  try {
    // If the sides expression is just a number, use it
    if (sidesComponent.value.components.length === 1 && 
        sidesComponent.value.components[0].type === RollComponentType.NUMBER) {
      sidesValue = sidesComponent.value.components[0].value as number;
    }
  } catch (error) {
    // If evaluation fails, use default
    console.warn(`Could not evaluate sides expression, using default: ${error}`);
  }

  const diceExpression: DiceExpression = {
    type: "complex",
    amount: {
      components: [{
        type: RollComponentType.NUMBER,
        value: amount
      }],
      text: amount.toString()
    },
    dice: { sides: sidesValue },
    ...(diceSelectorExpressions.length && {
      diceSelectorExpressions,
    }),
  };

  // Store the sides expression in extraData so it can be used during rolling
  return {
    type: RollComponentType.DICE_EXPRESSION,
    value: diceExpression,
    extraData: {
      sidesExpression: sidesComponent.value
    }
  };
}

export function getDiceSelectorExpressions(input: string): DiceSelectorExpression[] {
    const diceSelectorExpressions: DiceSelectorExpression[] = [];
    let expression = input.slice().trim();
    // starts with any of kh|kl|dh|dl, followed by a number or nothing
    const matchSelector = /^(kh|kl|dh|dl)\d?/;
    function getSelectorType(selector: string) {
      switch (selector.slice(0, 2)) {
        case "kh":
          return DiceSelectorType.KEEP_HIGHER;
        case "kl":
          return DiceSelectorType.KEEP_LOWER;
        case "dh":
          return DiceSelectorType.DROP_HIGHER;
        case "dl":
          return DiceSelectorType.DROP_LOWER;
        default:
          throw new Error(
            `No dice selector type found for expression ${selector}`
          );
      }
    }
    while (expression) {
      const match = expression.match(matchSelector);
      if (!match) {
        throw new Error(`No dice selector found for expression ${expression}`);
      }
      const selector = match[0];
      const amount = Number(selector.slice(2)) || 1;
      const selectorType = getSelectorType(selector);
  
      diceSelectorExpressions.push({ type: selectorType, amount: amount });
      expression = expression.slice(selector.length);
    }
    return diceSelectorExpressions;
  }

export function joinDiceExpressionsWithParenthesesSides(
  input: string,
  index: number,
  array: string[]
): string | undefined {
  // Case 1: Handle "(X)d(Y)" pattern - if we find "(X)" followed by "d" followed by "(Y)"
  if (isParenthesesSection(input)) {
    const isLastItem = index >= array.length - 2;
    if (!isLastItem) {
      const nextItem = array[index + 1];
      const afterNextItem = array[index + 2];
      
      // Check if pattern is "(X)" + "d" + "(Y)"
      if (nextItem === "d" && afterNextItem && isParenthesesSection(afterNextItem)) {
        return input + nextItem + afterNextItem; // Join all three parts
      }
      
      // Check if previous item ends with "d" (for cases like "1d" + "(6)")
      const isFirstItem = index === 0;
      if (!isFirstItem) {
        const previousItem = array[index - 1];
        if (previousItem && previousItem.match(/\d+d$/)) {
          return undefined; // This will be filtered out
        }
      }
    }
  }
  
  // Case 2: Handle "d" operator between parentheses - mark for removal if part of pattern
  if (input === "d") {
    const isFirstOrLastItem = index === 0 || index >= array.length - 1;
    if (!isFirstOrLastItem) {
      const previousItem = array[index - 1];
      const nextItem = array[index + 1];
      
      // If "d" is between two parentheses sections, mark for removal
      if (previousItem && isParenthesesSection(previousItem) && 
          nextItem && isParenthesesSection(nextItem)) {
        return undefined; // This will be filtered out
      }
    }
  }
  
  // Case 3: Handle trailing parentheses that should be joined
  if (isParenthesesSection(input)) {
    const isFirstItem = index === 0;
    if (!isFirstItem) {
      const previousItem = array[index - 1];
      
      // Check for pattern where previous item is "d" and item before that is "(X)"
      if (previousItem === "d" && index >= 2) {
        const beforePreviousItem = array[index - 2];
        if (beforePreviousItem && isParenthesesSection(beforePreviousItem)) {
          return undefined; // This will be filtered out (already joined in Case 1)
        }
      }
      
      // Check if previous item ends with "d" (for cases like "1d" + "(6)")
      if (previousItem && previousItem.match(/\d+d$/)) {
        return undefined; // This will be filtered out
      }
    }
  }
  
  // Case 4: Handle incomplete dice expressions ending with "d"
  if (input.match(/\d+d$/)) {
    const isLastItem = index === array.length - 1;
    if (!isLastItem) {
      const nextItem = array[index + 1];
      if (nextItem && isParenthesesSection(nextItem)) {
        return input + nextItem;
      }
    }
  }
  
  return input;
}