import { DiceRollComponent, RollComponent, RollComponentType, RollExpression } from "../rollExpression";


export function applyTransformationToDiceInExpression(
  rollExpression: RollExpression,
  transformation: (dice: DiceRollComponent) => DiceRollComponent
): RollExpression {
    return {
        ...rollExpression,
        components: rollExpression.components.map((component) =>
        applyTransformationToDiceInComponent(component, transformation)
        ),
    };
}

export function applyTransformationToDiceInComponent(
  component: RollComponent,
  transformation: (dice: DiceRollComponent) => DiceRollComponent
): RollComponent {
  if (component.type === RollComponentType.DICE_EXPRESSION) {
    return transformation(component);
  }
  if(component.type === RollComponentType.OPERATION){
    return {
        ...component,
        value: {
            operator: component.value.operator,
            firstOperand: applyTransformationToDiceInComponent(component.value.firstOperand, transformation),
            secondOperand: applyTransformationToDiceInComponent(component.value.secondOperand, transformation),
        }
    }
  }
  if(component.type === RollComponentType.ROLL_EXPRESSION){
    return {
        ...component,
        value: applyTransformationToDiceInExpression(component.value, transformation),
    }
  }

  return component;
}
