import { bard, fighter } from "../../../../../srd/classes";
import { buildBuff } from "../../../../tests/buffs/buildBuff";
import { buildAbilitySkillChange, buildSkillChange } from "../../../../tests/changes/changeBuilder";
import { buildCharacter } from "../../../../tests/character/buildCharacter";
import {
  CalculatedParentSkill,
  CalculatedSingleSkill,
} from "../../calculatedSheet/calculatedSkills";
import { calculateCharacterSheet } from "../calculateCharacterSheet";

describe("calculateCharacterSheet - Skills", () => {
  it("calculates skill total bonus of level 1 fighter with three ranks in jump", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withSkillRanks("jump", 3)
      .build();
    const result = calculateCharacterSheet(character);
    expect((result.skills.jump as CalculatedSingleSkill).totalBonus).toEqual(
      3
    );
  });

  it("calculates skill total bonus of level 1 fighter with three ranks in jump and 16 strength", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withSkillRanks("jump", 3)
      .withBaseAbilityScore("strength", 16)
      .build();
    const result = calculateCharacterSheet(character);
    expect((result.skills.jump as CalculatedSingleSkill).totalBonus).toEqual(
      6
    );
  });

  it("calculates skill total bonus of level 1 fighter with three ranks in jump and 16 strength and jump buff", () => {
    const jumpChange = buildSkillChange("jump", "4");
    const jumpBuff = buildBuff().withChange(jumpChange).build();
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withSkillRanks("jump", 3)
      .withBaseAbilityScore("strength", 16)
      .withBuff(jumpBuff)
      .build();
    const result = calculateCharacterSheet(character);
    expect((result.skills.jump as CalculatedSingleSkill).totalBonus).toEqual(
      10
    );
  });

  it("calculates skills that use the same ability with ability change", () => {
    const strengthSkillChange = buildAbilitySkillChange("strength", "4");
    const jumpBuff = buildBuff().withChange(strengthSkillChange).build();
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBuff(jumpBuff)
      .build();
    const result = calculateCharacterSheet(character);
    expect((result.skills.jump as CalculatedSingleSkill).totalBonus).toEqual(
      4
    );
    expect((result.skills.climb as CalculatedSingleSkill).totalBonus).toEqual(
      4
    );
  });

  it("calculates parent skill well with ranks", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withSubSkills("perform", [
        {
          name: "Violin",
          abilityModifierUniqueId: "charisma",
          armorCheckPenalty: "none",
          trainedOnly: false,
          type: "simple",
          uniqueId: "perform_violin",
        },
      ])
      .withSkillRanks("perform_violin", 10)
      .build();
    const result = calculateCharacterSheet(character);
    const performViolinCalculatedSkill = (
      result.skills.perform as CalculatedParentSkill
    ).subSkills[0];
    expect(performViolinCalculatedSkill.totalBonus).toEqual(10);
  });

  it("calculates all subskills of parent skill well with ranks and ability skill changes", () => {
    const performChange = buildSkillChange("perform", "4");
    const performBuff = buildBuff().withChange(performChange).build();

    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBuff(performBuff)
      .withSubSkills("perform", [
        {
          name: "Violin",
          abilityModifierUniqueId: "charisma",
          armorCheckPenalty: "none",
          trainedOnly: false,
          type: "simple",
          uniqueId: "perform_violin",
        },
        {
          name: "Singing",
          abilityModifierUniqueId: "charisma",
          armorCheckPenalty: "none",
          trainedOnly: false,
          type: "simple",
          uniqueId: "perform_singing",
        },
      ])
      .withSkillRanks("perform_violin", 10)
      .build();
    const result = calculateCharacterSheet(character);
    const performViolinCalculatedSkill = (
      result.skills.perform as CalculatedParentSkill
    ).subSkills[0];
    const performSingingCalculatedSkill = (
      result.skills.perform as CalculatedParentSkill
    ).subSkills[1];
    expect(performViolinCalculatedSkill.totalBonus).toEqual(14);
    expect(performSingingCalculatedSkill.totalBonus).toEqual(4);
  });

  it("calculates all subskills of parent skill well with ability skill changes", () => {
    const charismaSkillsChange = buildAbilitySkillChange("charisma", "4");
    const performBuff = buildBuff().withChange(charismaSkillsChange).build();

    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBuff(performBuff)
      .withSubSkills("perform", [
        {
          name: "Violin",
          abilityModifierUniqueId: "charisma",
          armorCheckPenalty: "none",
          trainedOnly: false,
          type: "simple",
          uniqueId: "perform_violin",
        },
        {
          name: "Singing",
          abilityModifierUniqueId: "charisma",
          armorCheckPenalty: "none",
          trainedOnly: false,
          type: "simple",
          uniqueId: "perform_singing",
        },
      ])
      .build();
    const result = calculateCharacterSheet(character);
    const performViolinCalculatedSkill = (
      result.skills.perform as CalculatedParentSkill
    ).subSkills[0];
    const performSingingCalculatedSkill = (
      result.skills.perform as CalculatedParentSkill
    ).subSkills[1];
    const diplomacyCalculatedSkill = result.skills
      .diplomacy as CalculatedSingleSkill;
    expect(performViolinCalculatedSkill.totalBonus).toEqual(4);
    expect(performSingingCalculatedSkill.totalBonus).toEqual(4);
    expect(diplomacyCalculatedSkill.totalBonus).toEqual(4);
  });

  it("adds class skills of simple skills correctly", () => {
    const character = buildCharacter()
      .withClassLevels(bard, 1)
      .withSkillRanks("appraise", 3)
      .build();
    const result = calculateCharacterSheet(character);
    const performCalculatedSkill = result.skills
      .appraise as CalculatedSingleSkill;
    expect(performCalculatedSkill.isClassSkill).toEqual(true);
  });

  it("adds class skills correctly to subskills of parent skill", () => {
    const character = buildCharacter()
      .withClassLevels(bard, 1)
      .withSubSkills("perform", [
        {
          name: "Violin",
          abilityModifierUniqueId: "charisma",
          armorCheckPenalty: "none",
          trainedOnly: false,
          type: "simple",
          uniqueId: "perform_violin",
        },
      ])
      .build();
    const result = calculateCharacterSheet(character);
    const performViolinCalculatedSkill = (
      result.skills.perform as CalculatedParentSkill
    ).subSkills[0];
    expect(performViolinCalculatedSkill.isClassSkill).toEqual(true);
  });
}); 