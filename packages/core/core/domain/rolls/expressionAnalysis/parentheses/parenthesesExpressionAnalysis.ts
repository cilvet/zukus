import { separateByEnclosingCharacters } from "../utils/expressionAnalysisUtils";

export function separateExpressionParentheses(input: string): string[] {
  return separateByEnclosingCharacters(input, "(", ")");
}

export function isParenthesesSection(input: string) {
  return input.startsWith("(") && input.endsWith(")");
}
