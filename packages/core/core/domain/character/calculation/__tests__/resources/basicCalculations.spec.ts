import { calculateCharacterSheet } from "../../calculateCharacterSheet";
import { buildCharacter } from "../../../../../tests/character/buildCharacter";
import { bard } from "../../../../../../srd/classes";
import {
    bardicMusicResource,
    simplifiedKiPool,
    standardAbilityScores,
    createBaseBard
} from "./fixtures";
import {
    expectResourceExists,
    expectResourceValues,
    expectResourceSubstitutionValues
} from "./helpers";

describe("Resource Calculations - Basic", () => {
    it("should calculate bardic music uses from bard level", () => {
        const character = createBaseBard(5).build();
        const sheet = calculateCharacterSheet(character);

        expectResourceExists(sheet.resources, "bardic_music_uses", "Bardic Music Uses");

        const resource = sheet.resources["bardic_music_uses"];
        expectResourceValues(resource, {
            maxValue: 5,
            currentValue: 5,
            minValue: 0,
            defaultChargesPerUse: 1,
            rechargeAmount: 5
        });

        expect(resource.maxValueSources).toHaveLength(1);
        expect(resource.maxValueSources[0].relevant).toBe(true);
    });

    it("should expose resource variables in substitution index", () => {
        const character = createBaseBard(3).build();
        const sheet = calculateCharacterSheet(character);

        expectResourceSubstitutionValues(sheet.substitutionValues, "bardic_music_uses", {
            max: 3,
            current: 3,
            min: 0,
            defaultChargesPerUse: 1,
            rechargeAmount: 3
        });
    });

    it("should handle multiple different resources", () => {
        const character = buildCharacter()
            .withName("Multi-class Character")
            .withBaseAbilityScores({
                ...standardAbilityScores,
                intelligence: 16,
                wisdom: 15
            })
            .withClassLevels(bard, 6)
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

        const sheet = calculateCharacterSheet(character);

        expect(Object.keys(sheet.resources)).toHaveLength(2);
        expectResourceExists(sheet.resources, "bardic_music_uses", "Bardic Music Uses");
        expectResourceExists(sheet.resources, "ki_pool", "Ki Pool");

        expect(sheet.resources["bardic_music_uses"].maxValue).toBe(6);
        expect(sheet.resources["ki_pool"].maxValue).toBe(4);
    });

    it("should handle resources with persistent current values", () => {
        const character = createBaseBard(4).build();

        character.resourceCurrentValues = {
            "bardic_music_uses": {
                currentValue: 2
            }
        };

        const sheet = calculateCharacterSheet(character);

        expectResourceValues(sheet.resources["bardic_music_uses"], {
            maxValue: 4,
            currentValue: 2
        });
    });

    it("should handle resources with custom initial values", () => {
        const customBardicResource = {
            ...bardicMusicResource,
            resourceId: 'custom_bardic_music',
            name: 'Custom Bardic Music',
            initialValueFormula: {
                expression: '1'
            }
        };

        const character = buildCharacter()
            .withName("Custom Bard")
            .withBaseAbilityScores(standardAbilityScores)
            .withClassLevels(bard, 3)
            .withSpecialFeatures([
                {
                    uniqueId: "custom_bardic_music",
                    title: "Custom Bardic Music",
                    description: "Custom bardic music with limited initial uses",
                    specialChanges: [customBardicResource]
                }
            ])
            .build();

        const sheet = calculateCharacterSheet(character);

        expectResourceValues(sheet.resources["custom_bardic_music"], {
            maxValue: 3,
            currentValue: 1
        });
    });
});
