import { RollComponentType, RollExpression } from "../rollExpression";

const {
  DICE_EXPRESSION,
  ROLL_EXPRESSION,
  FUNCTION,
  NUMBER,
  OPERATION,
  OPERATOR,
} = RollComponentType;

export const rollExpressionHasDice = (
  rollExpression: RollExpression
): boolean => {
  return rollExpression.components.some((component) => {
    if (component.type === OPERATION) {
      return (
        (component.value.firstOperand.type === ROLL_EXPRESSION &&
          rollExpressionHasDice(component.value.firstOperand.value)) ||
        (component.value.secondOperand.type === ROLL_EXPRESSION &&
          rollExpressionHasDice(component.value.secondOperand.value))
      );
    }
    if (component.type === DICE_EXPRESSION) {
      return true;
    }
    if (component.type === ROLL_EXPRESSION) {
      return rollExpressionHasDice(component.value);
    }
    return false;
  });
};