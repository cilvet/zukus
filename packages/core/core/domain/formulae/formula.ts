import { z } from "zod";
import { SubstitutionIndex } from "../character/calculation/sources/calculateSources";
import { RelationalOperatorsSchema } from "../character/baseData/conditions";

/**
 * FORMULA SYSTEM
 * 
 * Este sistema soporta dos tipos de fórmulas:
 * 
 * 1. NORMAL FORMULA (Fórmula Simple)
 *    - Expresión matemática básica con variables y dados
 *    - Uso: Bonos fijos, cálculos directos, damage rolls
 *    Ejemplo: { expression: "1d8 + @ability.strength.modifier" }
 * 
 * 2. SWITCH FORMULA (Fórmula Condicional)
 *    - Evalúa condiciones en orden y retorna el primer match
 *    - Soporta operadores: ==, !=, <, >, <=, >=
 *    - Casos comunes de uso:
 *      • Bonos que escalan por nivel: nivel >= 5 → +3, nivel >= 3 → +2
 *      • Daño variable por tamaño de arma: size == "medium" → 1d8
 *      • Habilidades que cambian por puntos: BAB > 10 → 3d6
 *      • Efectos que dependen de stats: STR >= 18 → "2d6", STR >= 14 → "1d6"
 * 
 *    Ejemplo básico:
 *    {
 *      type: "switch",
 *      switchExpression: "@level",
 *      cases: [
 *        { caseValue: "5", operator: ">=", resultExpression: "3" },
 *        { caseValue: "1", operator: ">=", resultExpression: "1" }
 *      ],
 *      defaultValue: "0"
 *    }
 * 
 *    Nota: También acepta formato legacy con objeto (se convierte automáticamente)
 */

// Define Zod schemas
export const ExtraExpressionDataSchema = z.object({
  expression: z.string(),
  extraData: z.record(z.any(), z.any()).optional(),
});

export const SubstitutionDataSchema = z.record(z.string(), ExtraExpressionDataSchema);

export const NormalFormulaSchema = z.object({
  type: z.literal("normal").optional(),
  expression: z.string(),
  substitutionData: SubstitutionDataSchema.optional(),
  extraData: z.record(z.any(), z.any()).optional(),
});

/**
 * A switch case with a comparison operator.
 * The case matches if: switchExpression [operator] caseValue evaluates to true
 */
export const SwitchCaseSchema = z.object({
  caseValue: z.string().describe("Value to compare against"),
  operator: RelationalOperatorsSchema.default("==").describe("Comparison operator, defaults to '=='"),
  resultExpression: z.string().describe("Expression to return if condition is met"),
});

/**
 * Transforms legacy object-based cases to array-based cases with operators.
 * Legacy format: { "key1": "value1", "key2": "value2" }
 * New format: [{ caseValue: "key1", operator: "==", resultExpression: "value1" }, ...]
 */
function transformLegacyCases(cases: unknown): SwitchCase[] {
  if (Array.isArray(cases)) {
    return cases;
  }
  
  if (typeof cases === 'object' && cases !== null) {
    return Object.entries(cases as Record<string, string>).map(([key, value]) => ({
      caseValue: key,
      operator: "==" as const,
      resultExpression: value,
    }));
  }
  
  return [];
}

/**
 * Switch formula: evaluates cases in order and returns the first matching result.
 * Each case compares the switchExpression against caseValue using the specified operator.
 * If no cases match, returns defaultValue.
 * 
 * Supports legacy format with object-based cases for backward compatibility.
 */
export const SwitchFormulaSchema = z.preprocess(
  (val) => {
    if (typeof val === 'object' && val !== null && 'cases' in val) {
      const formula = val as any;
      return {
        ...formula,
        cases: transformLegacyCases(formula.cases),
      };
    }
    return val;
  },
  z.object({
    type: z.literal("switch"),
    switchExpression: z.string(),
    cases: z.array(SwitchCaseSchema).describe("Array of cases evaluated in order, first matching case is used"),
    defaultValue: z.string(),
    substitutionData: SubstitutionDataSchema.optional(),
    extraData: z.record(z.any(), z.any()).optional(),
  })
);

export const FormulaSchema = z.union([
  SwitchFormulaSchema,
  NormalFormulaSchema,
  NormalFormulaSchema.omit({ type: true }),
]);

// Export types derived from schemas
export type ExtraExpressionData = z.infer<typeof ExtraExpressionDataSchema>;
export type SubstitutionData = z.infer<typeof SubstitutionDataSchema>;
export type NormalFormula = z.infer<typeof NormalFormulaSchema>;
export type SwitchCase = z.infer<typeof SwitchCaseSchema>;
export type SwitchFormula = z.infer<typeof SwitchFormulaSchema>;
export type Formula = z.infer<typeof FormulaSchema>;

/**
 * Type guard to check if a formula is a switch formula
 */
function isSwitchFormula(formula: unknown): formula is SwitchFormula {
  return typeof formula === 'object' && formula !== null && "type" in formula && (formula as any).type === "switch";
}

/**
 * Extracts custom variable dependencies from an expression string
 */
function extractDependenciesFromExpression(expression: string): string[] {
  const customVariableRegex = /@customVariable\.([a-zA-Z_][a-zA-Z0-9_\.]*)/g;
  const dependencies: string[] = [];
  let match;
  
  while ((match = customVariableRegex.exec(expression)) !== null) {
    const variableName = match[1];
    if (!dependencies.includes(variableName)) {
      dependencies.push(variableName);
    }
  }
  
  return dependencies;
}

/**
 * Extracts custom variable dependencies from a formula
 * For normal formulas: extracts from the expression
 * For switch formulas: extracts from switchExpression, all case values, and defaultValue
 */
export function extractCustomVariableDependencies(formula: unknown): string[] {
  if (isSwitchFormula(formula)) {
    return extractDependenciesFromSwitchFormula(formula);
  }
  
  if (typeof formula === 'object' && formula !== null && 'expression' in formula && typeof (formula as any).expression === 'string') {
    return extractDependenciesFromExpression((formula as any).expression);
  }
  
  return [];
}

function extractDependenciesFromSwitchFormula(formula: unknown): string[] {
  const dependencies: string[] = [];
  
  if (typeof formula !== 'object' || formula === null) {
    return dependencies;
  }
  
  const switchFormula = formula as any;
  
  if (typeof switchFormula.switchExpression === 'string') {
    const switchDependencies = extractDependenciesFromExpression(switchFormula.switchExpression);
    dependencies.push(...switchDependencies);
  }
  
  const cases = transformLegacyCases(switchFormula.cases);
  
  for (const switchCase of cases) {
    const caseValueDeps = extractDependenciesFromExpression(switchCase.caseValue);
    for (const dep of caseValueDeps) {
      if (!dependencies.includes(dep)) {
        dependencies.push(dep);
      }
    }
    
    const resultDeps = extractDependenciesFromExpression(switchCase.resultExpression);
    for (const dep of resultDeps) {
      if (!dependencies.includes(dep)) {
        dependencies.push(dep);
      }
    }
  }
  
  if (typeof switchFormula.defaultValue === 'string') {
    const defaultDependencies = extractDependenciesFromExpression(switchFormula.defaultValue);
    for (const dep of defaultDependencies) {
      if (!dependencies.includes(dep)) {
        dependencies.push(dep);
      }
    }
  }
  
  return dependencies;
}

export function substituteExpression(
  expression: string,
  substitutionIndex: SubstitutionIndex
): string {
  return expression.replace(/@([a-zA-Z0-9._-]+)/g, (match, key) => {
    const value = substitutionIndex[key];
    if (value === undefined) {
      return "0";
    }
    return value.toString();
  });
}

/**
 * Fills a formula with values from the substitution index
 * For normal formulas: substitutes variables in the expression
 * For switch formulas: evaluates the switch expression and returns the corresponding case expression
 */
export function fillFormulaWithValues(
  formula: unknown,
  substitutionIndex: SubstitutionIndex
): string {
  if (isSwitchFormula(formula)) {
    return fillSwitchFormula(formula, substitutionIndex);
  }
  
  return fillNormalFormula(formula, substitutionIndex);
}

function fillNormalFormula(
  formula: unknown,
  substitutionIndex: SubstitutionIndex
): string {
  if (typeof formula === 'object' && formula !== null && 'expression' in formula && typeof (formula as any).expression === 'string') {
    return substituteExpression((formula as any).expression, substitutionIndex);
  }
  return '0';
}

function fillSwitchFormula(
  formula: unknown,
  substitutionIndex: SubstitutionIndex
): string {
  if (typeof formula !== 'object' || formula === null) {
    return '0';
  }
  
  const switchFormula = formula as any;
  
  const evaluatedSwitchValue = substituteExpression(
    switchFormula.switchExpression || '',
    substitutionIndex
  );

  const cases = transformLegacyCases(switchFormula.cases);

  for (const switchCase of cases) {
    const evaluatedCaseValue = substituteExpression(
      switchCase.caseValue,
      substitutionIndex
    );
    
    const conditionMet = evaluateComparison(
      evaluatedSwitchValue,
      switchCase.operator,
      evaluatedCaseValue
    );
    
    if (conditionMet) {
      return switchCase.resultExpression;
    }
  }
  
  return switchFormula.defaultValue || '0';
}

function evaluateComparison(
  leftValue: string,
  operator: string,
  rightValue: string
): boolean {
  const left = parseFloat(leftValue);
  const right = parseFloat(rightValue);
  
  const leftIsNumber = !isNaN(left);
  const rightIsNumber = !isNaN(right);
  
  if (leftIsNumber && rightIsNumber) {
    switch (operator) {
      case "==":
        return left === right;
      case "!=":
        return left !== right;
      case "<":
        return left < right;
      case ">":
        return left > right;
      case "<=":
        return left <= right;
      case ">=":
        return left >= right;
      default:
        return false;
    }
  }
  
  switch (operator) {
    case "==":
      return leftValue === rightValue;
    case "!=":
      return leftValue !== rightValue;
    default:
      return false;
  }
}



// formula for a sword dealing 1d6 fire damage on top of 1d4 slashing damage
const swordDamageFormula: Formula = {
  expression: "@slashDamage + @fireDamage",
  substitutionData: {
    slashDamage: {
      expression: "1d4",
    },
    fireDamage: {
      expression: "1d6",
      extraData: {
        damageType: "fire",
      },
    },
  },
};

// formula for a bonus to a saving throw
// the value here resolves to floor(11/3) = 3
const savingThrowBonusFormula: Formula = {
  expression: "floor(@levels.class.barbarian/3)",
  substitutionData: {
    "levels.class.barbarian": {
      expression: "11",
    },
  },
};

// formula switch example: damage based on weapon size
const weaponDamageBySize: SwitchFormula = {
  type: "switch",
  switchExpression: "@weapon.size",
  cases: [
    { caseValue: "1", operator: "==", resultExpression: "1d3" },
    { caseValue: "2", operator: "==", resultExpression: "1d4" },
    { caseValue: "3", operator: "==", resultExpression: "1d6" },
    { caseValue: "4", operator: "==", resultExpression: "1d8" },
    { caseValue: "5", operator: "==", resultExpression: "2d6" },
  ],
  defaultValue: "1d4",
  substitutionData: {
    "weapon.size": {
      expression: "3",
    },
  },
};

// formula switch example with comparison operators: bonus based on character level
// This will return "2" because level (4) >= 3 matches first
const levelBasedBonus: SwitchFormula = {
  type: "switch",
  switchExpression: "@level",
  cases: [
    { caseValue: "5", operator: ">=", resultExpression: "3" },
    { caseValue: "3", operator: ">=", resultExpression: "2" },
    { caseValue: "1", operator: ">=", resultExpression: "1" },
  ],
  defaultValue: "0",
  substitutionData: {
    "level": {
      expression: "4",
    },
  },
};

// formula switch example with multiple operators: damage scaling
const damageScaling: SwitchFormula = {
  type: "switch",
  switchExpression: "@bab.total",
  cases: [
    { caseValue: "10", operator: ">", resultExpression: "3d6" },   // BAB > 10: 3d6
    { caseValue: "10", operator: "==", resultExpression: "2d6" },  // BAB == 10: 2d6
    { caseValue: "5", operator: ">=", resultExpression: "1d6" },   // BAB >= 5: 1d6
  ],
  defaultValue: "1d4",  // BAB < 5: 1d4
};
