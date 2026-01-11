import { CharacterUpdater } from "./characterUpdater";
import { buildCharacter } from "../../../../tests/character/buildCharacter";
import { ResourceDefinitionChange } from "../../baseData/specialChanges";
import { bard, fighter } from "../../../../../srd/classes";
import { featureTypes } from "../../baseData/features/feature";


/**
 * Ejemplo de usos diarios de Canción Bárdica
 */
const bardicMusicResource: ResourceDefinitionChange = {
    type: 'RESOURCE_DEFINITION',
    resourceId: 'bardic_music_uses',
    name: 'Bardic Music Uses',
    description: 'Daily uses of bardic music abilities',
    maxValueFormula: {
        expression: 'max(@class.bard.level, 1)'
    },
    defaultChargesPerUseFormula: {
        expression: '1'
    },
    rechargeFormula: {
        expression: 'max(@class.bard.level, 1)'
    }
};

/**
 * Ejemplo de Ki Pool para Monk
 */
const kiPoolResource: ResourceDefinitionChange = {
    type: 'RESOURCE_DEFINITION',
    resourceId: 'ki_pool',
    name: 'Ki Pool',
    description: 'Supernatural energy used for special abilities',
    maxValueFormula: {
        expression: 'floor(@class.monk.level / 2) + @ability.wisdom.modifier'
    },
    defaultChargesPerUseFormula: {
        expression: '1'
    },
    rechargeFormula: {
        expression: 'floor(@class.monk.level / 2) + @ability.wisdom.modifier'
    }
};

describe("CharacterUpdater - Resource Management", () => {
    let characterUpdater: CharacterUpdater | null = null;
    let baseCharacter: () => ReturnType<typeof buildCharacter>;

    beforeEach(() => {
        baseCharacter = () => buildCharacter()
            .withName("Test Bard")
            .withBaseAbilityScores({
                strength: 10,
                dexterity: 14,
                constitution: 12,
                intelligence: 13,
                wisdom: 11,
                charisma: 16
            })
            .withClassLevels(bard, 4) // Level 4 bard = 4 bardic music uses
            .withSpecialFeatures([
                {
                    uniqueId: "bardic_music",
                    title: "Bardic Music",
                    description: "Inspire allies with musical performances",
                    specialChanges: [bardicMusicResource]
                }
            ]);
    });

    afterEach(() => {
        if (characterUpdater) {
            characterUpdater = null;
        }
    });

    describe("consumeResource", () => {
        it("should consume resource with default charges per use (1)", () => {
            const character = baseCharacter().build();
            characterUpdater = new CharacterUpdater(character, []);

            // Initial state: should have 4 uses
            let sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(4);
            expect(sheet.resources["bardic_music_uses"].maxValue).toBe(4);

            // Consume 1 use (default)
            const result = characterUpdater.consumeResource("bardic_music_uses");
            expect(result.success).toBe(true);

            // Should have 3 uses left
            sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(3);
            expect(sheet.resources["bardic_music_uses"].maxValue).toBe(4);
        });

        it("should consume resource with custom amount", () => {
            const character = baseCharacter().build();
            characterUpdater = new CharacterUpdater(character, []);

            // Initial state: should have 4 uses
            let sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(4);

            // Consume 2 uses
            const result = characterUpdater.consumeResource("bardic_music_uses", 2);
            expect(result.success).toBe(true);

            // Should have 2 uses left
            sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(2);
        });

        it("should respect minimum value when consuming", () => {
            const character = baseCharacter().build();
            characterUpdater = new CharacterUpdater(character, []);

            // Consume more than available (should respect min value of 0)
            const result = characterUpdater.consumeResource("bardic_music_uses", 6);
            expect(result.success).toBe(true);

            // Should be at minimum value (0)
            const sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(0);
        });

        it("should return error when resource doesn't exist", () => {
            const character = baseCharacter().build();
            characterUpdater = new CharacterUpdater(character, []);

            const result = characterUpdater.consumeResource("nonexistent_resource");
            expect(result.success).toBe(false);
            if (result.success === false) {
                expect(result.error).toBe("Resource not found");
            }
        });

        it("should return error when character is not set", () => {
            characterUpdater = new CharacterUpdater(null, []);

            const result = characterUpdater.consumeResource("bardic_music_uses");
            expect(result.success).toBe(false);
            if (result.success === false) {
                expect(result.error).toBe("Character is not set");
            }
        });

        it("should handle consuming from already depleted resource", () => {
            const character = baseCharacter().build();
            // Start with depleted resource
            character.resourceCurrentValues = {
                "bardic_music_uses": { currentValue: 0 }
            };
            characterUpdater = new CharacterUpdater(character, []);

            // Try to consume from empty resource
            const result = characterUpdater.consumeResource("bardic_music_uses");
            expect(result.success).toBe(true);

            // Should stay at 0 (respects min value)
            const sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(0);
        });
    });

    describe("rechargeResource", () => {
        it("should recharge resource with default recharge amount", () => {
            const character = baseCharacter().build();
            // Start with used resources
            character.resourceCurrentValues = {
                "bardic_music_uses": { currentValue: 1 }
            };
            characterUpdater = new CharacterUpdater(character, []);

            // Initial state: should have 1 use
            let sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(1);

            // Recharge with default amount (should be 4 = full recharge)
            const result = characterUpdater.rechargeResource("bardic_music_uses");
            expect(result.success).toBe(true);

            // Should be back to max
            sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(4);
        });

        it("should recharge resource with custom amount", () => {
            const character = baseCharacter().build();
            // Start with used resources
            character.resourceCurrentValues = {
                "bardic_music_uses": { currentValue: 1 }
            };
            characterUpdater = new CharacterUpdater(character, []);

            // Recharge with partial amount (+2)
            const result = characterUpdater.rechargeResource("bardic_music_uses", 2);
            expect(result.success).toBe(true);

            // Should have 3 uses (1 + 2)
            const sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(3);
        });

        it("should respect maximum value when recharging", () => {
            const character = baseCharacter().build();
            // Start with some uses
            character.resourceCurrentValues = {
                "bardic_music_uses": { currentValue: 3 }
            };
            characterUpdater = new CharacterUpdater(character, []);

            // Try to recharge beyond max (+3, would give 6 but max is 4)
            const result = characterUpdater.rechargeResource("bardic_music_uses", 3);
            expect(result.success).toBe(true);

            // Should be capped at max value
            const sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(4);
        });

        it("should return error when resource doesn't exist", () => {
            const character = baseCharacter().build();
            characterUpdater = new CharacterUpdater(character, []);

            const result = characterUpdater.rechargeResource("nonexistent_resource");
            expect(result.success).toBe(false);
            if (result.success === false) {
                expect(result.error).toBe("Resource not found");
            }
        });

        it("should return error when character is not set", () => {
            characterUpdater = new CharacterUpdater(null, []);

            const result = characterUpdater.rechargeResource("bardic_music_uses");
            expect(result.success).toBe(false);
            if (result.success === false) {
                expect(result.error).toBe("Character is not set");
            }
        });

        it("should handle recharging already full resource", () => {
            const character = baseCharacter().build();
            characterUpdater = new CharacterUpdater(character, []);

            // Resource starts at max (4)
            let sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(4);

            // Try to recharge full resource
            const result = characterUpdater.rechargeResource("bardic_music_uses", 1);
            expect(result.success).toBe(true);

            // Should stay at max
            sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(4);
        });
    });

    describe("rechargeAllResources", () => {
        it("should recharge all resources to their maximum values", () => {
            // Create a simple ki pool for testing multiple resources
            const simplifiedKiPool = {
                ...kiPoolResource,
                maxValueFormula: {
                    expression: '2 + @ability.wisdom.modifier' // Simplified for testing
                },
                rechargeFormula: {
                    expression: '2 + @ability.wisdom.modifier'
                }
            };

            const character = buildCharacter()
                .withName("Multi-resource Character")
                .withBaseAbilityScores({
                    strength: 10,
                    dexterity: 14,
                    constitution: 12,
                    intelligence: 16,
                    wisdom: 15, // +2 modifier
                    charisma: 13
                })
                .withClassLevels(bard, 6) // Level 6 bard
                .withSpecialFeatures([
                    {
                        uniqueId: "bardic_music",
                        title: "Bardic Music",
                        description: "Inspire allies with musical performances",
                        specialChanges: [bardicMusicResource]
                    },
                    {
                        uniqueId: "ki_powers",
                        title: "Ki Powers",
                        description: "Supernatural abilities",
                        specialChanges: [simplifiedKiPool]
                    }
                ])
                .build();

            // Start with used resources
            character.resourceCurrentValues = {
                "bardic_music_uses": { currentValue: 2 }, // used 4 out of 6
                "ki_pool": { currentValue: 1 } // used 3 out of 4
            };

            characterUpdater = new CharacterUpdater(character, []);

            // Verify initial depleted state
            let sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(2);
            expect(sheet.resources["ki_pool"].currentValue).toBe(1);

            // Recharge all resources
            const result = characterUpdater.rechargeAllResources();
            expect(result.success).toBe(true);

            // All resources should be at max
            sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(6); // max(6, 1) = 6
            expect(sheet.resources["ki_pool"].currentValue).toBe(4); // 2 + 2 (wisdom) = 4
        });

        it("should return error when character is not set", () => {
            characterUpdater = new CharacterUpdater(null, []);

            const result = characterUpdater.rechargeAllResources();
            expect(result.success).toBe(false);
            if (result.success === false) {
                expect(result.error).toBe("Character is not set");
            }
        });

        it("should return error when no calculated resources found", () => {
            const characterWithoutResources = buildCharacter()
                .withName("No Resources Character")
                .withBaseAbilityScores({
                    strength: 10,
                    dexterity: 14,
                    constitution: 12,
                    intelligence: 13,
                    wisdom: 11,
                    charisma: 16
                })
                .withClassLevels(fighter, 2) // bard has a resource so we use fighter
                .build();

            characterUpdater = new CharacterUpdater(characterWithoutResources, []);

            const result = characterUpdater.rechargeAllResources();
            expect(result.success).toBe(false);
            if (result.success === false) {
                expect(result.error).toBe("No calculated resources found");
            }
        });

        it("should handle single resource recharge all", () => {
            const character = baseCharacter().build();
            // Start with used resource
            character.resourceCurrentValues = {
                "bardic_music_uses": { currentValue: 1 }
            };
            characterUpdater = new CharacterUpdater(character, []);

            // Verify depleted state
            let sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(1);

            // Recharge all (only one resource)
            const result = characterUpdater.rechargeAllResources();
            expect(result.success).toBe(true);

            // Should be back to max
            sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(4);
        });

        it("should preserve resources that are already at max", () => {
            const character = baseCharacter().build();
            characterUpdater = new CharacterUpdater(character, []);

            // Initial state: already at max
            let sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(4);

            // Recharge all
            const result = characterUpdater.rechargeAllResources();
            expect(result.success).toBe(true);

            // Should still be at max
            sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_uses"].currentValue).toBe(4);
        });
    });

    describe("Resource Management Integration", () => {
        it("should trigger character update notifications", () => {
            const character = baseCharacter().build();
            let notificationCount = 0;
            let lastSheet = null;
            let lastBaseData = null;

            const onUpdate = (sheet, baseData) => {
                notificationCount++;
                lastSheet = sheet;
                lastBaseData = baseData;
            };

            characterUpdater = new CharacterUpdater(character, [], onUpdate);

            // Reset counter after initial setup
            notificationCount = 0;

            // Consume resource - should trigger notification
            characterUpdater.consumeResource("bardic_music_uses");
            expect(notificationCount).toBe(1);
            expect(lastSheet).toBeTruthy();
            expect(lastBaseData).toBeTruthy();

            // Recharge resource - should trigger notification
            characterUpdater.rechargeResource("bardic_music_uses");
            expect(notificationCount).toBe(2);

            // Recharge all - should trigger notification
            characterUpdater.rechargeAllResources();
            expect(notificationCount).toBe(3);
        });

        it("should maintain resource current values in character base data", () => {
            const character = baseCharacter().build();
            characterUpdater = new CharacterUpdater(character, []);

            // Consume some resources
            characterUpdater.consumeResource("bardic_music_uses", 2);

            // Check that base data was updated
            const baseData = characterUpdater.getCharacterBaseData()!;
            expect(baseData.resourceCurrentValues).toBeDefined();
            expect(baseData.resourceCurrentValues!["bardic_music_uses"]).toBeDefined();
            expect(baseData.resourceCurrentValues!["bardic_music_uses"].currentValue).toBe(2);
        });

        it("should work with resources that have custom min values", () => {
            const resourceWithMinValue = {
                ...bardicMusicResource,
                resourceId: 'bardic_music_with_min',
                name: 'Bardic Music with Min',
                minValueFormula: {
                    expression: '1' // Can't go below 1
                }
            };

            const character = buildCharacter()
                .withName("Bard with Min Resource")
                .withBaseAbilityScores({
                    strength: 10,
                    dexterity: 14,
                    constitution: 12,
                    intelligence: 13,
                    wisdom: 11,
                    charisma: 16
                })
                .withClassLevels(bard, 3)
                .withSpecialFeatures([
                    {
                        uniqueId: "bardic_music_with_min",
                        title: "Bardic Music with Min",
                        description: "Can't be fully depleted",
                        specialChanges: [resourceWithMinValue]
                    }
                ])
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            // Try to consume all resources (should stop at min value)
            characterUpdater.consumeResource("bardic_music_with_min", 10);

            const sheet = characterUpdater.getCharacterSheet()!;
            expect(sheet.resources["bardic_music_with_min"].currentValue).toBe(1); // Should stop at min
            expect(sheet.resources["bardic_music_with_min"].minValue).toBe(1);
        });

        it("should handle resource with image field", () => {
            const bardicMusicWithImage = {
                ...bardicMusicResource,
                resourceId: 'bardic_music_with_image',
                name: 'Bardic Music with Image',
                image: '/images/resources/bardic-music.png'
            };

            const character = buildCharacter()
                .withName("Bard with Image Resource")
                .withBaseAbilityScores({
                    strength: 10,
                    dexterity: 14,
                    constitution: 12,
                    intelligence: 13,
                    wisdom: 11,
                    charisma: 16
                })
                .withClassLevels(bard, 3)
                .withSpecialFeatures([
                    {
                        uniqueId: "bardic_music_with_image",
                        title: "Bardic Music with Image",
                        description: "Bardic music with a custom image",
                        specialChanges: [bardicMusicWithImage]
                    }
                ])
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const sheet = characterUpdater.getCharacterSheet()!;

            // Should have the bardic music resource with image
            expect(sheet.resources["bardic_music_with_image"]).toBeDefined();

            const resource = sheet.resources["bardic_music_with_image"];
            expect(resource.name).toBe("Bardic Music with Image");
            expect(resource.image).toBe("/images/resources/bardic-music.png");
            expect(resource.maxValue).toBe(3);
            expect(resource.currentValue).toBe(3);
        });
    });
});

describe("CharacterUpdater - Rest Functionality", () => {
    let characterUpdater: CharacterUpdater | null = null;
    let baseCharacter: () => ReturnType<typeof buildCharacter>;

    beforeEach(() => {
        baseCharacter = () => buildCharacter()
            .withBaseAbilityScores({
                strength: 14,
                dexterity: 13,
                constitution: 16, // +3 modifier
                intelligence: 12,
                wisdom: 10,
                charisma: 8
            })
            .withCurrentLevel(5); // Level 5 character
    });

    afterEach(() => {
        characterUpdater = null;
    });

    describe("rest()", () => {
        it("should heal HP according to rest healing formula (level + constitution modifier) and recharge all resources", () => {
            // Create character with bardic music resource and some damage
            const character = baseCharacter()
                .withClassLevels(bard, 5)
                .withSpecialFeatures([
                    {
                        uniqueId: "bardic_music",
                        title: "Bardic Music",
                        description: "Bardic music abilities",
                        specialChanges: [bardicMusicResource]
                    }
                ])
                .withCurrentDamage(10) // Character has taken 10 damage
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            // Consume some bardic music uses
            const consumeResult = characterUpdater.consumeResource("bardic_music_uses", 3);
            expect(consumeResult.success).toBe(true);

            const sheetBeforeRest = characterUpdater.getCharacterSheet()!;
            const hpBeforeRest = sheetBeforeRest.hitPoints.currentHp;
            
            const restHealingAmount = sheetBeforeRest.substitutionValues?.["restHealingFormula"] ?? 0;
            
            // Verify resource was consumed
            expect(sheetBeforeRest.resources["bardic_music_uses"].currentValue).toBe(2); // 5 - 3 = 2

            // Use rest function
            const restResult = characterUpdater.rest();
            expect(restResult.success).toBe(true);

            const sheetAfterRest = characterUpdater.getCharacterSheet()!;
            
            // Check HP healing: should heal by restHealingFormula amount, but not exceed max HP
            const expectedHpAfterRest = Math.min(hpBeforeRest + restHealingAmount, sheetBeforeRest.hitPoints.maxHp);
            expect(sheetAfterRest.hitPoints.currentHp).toBe(expectedHpAfterRest);

            // Check that resource was recharged to maximum
            expect(sheetAfterRest.resources["bardic_music_uses"].currentValue).toBe(5);
        });

        it("should not exceed maximum HP when healing", () => {
            // Create character with minimal damage
            const character = baseCharacter()
                .withClassLevels(fighter, 3)
                .withCurrentDamage(2) // Only 2 damage, healing would exceed max HP
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const sheetBeforeRest = characterUpdater.getCharacterSheet()!;
            const maxHp = sheetBeforeRest.hitPoints.maxHp;
            const hpBeforeRest = sheetBeforeRest.hitPoints.currentHp;

            // Use rest function
            const restResult = characterUpdater.rest();
            expect(restResult.success).toBe(true);

            const sheetAfterRest = characterUpdater.getCharacterSheet()!;
            
            // HP should not exceed maximum
            expect(sheetAfterRest.hitPoints.currentHp).toBe(maxHp);
        });

        it("should return error when character is not set", () => {
            characterUpdater = new CharacterUpdater(null, []);
            
            const result = characterUpdater.rest();
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("Character is not set");
            }
        });
    });

    describe("Class Features Management", () => {
        it("should update a class feature at a specific level", () => {
            const character = buildCharacter()
                .withName("Test Fighter")
                .withClassLevels(fighter, 3)
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const testFeature = {
                uniqueId: "test_feature",
                name: "Test Feature",
                description: "Original description",
                featureType: featureTypes.CLASS_FEATURE as const,
                changes: [],
            };

            const addResult = characterUpdater.addClassFeature(testFeature);
            expect(addResult.success).toBe(true);

            const updatedFeature = {
                ...testFeature,
                description: "Updated description",
            };

            const result = characterUpdater.updateClassFeature(
                testFeature.uniqueId,
                updatedFeature
            );

            expect(result.success).toBe(true);

            const updatedCharacter = characterUpdater.getCharacterBaseData()!;
            const updatedFeatureInCharacter = updatedCharacter.level.levelsData
                .flatMap(ld => ld.levelClassFeatures)
                .find((f) => f.uniqueId === testFeature.uniqueId)!;

            expect(updatedFeatureInCharacter.description).toBe("Updated description");
        });

        it("should add a class feature to the first level", () => {
            const character = buildCharacter()
                .withName("Test Fighter")
                .withClassLevels(fighter, 3)
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const firstLevel = character.level.levelsData[0];
            const initialFeatureCount = firstLevel.levelClassFeatures.length;

            const newFeature = {
                uniqueId: "custom_feature",
                name: "Custom Feature",
                description: "A custom class feature",
                featureType: featureTypes.CLASS_FEATURE as const,
                changes: [],
            };

            const result = characterUpdater.addClassFeature(newFeature);

            expect(result.success).toBe(true);

            const updatedCharacter = characterUpdater.getCharacterBaseData()!;
            const updatedFirstLevel = updatedCharacter.level.levelsData[0];

            expect(updatedFirstLevel.levelClassFeatures.length).toBe(initialFeatureCount + 1);
            expect(updatedFirstLevel.levelClassFeatures.some(f => f.uniqueId === "custom_feature")).toBe(true);
        });

        it("should remove a class feature from a specific level", () => {
            const character = buildCharacter()
                .withName("Test Fighter")
                .withClassLevels(fighter, 3)
                .build();

            characterUpdater = new CharacterUpdater(character, []);
            
            const featureToRemove = {
                uniqueId: "removable_feature",
                name: "Removable Feature",
                description: "Will be removed",
                featureType: featureTypes.CLASS_FEATURE as const,
                changes: [],
            };

            const addResult = characterUpdater.addClassFeature(featureToRemove);
            expect(addResult.success).toBe(true);

            const characterAfterAdd = characterUpdater.getCharacterBaseData()!;
            const totalFeaturesAfterAdd = characterAfterAdd.level.levelsData
                .reduce((sum, ld) => sum + ld.levelClassFeatures.length, 0);

            const result = characterUpdater.removeClassFeature(featureToRemove.uniqueId);

            expect(result.success).toBe(true);

            const updatedCharacter = characterUpdater.getCharacterBaseData()!;
            const totalFeaturesAfterRemove = updatedCharacter.level.levelsData
                .reduce((sum, ld) => sum + ld.levelClassFeatures.length, 0);

            expect(totalFeaturesAfterRemove).toBe(totalFeaturesAfterAdd - 1);
            expect(
                updatedCharacter.level.levelsData
                    .flatMap(ld => ld.levelClassFeatures)
                    .some(f => f.uniqueId === featureToRemove.uniqueId)
            ).toBe(false);
        });

        it("should return error when updating non-existent class feature", () => {
            const character = buildCharacter()
                .withName("Test Fighter")
                .withClassLevels(fighter, 3)
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const fakeFeature = {
                uniqueId: "non_existent",
                name: "Non Existent",
                description: "Does not exist",
                featureType: featureTypes.CLASS_FEATURE as const,
            };

            const result = characterUpdater.updateClassFeature(
                "non_existent",
                fakeFeature
            );

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("not found");
            }
        });

        it("should return error when trying to add duplicate class feature", () => {
            const character = buildCharacter()
                .withName("Test Fighter")
                .withClassLevels(fighter, 3)
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const feature = {
                uniqueId: "test_feature",
                name: "Test Feature",
                description: "Test",
                featureType: featureTypes.CLASS_FEATURE as const,
                changes: [],
            };

            const firstAdd = characterUpdater.addClassFeature(feature);
            expect(firstAdd.success).toBe(true);

            const secondAdd = characterUpdater.addClassFeature(feature);

            expect(secondAdd.success).toBe(false);
            if (!secondAdd.success) {
                expect(secondAdd.error).toContain("already exists");
            }
        });
    });

    describe("Feats Management - Character Level", () => {
        it("should add a feat to character feats", () => {
            const character = buildCharacter()
                .withName("Test Character")
                .withClassLevels(fighter, 3)
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const initialFeatCount = character.feats.length;

            const newFeat = {
                uniqueId: "power_attack",
                name: "Power Attack",
                description: "Trade attack bonus for damage",
                featureType: featureTypes.FEAT as const,
                changes: [],
            };

            const result = characterUpdater.addFeat(newFeat);

            expect(result.success).toBe(true);

            const updatedCharacter = characterUpdater.getCharacterBaseData()!;
            expect(updatedCharacter.feats.length).toBe(initialFeatCount + 1);
            expect(updatedCharacter.feats.some(f => f.uniqueId === "power_attack")).toBe(true);
        });

        it("should update an existing feat", () => {
            const existingFeat = {
                uniqueId: "weapon_focus",
                name: "Weapon Focus",
                description: "Original description",
                featureType: featureTypes.FEAT as const,
                changes: [],
            };

            const character = buildCharacter()
                .withName("Test Character")
                .withClassLevels(fighter, 3)
                .withFeats([existingFeat])
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const updatedFeat = {
                ...existingFeat,
                description: "Updated description",
            };

            const result = characterUpdater.updateFeat("weapon_focus", updatedFeat);

            expect(result.success).toBe(true);

            const updatedCharacter = characterUpdater.getCharacterBaseData()!;
            const feat = updatedCharacter.feats.find(f => f.uniqueId === "weapon_focus")!;
            expect(feat.description).toBe("Updated description");
        });

        it("should remove a feat from character feats", () => {
            const featToRemove = {
                uniqueId: "dodge",
                name: "Dodge",
                description: "Gain +1 AC",
                featureType: featureTypes.FEAT as const,
                changes: [],
            };

            const character = buildCharacter()
                .withName("Test Character")
                .withClassLevels(fighter, 3)
                .withFeats([featToRemove])
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const initialFeatCount = character.feats.length;

            const result = characterUpdater.removeFeat("dodge");

            expect(result.success).toBe(true);

            const updatedCharacter = characterUpdater.getCharacterBaseData()!;
            expect(updatedCharacter.feats.length).toBe(initialFeatCount - 1);
            expect(updatedCharacter.feats.some(f => f.uniqueId === "dodge")).toBe(false);
        });

        it("should return error when adding duplicate feat", () => {
            const existingFeat = {
                uniqueId: "toughness",
                name: "Toughness",
                description: "Gain extra HP",
                featureType: featureTypes.FEAT as const,
                changes: [],
            };

            const character = buildCharacter()
                .withName("Test Character")
                .withClassLevels(fighter, 3)
                .withFeats([existingFeat])
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const result = characterUpdater.addFeat(existingFeat);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("already exists");
            }
        });

        it("should return error when removing non-existent feat", () => {
            const character = buildCharacter()
                .withName("Test Character")
                .withClassLevels(fighter, 3)
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const result = characterUpdater.removeFeat("non_existent_feat");

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("not found");
            }
        });
    });

    describe("Feats Management - Level Specific", () => {
        it("should add a feat to a specific level", () => {
            const character = buildCharacter()
                .withName("Test Character")
                .withClassLevels(fighter, 3)
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const levelData = character.level.levelsData[0];
            const initialFeatCount = levelData.levelFeats.length;

            const newFeat = {
                uniqueId: "cleave",
                name: "Cleave",
                description: "Make additional attack after dropping enemy",
                featureType: featureTypes.FEAT as const,
                changes: [],
            };

            const result = characterUpdater.addLevelFeat(levelData.level, newFeat);

            expect(result.success).toBe(true);

            const updatedCharacter = characterUpdater.getCharacterBaseData()!;
            const updatedLevelData = updatedCharacter.level.levelsData.find(
                ld => ld.level === levelData.level
            )!;

            expect(updatedLevelData.levelFeats.length).toBe(initialFeatCount + 1);
            expect(updatedLevelData.levelFeats.some(f => f.uniqueId === "cleave")).toBe(true);
        });

        it("should update a feat at a specific level", () => {
            const levelFeat = {
                uniqueId: "improved_initiative",
                name: "Improved Initiative",
                description: "Original description",
                featureType: featureTypes.FEAT as const,
                changes: [],
            };

            const character = buildCharacter()
                .withName("Test Character")
                .withClassLevels(fighter, 3)
                .build();

            character.level.levelsData[0].levelFeats.push(levelFeat);

            characterUpdater = new CharacterUpdater(character, []);

            const updatedFeat = {
                ...levelFeat,
                description: "Updated description",
            };

            const result = characterUpdater.updateLevelFeat(
                character.level.levelsData[0].level,
                "improved_initiative",
                updatedFeat
            );

            expect(result.success).toBe(true);

            const updatedCharacter = characterUpdater.getCharacterBaseData()!;
            const feat = updatedCharacter.level.levelsData[0].levelFeats.find(
                f => f.uniqueId === "improved_initiative"
            )!;
            expect(feat.description).toBe("Updated description");
        });

        it("should remove a feat from a specific level", () => {
            const levelFeat = {
                uniqueId: "combat_reflexes",
                name: "Combat Reflexes",
                description: "Make more attacks of opportunity",
                featureType: featureTypes.FEAT as const,
                changes: [],
            };

            const character = buildCharacter()
                .withName("Test Character")
                .withClassLevels(fighter, 3)
                .build();

            character.level.levelsData[0].levelFeats.push(levelFeat);

            characterUpdater = new CharacterUpdater(character, []);

            const initialFeatCount = character.level.levelsData[0].levelFeats.length;

            const result = characterUpdater.removeLevelFeat(
                character.level.levelsData[0].level,
                "combat_reflexes"
            );

            expect(result.success).toBe(true);

            const updatedCharacter = characterUpdater.getCharacterBaseData()!;
            const updatedLevelData = updatedCharacter.level.levelsData[0];
            expect(updatedLevelData.levelFeats.length).toBe(initialFeatCount - 1);
            expect(updatedLevelData.levelFeats.some(f => f.uniqueId === "combat_reflexes")).toBe(false);
        });

        it("should return error when level does not exist", () => {
            const character = buildCharacter()
                .withName("Test Character")
                .withClassLevels(fighter, 3)
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const newFeat = {
                uniqueId: "test_feat",
                name: "Test Feat",
                description: "Test",
                featureType: featureTypes.FEAT as const,
                changes: [],
            };

            const result = characterUpdater.addLevelFeat(99, newFeat);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("Level 99 not found");
            }
        });
    });

    describe("Special Features Management", () => {
        it("should add a special feature", () => {
            const character = buildCharacter()
                .withName("Test Character")
                .withClassLevels(fighter, 3)
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const initialFeatureCount = character.specialFeatures?.length || 0;

            const newFeature = {
                uniqueId: "dragon_breath",
                title: "Dragon Breath",
                description: "Breathe fire like a dragon",
                changes: [],
            };

            const result = characterUpdater.addSpecialFeature(newFeature);

            expect(result.success).toBe(true);

            const updatedCharacter = characterUpdater.getCharacterBaseData()!;
            expect(updatedCharacter.specialFeatures?.length).toBe(initialFeatureCount + 1);
            expect(updatedCharacter.specialFeatures?.some(f => f.uniqueId === "dragon_breath")).toBe(true);
        });

        it("should update a special feature", () => {
            const existingFeature = {
                uniqueId: "wild_shape",
                title: "Wild Shape",
                description: "Original description",
                changes: [],
            };

            const character = buildCharacter()
                .withName("Test Character")
                .withClassLevels(fighter, 3)
                .withSpecialFeatures([existingFeature])
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const updatedFeature = {
                ...existingFeature,
                description: "Updated description",
            };

            const result = characterUpdater.updateSpecialFeature("wild_shape", updatedFeature);

            expect(result.success).toBe(true);

            const updatedCharacter = characterUpdater.getCharacterBaseData()!;
            const feature = updatedCharacter.specialFeatures!.find(f => f.uniqueId === "wild_shape")!;
            expect(feature.description).toBe("Updated description");
        });

        it("should remove a special feature", () => {
            const featureToRemove = {
                uniqueId: "rage",
                title: "Rage",
                description: "Enter a berserker rage",
                changes: [],
            };

            const character = buildCharacter()
                .withName("Test Character")
                .withClassLevels(fighter, 3)
                .withSpecialFeatures([featureToRemove])
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const initialFeatureCount = character.specialFeatures!.length;

            const result = characterUpdater.removeSpecialFeature("rage");

            expect(result.success).toBe(true);

            const updatedCharacter = characterUpdater.getCharacterBaseData()!;
            expect(updatedCharacter.specialFeatures?.length).toBe(initialFeatureCount - 1);
            expect(updatedCharacter.specialFeatures?.some(f => f.uniqueId === "rage")).toBe(false);
        });

        it("should return error when adding duplicate special feature", () => {
            const existingFeature = {
                uniqueId: "smite_evil",
                title: "Smite Evil",
                description: "Deal extra damage to evil creatures",
                changes: [],
            };

            const character = buildCharacter()
                .withName("Test Character")
                .withClassLevels(fighter, 3)
                .withSpecialFeatures([existingFeature])
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const result = characterUpdater.addSpecialFeature(existingFeature);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("already exists");
            }
        });

        it("should return error when updating non-existent special feature", () => {
            const character = buildCharacter()
                .withName("Test Character")
                .withClassLevels(fighter, 3)
                .build();

            characterUpdater = new CharacterUpdater(character, []);

            const fakeFeature = {
                uniqueId: "non_existent",
                title: "Non Existent",
                description: "Does not exist",
                changes: [],
            };

            const result = characterUpdater.updateSpecialFeature("non_existent", fakeFeature);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("no special features");
            }
        });

        it("should return error when character is not set", () => {
            characterUpdater = new CharacterUpdater(null, []);

            const newFeature = {
                uniqueId: "test_feature",
                title: "Test Feature",
                description: "Test",
                changes: [],
            };

            const result = characterUpdater.addSpecialFeature(newFeature);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("Character is not set");
            }
        });
    });
});