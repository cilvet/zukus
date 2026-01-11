import { DamageType } from "../../../../damage/damageTypes";
import { Formula } from "../../../../formulae/formula";
import { MockDiceRoller } from "../../../../rolls/DiceRoller/MockDiceRoller";
import { applyTransformationToDiceInExpression } from "../../../../rolls/DiceRoller/diceModifications/applyDiceModifications";
import { DiceRoller } from "../../../../rolls/DiceRoller/diceRoller.types";
import {
  DiceRollComponent,
  DiceRolledData,
  RollComponentType,
  RollExpression,
} from "../../../../rolls/DiceRoller/rollExpression";
import { getAllDiceFromResolvedExpression } from "../../../../rolls/DiceRoller/utils/getAllDiceFromResolvedExpression";
import { Dice } from "../../../../rolls/dice";
import { SubstitutionExpressions } from "../../../../rolls/expressionAnalysis/expressionAnalysis";
import {
  ComplexDamageSection,
  DamageFormula,
  DamageModification,
  DamageSection,
  SimpleDamageSection,
  SimpleDamageSectionWithType,
} from "../../../calculatedSheet/attacks/damage/damageFormula";
import {
  DamageResult,
  DamageSectionResult,
  DamageTypeResult,
} from "../../../calculatedSheet/attacks/damage/damageResult";
import { getDamageTypeId } from "./damageTypeId/getDamageTypeId";

const diceRoller = new MockDiceRoller();
const { roll, mockAllDiceRollsTo } = diceRoller;
mockAllDiceRollsTo(1);

function getTotalDamageFromDamageSectionResults(
  damageSectionResults: DamageSectionResult[]
): number {
  return damageSectionResults.reduce(
    (acc: number, section: DamageSectionResult) => acc + section.totalDamage,
    0
  );
}

function getDiceResultsFromDamageSectionResults(
  damageSectionResults: DamageSectionResult[]
): DiceRolledData[] {
  return damageSectionResults.reduce(
    (acc: DiceRolledData[], section: DamageSectionResult) => [
      ...acc,
      ...(section.diceResults ?? []),
    ],
    []
  );
}

function getDamageTypeResultsFromDamageSectionResults(
  damageSectionResults: DamageSectionResult[]
): DamageTypeResult[] {
  return damageSectionResults.reduce(
    (acc: DamageTypeResult[], section: DamageSectionResult) => [
      ...acc,
      ...section.damageTypeResults,
    ],
    []
  );
}

function getInheritedDamageTypeResults(
  damageSectionResults: DamageSectionResult[],
  damageType: DamageType
): DamageTypeResult[] {
  return damageSectionResults.reduce(
    (acc: DamageTypeResult[], section: DamageSectionResult) => {
      let result = [...acc];
      if (
        section.inheritedTypeDamage &&
        section.damageTypeResults.length === 0
      ) {
        result.push({
          damageTypeId: getDamageTypeId(damageType),
          damageType,
          totalDamage: section.inheritedTypeDamage,
        });
      }
      return result;
    },
    []
  );
}

export function getBaseDamageType(
  baseDamage: SimpleDamageSectionWithType | ComplexDamageSection
): DamageType {
  if (baseDamage.type === "simple") {
    return baseDamage.damageType;
  }
  return getBaseDamageType(baseDamage.baseDamage);
}

export function calculateDamage(
  damageFormula: DamageFormula,
  diceRoller: DiceRoller,
  substitutionExpressions?: SubstitutionExpressions,
  extractHalfAndHalfDamageTypes: boolean = true
): DamageResult {
  const damageSectionResult = calculateDamageSection(
    damageFormula,
    diceRoller,
    substitutionExpressions
  );

  const unifiedDamageTypeResults = unifyDamageTypeResults(
    extractHalfAndHalfDamageTypes
      ? extractHalfAndHalfDamageTypeResults(
          damageSectionResult.damageTypeResults
        )
      : damageSectionResult.damageTypeResults
  );

  if (damageFormula.type === "simple") {
    return {
      totalDamage: damageSectionResult.totalDamage,
      damageSections: [damageSectionResult],
      damageTypeResults: unifiedDamageTypeResults,
    };
  }

  return {
    totalDamage: damageSectionResult.totalDamage,
    damageSections: damageSectionResult.damageSectionResults ?? [],
    damageTypeResults: unifiedDamageTypeResults,
  };
}

function sectionResultHasDice(damageSection: DamageSectionResult): boolean {
  return Boolean(damageSection.diceResults?.length);
}

function multiplyNonDiceDamage(
  damageSectionResult: DamageSectionResult,
  multiplier: number
): DamageSectionResult {
  let result = { ...damageSectionResult };
  if (!sectionResultHasDice(damageSectionResult)) {
    result = {
      ...result,
      totalDamage: result.totalDamage * multiplier,
      appliedDamageModifications: [
        ...(result.appliedDamageModifications ?? []),
        {
          type: "multiplyNonDiceDamage",
          multiplier: multiplier,
        },
      ],
    };
  }
  return result;
}

export function applyDiceModifications(
  rollExpression: RollExpression,
  damageModifications: DamageModification[]
): RollExpression {
  let result = rollExpression;
  damageModifications.forEach((modification) => {
    if (modification.type === "replaceDice") {
      result = applyTransformationToDiceInExpression(
        result,
        getDiceTypeTransformation(
          { sides: modification.originalDiceSides },
          { sides: modification.newDiceSides }
        )
      );
    }
  });
  return result;
}

export function transformDiceType(
  oldDice: Dice,
  newDice: Dice,
  component: DiceRollComponent
): DiceRollComponent {
  if (component.value.dice.sides === oldDice.sides) {
    return {
      ...component,
      value: {
        ...component.value,
        dice: newDice,
      },
    };
  }
  return component;
}

export function getDiceTypeTransformation(oldDice: Dice, newDice: Dice) {
  return (component: DiceRollComponent) =>
    transformDiceType(oldDice, newDice, component);
}

function applyDamageModifications(
  damageSectionResult: DamageSectionResult,
  damageModifications: DamageModification[]
): DamageSectionResult {
  let result = damageSectionResult;
  damageModifications.forEach((modification) => {
    if (modification.type === "multiplyAllDamage") {
      result = {
        ...result,
        totalDamage: Math.floor(result.totalDamage * modification.multiplier),
        appliedDamageModifications: [
          ...(result.appliedDamageModifications ?? []),
          modification,
        ],
        ...(result.inheritedTypeDamage && {
          inheritedTypeDamage: Math.floor(
            result.inheritedTypeDamage * modification.multiplier
          ),
        }),
      };
      return;
    }
    if (modification.type === "multiplyNonDiceDamage") {
      result = multiplyNonDiceDamage(result, modification.multiplier);
    }
  });
  return result;
}

function calculateComplexDamageSection(
  section: ComplexDamageSection,
  diceRoller: DiceRoller,
  substitutionExpressions?: SubstitutionExpressions
): DamageSectionResult {
  const baseDamageSectionResult = calculateDamage(
    section.baseDamage,
    diceRoller,
    undefined,
    false
  );
  const additionalDamageSectionResults = section.additionalDamageSections.map(
    (section: DamageSection) =>
      calculateDamageSection(section, diceRoller, substitutionExpressions)
  );
  const totalDamageWithoutModifiers =
    baseDamageSectionResult.totalDamage +
    getTotalDamageFromDamageSectionResults(additionalDamageSectionResults);
  const damageTypeResults = unifyDamageTypeResults([
    ...baseDamageSectionResult.damageTypeResults,
    ...getDamageTypeResultsFromDamageSectionResults(
      additionalDamageSectionResults
    ),
    ...getInheritedDamageTypeResults(
      additionalDamageSectionResults,
      getBaseDamageType(section)
    ),
  ]);
  const diceResults = [
    ...getDiceResultsFromDamageSectionResults(
      baseDamageSectionResult.damageSections
    ),
    ...getDiceResultsFromDamageSectionResults(additionalDamageSectionResults),
  ];
  const unmodifiedResult: DamageSectionResult = {
    name: section.name,
    originalExpression: [
      ...baseDamageSectionResult.damageSections,
      ...additionalDamageSectionResults,
    ]
      .map((section) => section.originalExpression)
      .join(" + "),
    totalDamage: totalDamageWithoutModifiers,
    damageTypeResults,
    diceResults,
    ...(!damageTypeResults.length && {
      inheritedTypeDamage: totalDamageWithoutModifiers,
    }),
    damageSectionResults: [
      ...baseDamageSectionResult.damageSections,
      ...additionalDamageSectionResults,
    ],
  };
  return applyDamageModifications(
    unmodifiedResult,
    section.damageModifications ?? []
  );
}

function extractHalfAndHalfDamageTypeResults(
  damageTypeResults: DamageTypeResult[]
): DamageTypeResult[] {
  const newResults: DamageTypeResult[] = [];
  const unifiedDamageTypeResults = unifyDamageTypeResults(damageTypeResults);
  unifiedDamageTypeResults.forEach((damageTypeResult) => {
    const { damageType, totalDamage } = damageTypeResult;
    if (damageType.type === "halfAndHalf") {
      const firstDamage = Math.ceil(totalDamage / 2);
      const secondDamage = totalDamage - firstDamage;
      newResults.push({
        damageTypeId: damageType.firstDamageType,
        damageType: {
          type: "basic",
          damageType: damageType.firstDamageType,
        },
        totalDamage: firstDamage,
      });
      newResults.push({
        damageTypeId: damageType.secondDamageType,
        damageType: {
          type: "basic",
          damageType: damageType.secondDamageType,
        },
        totalDamage: secondDamage,
      });
      return;
    }
    newResults.push(damageTypeResult);
  });
  return newResults;
}

function unifyDamageTypeResults(
  damageTypeResults: DamageTypeResult[]
): DamageTypeResult[] {
  const damageTypeResultsMap = new Map<string, DamageTypeResult>();
  damageTypeResults.forEach((damageTypeResult) => {
    const { damageTypeId, damageType, totalDamage } = damageTypeResult;
    const existingDamageTypeResult = damageTypeResultsMap.get(damageTypeId);
    if (existingDamageTypeResult) {
      damageTypeResultsMap.set(damageTypeId, {
        damageTypeId,
        damageType,
        totalDamage: existingDamageTypeResult.totalDamage + totalDamage,
      });
    } else {
      damageTypeResultsMap.set(damageTypeId, damageTypeResult);
    }
  });
  return Array.from(damageTypeResultsMap.values());
}

function calculateSimpleDamageSection(
  section: SimpleDamageSection,
  diceRoller: DiceRoller,
  substitutionExpressions?: SubstitutionExpressions
): DamageSectionResult {
  const substitutionData = getSpecificFormulaSubstitutionExpressions(
    substitutionExpressions,
    section.formula
  );
  const originalRollExpression = diceRoller.getRollExpression(
    (section.formula as any).expression || "", // TODO: fix this
    substitutionData
  );

  const rollExpression = applyDiceModifications(
    originalRollExpression,
    section.damageModifications ?? []
  );
  const resolvedExpression = diceRoller.resolveRollExpression(rollExpression);
  const { result } = resolvedExpression;

  const damageTypeResults: DamageTypeResult[] = [];
  let totalDamage = result;
  if (section.damageType) {
    damageTypeResults.push({
      damageTypeId: getDamageTypeId(section.damageType),
      damageType: section.damageType,
      totalDamage,
    });
  }
  const diceResults = getAllDiceFromResolvedExpression(resolvedExpression);
  const unmodifiedResult: DamageSectionResult = {
    name: section.name,
    originalExpression: (section.formula as any).expression || "", // TODO: fix this
    totalDamage,
    damageTypeResults,
    ...(diceResults.length && { diceResults }),
    ...(!damageTypeResults.length && { inheritedTypeDamage: totalDamage }),
  };
  return applyDamageModifications(
    unmodifiedResult,
    section.damageModifications ?? []
  );
}

function getSpecificFormulaSubstitutionExpressions(
  substitutionExpressions: SubstitutionExpressions | undefined,
  formula: Formula
): SubstitutionExpressions {
  return {
    ...substitutionExpressions,
    ...formula.substitutionData,
  };
}

function calculateDamageSection(
  damageSection: DamageSection,
  diceRoller: DiceRoller,
  substitutionExpressions?: SubstitutionExpressions
): DamageSectionResult {
  if (damageSection.type === "simple") {
    return calculateSimpleDamageSection(
      damageSection,
      diceRoller,
      substitutionExpressions
    );
  }
  return calculateComplexDamageSection(
    damageSection,
    diceRoller,
    substitutionExpressions
  );
}
