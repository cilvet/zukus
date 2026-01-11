import { SubstitutionExpressions } from "../../../../../rolls/expressionAnalysis/expressionAnalysis";
import { SubstitutionIndex } from "../../../sources/calculateSources";

export const mapSubstitutionDataToSubstitutionExpressions = (
  substitutionData: SubstitutionIndex
): SubstitutionExpressions => {
  const substitutionExpressions: SubstitutionExpressions = {};
  for (const key in substitutionData) {
    substitutionExpressions[key] = {
      expression: substitutionData[key].toString(),
    };
  }
  return substitutionExpressions;
};
