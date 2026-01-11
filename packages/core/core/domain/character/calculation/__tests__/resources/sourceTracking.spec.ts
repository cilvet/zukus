import { calculateCharacterSheet } from "../../calculateCharacterSheet";
import { buildCharacter } from "../../../../../tests/character/buildCharacter";
import { bard } from "../../../../../../srd/classes";
import { featureTypes } from "../../../baseData/features/feature";
import { bardicMusicResource, standardAbilityScores, createBaseBard } from "./fixtures";
import { expectResourceValues, expectSourceTracking } from "./helpers";

describe("Resource Source Tracking", () => {
    it("should provide detailed source tracking for resource max values", () => {
        const character = createBaseBard(4)
            .withSpecialFeatures([
                {
                    uniqueId: "bardic_music",
                    title: "Bardic Music",
                    description: "Inspire allies with musical performances",
                    specialChanges: [bardicMusicResource]
                },
                {
                    uniqueId: "extra_performance_feat",
                    title: "Extra Performance",
                    description: "Grants +2 bardic music uses per day",
                    changes: [
                        {
                            type: 'CUSTOM_VARIABLE',
                            uniqueId: 'resources.bardic_music_uses.max',
                            formula: { expression: '2' },
                            bonusTypeId: 'MORALE'
                        }
                    ]
                },
                {
                    uniqueId: "instrument_of_the_bards",
                    title: "Instrument of the Bards",
                    description: "Magical instrument grants +1 bardic music use",
                    changes: [
                        {
                            type: 'CUSTOM_VARIABLE',
                            uniqueId: 'resources.bardic_music_uses.max',
                            formula: { expression: '1' },
                            bonusTypeId: 'ENHANCEMENT'
                        }
                    ]
                }
            ])
            .build();

        const sheet = calculateCharacterSheet(character);
        const resource = sheet.resources["bardic_music_uses"];

        expect(resource.maxValue).toBe(7);
        expect(resource.maxValueSources).toHaveLength(3);

        expectSourceTracking(resource.maxValueSources, 'bardic_music_uses', {
            value: 4,
            bonusTypeId: 'BASE',
            relevant: true,
            sourceName: 'Bardic Music Uses max'
        });

        expectSourceTracking(resource.maxValueSources, 'extra_performance_feat', {
            value: 2,
            bonusTypeId: 'MORALE',
            relevant: true,
            sourceName: 'Extra Performance'
        });

        expectSourceTracking(resource.maxValueSources, 'instrument_of_the_bards', {
            value: 1,
            bonusTypeId: 'ENHANCEMENT',
            relevant: true,
            sourceName: 'Instrument of the Bards'
        });
    });

    it("should provide source tracking for all resource properties", () => {
        const character = createBaseBard(3)
            .withSpecialFeatures([
                {
                    uniqueId: "bardic_music",
                    title: "Bardic Music",
                    description: "Inspire allies with musical performances",
                    specialChanges: [bardicMusicResource]
                },
                {
                    uniqueId: "comprehensive_performance_training",
                    title: "Comprehensive Performance Training",
                    description: "Affects all aspects of bardic music",
                    changes: [
                        {
                            type: 'CUSTOM_VARIABLE',
                            uniqueId: 'resources.bardic_music_uses.max',
                            formula: { expression: '2' },
                            bonusTypeId: 'UNTYPED'
                        },
                        {
                            type: 'CUSTOM_VARIABLE',
                            uniqueId: 'resources.bardic_music_uses.min',
                            formula: { expression: '1' },
                            bonusTypeId: 'UNTYPED'
                        },
                        {
                            type: 'CUSTOM_VARIABLE',
                            uniqueId: 'resources.bardic_music_uses.defaultChargesPerUse',
                            formula: { expression: '0' },
                            bonusTypeId: 'UNTYPED'
                        }
                    ]
                }
            ])
            .build();

        const sheet = calculateCharacterSheet(character);
        const resource = sheet.resources["bardic_music_uses"];

        expect(resource.maxValueSources).toHaveLength(2);
        expectSourceTracking(resource.maxValueSources, 'comprehensive_performance_training', {
            value: 2,
            bonusTypeId: 'UNTYPED',
            relevant: true
        });

        expect(resource.minValueSources).toHaveLength(1);
        expectSourceTracking(resource.minValueSources, 'comprehensive_performance_training', {
            value: 1,
            bonusTypeId: 'UNTYPED',
            relevant: true
        });

        expect(resource.defaultChargesPerUseSources).toHaveLength(1);
        const chargesBaseSource = resource.defaultChargesPerUseSources.find(s => s.bonusTypeId === 'BASE');
        expect(chargesBaseSource).toBeDefined();
        expect(chargesBaseSource!.value).toBe(1);

        expectResourceValues(resource, {
            maxValue: 5,
            currentValue: 5,
            minValue: 1,
            defaultChargesPerUse: 1
        });
    });

    it("should show stacking rule effects in source tracking", () => {
        const character = createBaseBard(2)
            .withSpecialFeatures([
                {
                    uniqueId: "bardic_music",
                    title: "Bardic Music",
                    description: "Inspire allies with musical performances",
                    specialChanges: [bardicMusicResource]
                }
            ])
            .withFeats([
                {
                    uniqueId: "enhancement_item_1",
                    name: "Extra music",
                    description: "You get 2 extra uses of bardic music",
                    featureType: featureTypes.FEAT,
                    changes: [
                        {
                            type: 'CUSTOM_VARIABLE',
                            uniqueId: 'resources.bardic_music_uses.max',
                            formula: { expression: '2' },
                            bonusTypeId: 'ENHANCEMENT'
                        }
                    ]
                },
                {
                    uniqueId: "enhancement_item_2",
                    name: "Super extra music",
                    description: "You get 3 extra uses of bardic music",
                    featureType: featureTypes.FEAT,
                    changes: [
                        {
                            type: 'CUSTOM_VARIABLE',
                            uniqueId: 'resources.bardic_music_uses.max',
                            formula: { expression: '3' },
                            bonusTypeId: 'ENHANCEMENT'
                        }
                    ]
                }
            ])
            .build();

        const sheet = calculateCharacterSheet(character);
        const resource = sheet.resources["bardic_music_uses"];

        expect(resource.maxValue).toBe(5);
        expect(resource.maxValueSources).toHaveLength(3);

        const relevantSources = resource.maxValueSources.filter(s => s.relevant);
        const irrelevantSources = resource.maxValueSources.filter(s => !s.relevant);

        expect(relevantSources).toHaveLength(2);
        expect(irrelevantSources).toHaveLength(1);

        expectSourceTracking(resource.maxValueSources, 'enhancement_item_2', {
            value: 3,
            bonusTypeId: 'ENHANCEMENT',
            relevant: true
        });

        expectSourceTracking(resource.maxValueSources, 'enhancement_item_1', {
            value: 2,
            bonusTypeId: 'ENHANCEMENT',
            relevant: false
        });
    });

    it("should allow multiple bonuses to stack on resource max", () => {
        const character = createBaseBard(4)
            .withSpecialFeatures([
                {
                    uniqueId: "bardic_music",
                    title: "Bardic Music",
                    description: "Inspire allies with musical performances",
                    specialChanges: [bardicMusicResource]
                },
                {
                    uniqueId: "feat_bonus",
                    title: "Extra Performance Feat",
                    description: "Feat grants +3 bardic music uses",
                    changes: [
                        {
                            type: 'CUSTOM_VARIABLE',
                            uniqueId: 'resources.bardic_music_uses.max',
                            formula: { expression: '3' },
                            bonusTypeId: 'UNTYPED'
                        }
                    ]
                },
                {
                    uniqueId: "item_bonus",
                    title: "Performance Enhancing Item",
                    description: "Item grants +1 bardic music use",
                    changes: [
                        {
                            type: 'CUSTOM_VARIABLE',
                            uniqueId: 'resources.bardic_music_uses.max',
                            formula: { expression: '1' },
                            bonusTypeId: 'UNTYPED'
                        }
                    ]
                }
            ])
            .build();

        const sheet = calculateCharacterSheet(character);

        expectResourceValues(sheet.resources["bardic_music_uses"], {
            maxValue: 8,
            currentValue: 8
        });

        expect(sheet.resources["bardic_music_uses"].maxValueSources.length).toBeGreaterThan(1);
        expect(sheet.substitutionValues["resources.bardic_music_uses.max"]).toBe(8);
    });
});
