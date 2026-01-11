import { calculateCharacterSheet } from "../../calculateCharacterSheet";
import { buildCharacter } from "../../../../../tests/character/buildCharacter";
import { bard } from "../../../../../../srd/classes";
import { bardicMusicResource, standardAbilityScores, createBaseBard } from "./fixtures";
import { expectResourceValues } from "./helpers";

describe("Resource Custom Variables", () => {
    it("should allow bonuses to resource max values through custom variables", () => {
        const character = buildCharacter()
            .withName("Bard with Bonus Uses")
            .withBaseAbilityScores(standardAbilityScores)
            .withClassLevels(bard, 3)
            .withSpecialFeatures([
                {
                    uniqueId: "bardic_music",
                    title: "Bardic Music",
                    description: "Inspire allies with musical performances",
                    specialChanges: [bardicMusicResource]
                },
                {
                    uniqueId: "extra_bardic_uses",
                    title: "Extra Bardic Uses",
                    description: "Grants +2 additional bardic music uses",
                    changes: [
                        {
                            type: 'CUSTOM_VARIABLE',
                            uniqueId: 'resources.bardic_music_uses.max',
                            formula: { expression: '2' },
                            bonusTypeId: 'UNTYPED'
                        }
                    ]
                }
            ])
            .build();

        const sheet = calculateCharacterSheet(character);
        const resource = sheet.resources["bardic_music_uses"];
        
        expectResourceValues(resource, {
            maxValue: 5,
            currentValue: 5,
            rechargeAmount: 3
        });

        expect(sheet.substitutionValues["resources.bardic_music_uses.max"]).toBe(5);
    });

    it("should allow bonuses to resource min values", () => {
        const character = buildCharacter()
            .withName("Bard with Min Bonus")
            .withBaseAbilityScores(standardAbilityScores)
            .withClassLevels(bard, 2)
            .withSpecialFeatures([
                {
                    uniqueId: "bardic_music",
                    title: "Bardic Music",
                    description: "Inspire allies with musical performances",
                    specialChanges: [bardicMusicResource]
                },
                {
                    uniqueId: "min_bardic_uses",
                    title: "Minimum Bardic Uses",
                    description: "Always have at least 1 use, even when depleted",
                    changes: [
                        {
                            type: 'CUSTOM_VARIABLE',
                            uniqueId: 'resources.bardic_music_uses.min',
                            formula: { expression: '1' },
                            bonusTypeId: 'UNTYPED'
                        }
                    ]
                }
            ])
            .build();

        const sheet = calculateCharacterSheet(character);

        expectResourceValues(sheet.resources["bardic_music_uses"], {
            maxValue: 2,
            minValue: 1,
            currentValue: 2
        });

        expect(sheet.substitutionValues["resources.bardic_music_uses.min"]).toBe(1);
    });

    it("should expose resource properties as custom variables with appropriate names", () => {
        const character = createBaseBard(3).build();
        const sheet = calculateCharacterSheet(character);

        const resourceVariables = sheet.customVariables.filter(
            cv => cv.uniqueId.startsWith('resources.bardic_music_uses')
        );

        expect(resourceVariables.length).toBe(5);

        const maxVariable = sheet.customVariables.find(
            cv => cv.uniqueId === 'resources.bardic_music_uses.max'
        );
        expect(maxVariable).toBeDefined();
        expect(maxVariable!.name).toBe('Bardic Music Uses - Max');
        expect(maxVariable!.description).toBe('Maximum value for Bardic Music Uses');
        expect(maxVariable!.totalValue).toBe(3);
        expect(maxVariable!.sources.length).toBeGreaterThan(0);

        const minVariable = sheet.customVariables.find(
            cv => cv.uniqueId === 'resources.bardic_music_uses.min'
        );
        expect(minVariable).toBeDefined();
        expect(minVariable!.name).toBe('Bardic Music Uses - Min');
        expect(minVariable!.description).toBe('Minimum value for Bardic Music Uses');

        const currentVariable = sheet.customVariables.find(
            cv => cv.uniqueId === 'resources.bardic_music_uses.current'
        );
        expect(currentVariable).toBeDefined();
        expect(currentVariable!.name).toBe('Bardic Music Uses - Current');
        expect(currentVariable!.description).toBe('Current value for Bardic Music Uses');
        expect(currentVariable!.totalValue).toBe(3);

        const chargesVariable = sheet.customVariables.find(
            cv => cv.uniqueId === 'resources.bardic_music_uses.defaultChargesPerUse'
        );
        expect(chargesVariable).toBeDefined();
        expect(chargesVariable!.name).toBe('Bardic Music Uses - Default Charges Per Use');

        const rechargeVariable = sheet.customVariables.find(
            cv => cv.uniqueId === 'resources.bardic_music_uses.rechargeAmount'
        );
        expect(rechargeVariable).toBeDefined();
        expect(rechargeVariable!.name).toBe('Bardic Music Uses - Recharge Amount');
        expect(rechargeVariable!.totalValue).toBe(3);
    });

    it("should reflect changes to resource properties in custom variables when bonuses are applied", () => {
        const character = buildCharacter()
            .withName("Enhanced Bard")
            .withBaseAbilityScores(standardAbilityScores)
            .withClassLevels(bard, 5)
            .withSpecialFeatures([
                {
                    uniqueId: "bardic_music",
                    title: "Bardic Music",
                    description: "Inspire allies with musical performances",
                    specialChanges: [bardicMusicResource]
                },
                {
                    uniqueId: "enhanced_performance",
                    title: "Enhanced Performance",
                    description: "Increases bardic music uses and minimum",
                    changes: [
                        {
                            type: 'CUSTOM_VARIABLE',
                            uniqueId: 'resources.bardic_music_uses.max',
                            bonusTypeId: 'UNTYPED',
                            formula: { expression: '3' }
                        },
                        {
                            type: 'CUSTOM_VARIABLE',
                            uniqueId: 'resources.bardic_music_uses.min',
                            bonusTypeId: 'UNTYPED',
                            formula: { expression: '2' }
                        }
                    ]
                }
            ])
            .build();

        const sheet = calculateCharacterSheet(character);
        const resource = sheet.resources["bardic_music_uses"];

        expectResourceValues(resource, {
            maxValue: 8,
            minValue: 2,
            currentValue: 8
        });

        const maxVariable = sheet.customVariables.find(
            cv => cv.uniqueId === 'resources.bardic_music_uses.max'
        );
        expect(maxVariable).toBeDefined();
        expect(maxVariable!.totalValue).toBe(8);
        expect(maxVariable!.sources.length).toBeGreaterThan(0);

        const minVariable = sheet.customVariables.find(
            cv => cv.uniqueId === 'resources.bardic_music_uses.min'
        );
        expect(minVariable).toBeDefined();
        expect(minVariable!.totalValue).toBe(2);
        expect(minVariable!.sources.length).toBeGreaterThan(0);

        expect(sheet.substitutionValues['resources.bardic_music_uses.max']).toBe(8);
        expect(sheet.substitutionValues['resources.bardic_music_uses.min']).toBe(2);

        const currentVariable = sheet.customVariables.find(
            cv => cv.uniqueId === 'resources.bardic_music_uses.current'
        );
        expect(currentVariable).toBeDefined();
        expect(currentVariable!.totalValue).toBe(8);

        const resourceVariables = sheet.customVariables.filter(
            cv => cv.uniqueId.startsWith('resources.bardic_music_uses')
        );
        expect(resourceVariables.length).toBe(5);
    });

    it("should support switch formulas that depend on other custom variables", () => {
        const character = buildCharacter()
            .withName("Character with Switch Formula")
            .withBaseAbilityScores(standardAbilityScores)
            .withClassLevels(bard, 3)
            .withSpecialFeatures([
                {
                    uniqueId: "combat_style_selector",
                    title: "Combat Style Selector",
                    description: "Defines which combat style is active",
                    changes: [
                        {
                            type: 'CUSTOM_VARIABLE',
                            uniqueId: 'combat.style',
                            formula: { expression: '2' },
                            bonusTypeId: 'UNTYPED'
                        }
                    ]
                },
                {
                    uniqueId: "style_damage_bonus",
                    title: "Style Damage Bonus",
                    description: "Damage bonus that varies by style: 1=Power (+4), 2=Finesse (+2), 3=Defensive (+1)",
                    changes: [
                        {
                            type: 'CUSTOM_VARIABLE',
                            uniqueId: 'combat.damageBonus',
                            formula: {
                                type: 'switch',
                                switchExpression: '@customVariable.combat.style',
                                cases: [
                                    { caseValue: '1', operator: '==', resultExpression: '4' },
                                    { caseValue: '2', operator: '==', resultExpression: '2' },
                                    { caseValue: '3', operator: '==', resultExpression: '1' }
                                ],
                                defaultValue: '0'
                            },
                            bonusTypeId: 'UNTYPED'
                        }
                    ]
                }
            ])
            .build();

        const sheet = calculateCharacterSheet(character);

        const styleVariable = sheet.customVariables.find(
            cv => cv.uniqueId === 'combat.style'
        );
        expect(styleVariable).toBeDefined();
        expect(styleVariable!.totalValue).toBe(2);

        const damageBonusVariable = sheet.customVariables.find(
            cv => cv.uniqueId === 'combat.damageBonus'
        );
        expect(damageBonusVariable).toBeDefined();
        expect(damageBonusVariable!.totalValue).toBe(2);

        expect(sheet.substitutionValues['customVariable.combat.style']).toBe(2);
        expect(sheet.substitutionValues['customVariable.combat.damageBonus']).toBe(2);
    });

    it("should support legacy switch formula format (object-based cases) for backward compatibility", () => {
        const character = buildCharacter()
            .withName("Character with Legacy Switch Formula")
            .withBaseAbilityScores(standardAbilityScores)
            .withClassLevels(bard, 3)
            .withSpecialFeatures([
                {
                    uniqueId: "combat_style_selector",
                    title: "Combat Style Selector",
                    description: "Defines which combat style is active",
                    changes: [
                        {
                            type: 'CUSTOM_VARIABLE',
                            uniqueId: 'combat.style',
                            formula: { expression: '2' },
                            bonusTypeId: 'UNTYPED'
                        }
                    ]
                },
                {
                    uniqueId: "legacy_style_damage_bonus",
                    title: "Legacy Style Damage Bonus",
                    description: "Damage bonus using legacy object format",
                    changes: [
                        {
                            type: 'CUSTOM_VARIABLE',
                            uniqueId: 'combat.legacyDamageBonus',
                            formula: {
                                type: 'switch',
                                switchExpression: '@customVariable.combat.style',
                                cases: {
                                    '1': '4',
                                    '2': '2',
                                    '3': '1'
                                },
                                defaultValue: '0'
                            } as any,
                            bonusTypeId: 'UNTYPED'
                        }
                    ]
                }
            ])
            .build();

        const sheet = calculateCharacterSheet(character);

        const styleVariable = sheet.customVariables.find(
            cv => cv.uniqueId === 'combat.style'
        );
        expect(styleVariable).toBeDefined();
        expect(styleVariable!.totalValue).toBe(2);

        const damageBonusVariable = sheet.customVariables.find(
            cv => cv.uniqueId === 'combat.legacyDamageBonus'
        );
        expect(damageBonusVariable).toBeDefined();
        expect(damageBonusVariable!.totalValue).toBe(2);

        expect(sheet.substitutionValues['customVariable.combat.style']).toBe(2);
        expect(sheet.substitutionValues['customVariable.combat.legacyDamageBonus']).toBe(2);
    });
});
