import { SubstitutionExpressions } from "../../../rolls/expressionAnalysis/expressionAnalysis";
import { ResolvedContextualVariable } from "../../baseData/variable";
import { SubstitutionIndex } from "../sources/calculateSources";

export const getVariablesSubstitutionExpression = (
  variables: ResolvedContextualVariable[]
): SubstitutionExpressions => {
  const substitutionExpressions: SubstitutionExpressions = {};

  variables.forEach((variable) => {
    substitutionExpressions[variable.identifier] = {
      expression: variable.value.toString(),
    };
  });

  return substitutionExpressions;
};

export const getVariablesSubstitutionIndex = (
  variables: ResolvedContextualVariable[]
): SubstitutionIndex => {
  const substitutionIndex: SubstitutionIndex = {};

  variables.forEach((variable) => {
    substitutionIndex[variable.identifier] = variable.value;
  });

  return substitutionIndex;
};
