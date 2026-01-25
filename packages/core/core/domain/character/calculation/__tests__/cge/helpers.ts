import { expect } from "bun:test";
import { CalculatedCGE, CalculatedSlot, CalculatedKnownLimit } from "../../../../cge/types";

/**
 * Verifica que un CGE existe en el sheet
 */
export function expectCGEExists(
  cge: Record<string, CalculatedCGE>,
  cgeId: string,
  classId: string
) {
  expect(cge[cgeId]).toBeDefined();
  expect(cge[cgeId].classId).toBe(classId);
}

/**
 * Verifica los slots de un CGE
 */
export function expectCGESlots(
  cge: CalculatedCGE,
  expectedSlots: Array<{ level: number; max: number; current?: number }>
) {
  const track = cge.tracks.find(t => t.resourceType === 'SLOTS');
  expect(track).toBeDefined();
  expect(track?.slots).toBeDefined();

  for (const expected of expectedSlots) {
    const slot = track?.slots?.find(s => s.level === expected.level);
    expect(slot).toBeDefined();
    expect(slot?.max).toBe(expected.max);
    if (expected.current !== undefined) {
      expect(slot?.current).toBe(expected.current);
    }
  }
}

/**
 * Verifica los limites de conocidos de un CGE
 */
export function expectCGEKnownLimits(
  cge: CalculatedCGE,
  expectedLimits: Array<{ level: number; max: number }>
) {
  expect(cge.knownLimits).toBeDefined();

  for (const expected of expectedLimits) {
    const limit = cge.knownLimits?.find(l => l.level === expected.level);
    expect(limit).toBeDefined();
    expect(limit?.max).toBe(expected.max);
  }
}

/**
 * Verifica que las variables de slots estan expuestas en substitutionValues
 */
export function expectCGESlotVariables(
  substitutionValues: Record<string, number>,
  classPrefix: string,
  expectedSlots: Array<{ level: number; max: number }>
) {
  for (const expected of expectedSlots) {
    const key = `${classPrefix}.slot.${expected.level}.max`;
    expect(substitutionValues[key]).toBe(expected.max);
  }
}

/**
 * Verifica que las variables de conocidos estan expuestas en substitutionValues
 */
export function expectCGEKnownVariables(
  substitutionValues: Record<string, number>,
  classPrefix: string,
  expectedLimits: Array<{ level: number; max: number }>
) {
  for (const expected of expectedLimits) {
    const key = `${classPrefix}.known.${expected.level}.max`;
    expect(substitutionValues[key]).toBe(expected.max);
  }
}
