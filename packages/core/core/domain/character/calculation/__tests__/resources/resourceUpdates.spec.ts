import { calculateCharacterSheet } from "../../calculateCharacterSheet";
import { buildCharacter } from "../../../../../tests/character/buildCharacter";
import { bard } from "../../../../../../srd/classes";
import { advanceClassLevels } from "../../../update/updateLevel/advanceClassLevels";
import {
    bardicMusicResource,
    simplifiedKiPool,
    standardAbilityScores,
    createBaseBard
} from "./fixtures";
import { expectResourceValues, expectResourceSubstitutionValues } from "./helpers";

describe("Resource Management - Updates", () => {
    it("should consume resource with default charges per use", () => {
        const character = createBaseBard().build();

        let sheet = calculateCharacterSheet(character);
        expectResourceValues(sheet.resources["bardic_music_uses"], {
            currentValue: 4,
            maxValue: 4
        });

        character.resourceCurrentValues = {
            "bardic_music_uses": { currentValue: 3 }
        };

        sheet = calculateCharacterSheet(character);
        expectResourceValues(sheet.resources["bardic_music_uses"], {
            currentValue: 3,
            maxValue: 4
        });
    });

    it("should consume resource with custom amount", () => {
        const character = createBaseBard().build();

        character.resourceCurrentValues = {
            "bardic_music_uses": { currentValue: 2 }
        };

        const sheet = calculateCharacterSheet(character);
        expect(sheet.resources["bardic_music_uses"].currentValue).toBe(2);
    });

    it("should allow negative values when consuming more than available", () => {
        const character = createBaseBard().build();

        character.resourceCurrentValues = {
            "bardic_music_uses": { currentValue: -2 }
        };

        const sheet = calculateCharacterSheet(character);
        expectResourceValues(sheet.resources["bardic_music_uses"], {
            currentValue: -2,
            maxValue: 4
        });
    });

    it("should recharge resource with default recharge amount", () => {
        const character = createBaseBard().build();

        character.resourceCurrentValues = {
            "bardic_music_uses": { currentValue: 1 }
        };

        let sheet = calculateCharacterSheet(character);
        expect(sheet.resources["bardic_music_uses"].currentValue).toBe(1);

        character.resourceCurrentValues = {
            "bardic_music_uses": { currentValue: 4 }
        };

        sheet = calculateCharacterSheet(character);
        expect(sheet.resources["bardic_music_uses"].currentValue).toBe(4);
    });

    it("should recharge resource with partial amount", () => {
        const character = createBaseBard().build();

        character.resourceCurrentValues = {
            "bardic_music_uses": { currentValue: 1 }
        };

        let sheet = calculateCharacterSheet(character);
        expect(sheet.resources["bardic_music_uses"].currentValue).toBe(1);

        character.resourceCurrentValues = {
            "bardic_music_uses": { currentValue: 3 }
        };

        sheet = calculateCharacterSheet(character);
        expect(sheet.resources["bardic_music_uses"].currentValue).toBe(3);
    });

    it("should handle recharge beyond maximum (overheal)", () => {
        const character = createBaseBard().build();

        character.resourceCurrentValues = {
            "bardic_music_uses": { currentValue: 6 }
        };

        const sheet = calculateCharacterSheet(character);
        expectResourceValues(sheet.resources["bardic_music_uses"], {
            currentValue: 6,
            maxValue: 4
        });
    });

    it("should handle multiple resources independently", () => {
        const character = buildCharacter()
            .withName("Multi-resource Character")
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

        let sheet = calculateCharacterSheet(character);
        expect(sheet.resources["bardic_music_uses"].currentValue).toBe(6);
        expect(sheet.resources["ki_pool"].currentValue).toBe(4);

        character.resourceCurrentValues = {
            "bardic_music_uses": { currentValue: 3 }
        };

        sheet = calculateCharacterSheet(character);
        expect(sheet.resources["bardic_music_uses"].currentValue).toBe(3);
        expect(sheet.resources["ki_pool"].currentValue).toBe(4);

        character.resourceCurrentValues = {
            "bardic_music_uses": { currentValue: 6 },
            "ki_pool": { currentValue: 0 }
        };

        sheet = calculateCharacterSheet(character);
        expect(sheet.resources["bardic_music_uses"].currentValue).toBe(6);
        expect(sheet.resources["ki_pool"].currentValue).toBe(0);
    });

    it("should maintain resource calculations when max value changes due to level up", () => {
        const character = createBaseBard().build();

        character.resourceCurrentValues = {
            "bardic_music_uses": { currentValue: 2 }
        };

        let sheet = calculateCharacterSheet(character);
        expectResourceValues(sheet.resources["bardic_music_uses"], {
            maxValue: 4,
            currentValue: 2
        });

        advanceClassLevels(character, bard, 1, [1]);

        sheet = calculateCharacterSheet(character);
        expectResourceValues(sheet.resources["bardic_music_uses"], {
            maxValue: 5,
            currentValue: 2,
            rechargeAmount: 5
        });
    });

    it("should expose updated resource variables after resource consumption", () => {
        const character = createBaseBard().build();

        character.resourceCurrentValues = {
            "bardic_music_uses": { currentValue: 1 }
        };

        const sheet = calculateCharacterSheet(character);

        expectResourceSubstitutionValues(sheet.substitutionValues, "bardic_music_uses", {
            max: 4,
            current: 1,
            defaultChargesPerUse: 1,
            rechargeAmount: 4
        });
    });
});
