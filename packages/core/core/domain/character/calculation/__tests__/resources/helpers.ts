import { CalculatedResource } from "../../../baseData/resources";

/**
 * Verifies basic resource properties
 */
export function expectResourceExists(
    resources: Record<string, CalculatedResource>,
    resourceId: string,
    name: string
) {
    expect(resources[resourceId]).toBeDefined();
    expect(resources[resourceId].name).toBe(name);
}

/**
 * Verifies resource values
 */
export function expectResourceValues(
    resource: CalculatedResource,
    expected: {
        maxValue: number;
        currentValue: number;
        minValue?: number;
        defaultChargesPerUse?: number;
        rechargeAmount?: number;
    }
) {
    expect(resource.maxValue).toBe(expected.maxValue);
    expect(resource.currentValue).toBe(expected.currentValue);
    
    if (expected.minValue !== undefined) {
        expect(resource.minValue).toBe(expected.minValue);
    }
    
    if (expected.defaultChargesPerUse !== undefined) {
        expect(resource.defaultChargesPerUse).toBe(expected.defaultChargesPerUse);
    }
    
    if (expected.rechargeAmount !== undefined) {
        expect(resource.rechargeAmount).toBe(expected.rechargeAmount);
    }
}

/**
 * Verifies resource substitution values in character sheet
 */
export function expectResourceSubstitutionValues(
    substitutionValues: Record<string, number>,
    resourceId: string,
    expected: {
        max: number;
        current: number;
        min?: number;
        defaultChargesPerUse?: number;
        rechargeAmount?: number;
    }
) {
    expect(substitutionValues[`resources.${resourceId}.max`]).toBe(expected.max);
    expect(substitutionValues[`resources.${resourceId}.current`]).toBe(expected.current);
    
    if (expected.min !== undefined) {
        expect(substitutionValues[`resources.${resourceId}.min`]).toBe(expected.min);
    }
    
    if (expected.defaultChargesPerUse !== undefined) {
        expect(substitutionValues[`resources.${resourceId}.defaultChargesPerUse`]).toBe(expected.defaultChargesPerUse);
    }
    
    if (expected.rechargeAmount !== undefined) {
        expect(substitutionValues[`resources.${resourceId}.rechargeAmount`]).toBe(expected.rechargeAmount);
    }
}

/**
 * Verifies source tracking for a resource property
 */
export function expectSourceTracking(
    sources: any[],
    sourceUniqueId: string,
    expected: {
        value: number;
        bonusTypeId: string;
        relevant: boolean;
        sourceName?: string;
    }
) {
    const source = sources.find(s => s.sourceUniqueId === sourceUniqueId);
    expect(source).toBeDefined();
    expect(source!.value).toBe(expected.value);
    expect(source!.bonusTypeId).toBe(expected.bonusTypeId);
    expect(source!.relevant).toBe(expected.relevant);
    
    if (expected.sourceName) {
        expect(source!.sourceName).toBe(expected.sourceName);
    }
}
