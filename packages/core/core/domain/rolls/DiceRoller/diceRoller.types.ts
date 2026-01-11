import { SubstitutionExpressions } from "../expressionAnalysis/expressionAnalysis";
import { ResolvedRollExpression, RollExpression } from "./rollExpression";

export interface DiceRoller {
  roll: (textInput: string, substitutionExpressions?: SubstitutionExpressions) => ResolvedRollExpression;
  getRollExpression: (textInput: string, substitutionExpressions?: SubstitutionExpressions) => RollExpression;
  resolveRollExpression: (rollExpression: RollExpression) => ResolvedRollExpression;
}
