import { buildCharacter } from "../../../../tests/character/buildCharacter";
import {
  AbilityScoreChange,
  ChangeTypes,
} from "../../baseData/changes";
import { Source } from "../../calculatedSheet/sources";
import { mapAbilityScores } from "./calculateAbilityScores";

const strengthSourcePlus2: Source<AbilityScoreChange> = {
  abilityUniqueId: "strength",
  bonusTypeId: "ENHANCEMENT",
  formula: {
    expression: "2",
  },
  name: "Strength +2",
  type: 'ABILITY_SCORE',
  originId: "strengthSourcePlus2",
  originType: "other",
  totalValue: 2,
};

describe("calculateAbilityScore", () => {
  it("calculates character ability score correctly when no bonuses are added", () => {
    const character = buildCharacter()
      .withBaseAbilityScore("strength", 16)
      .build();
    const mappedAbilityScores = mapAbilityScores(character.baseAbilityData, []);
    expect(mappedAbilityScores.strength.totalScore).toEqual(16);
  });
  it("calculates character ability score correctly when bonuses are added", () => {
    const character = buildCharacter()
      .withBaseAbilityScore("strength", 16)
      .build();
    const mappedAbilityScores = mapAbilityScores(character.baseAbilityData, [
      strengthSourcePlus2,
    ]);
    expect(mappedAbilityScores.strength.totalScore).toEqual(18);
  });
  it("calculates character ability score correctly when ability drain is added", () => {
    const character = buildCharacter()
      .withBaseAbilityScore("strength", 16)
      .withAbilityDrain("strength", 10)
      .build();
    const mappedAbilityScores = mapAbilityScores(character.baseAbilityData, []);
    expect(mappedAbilityScores.strength.totalScore).toEqual(6);
  });
  it("calculates character ability score correctly when ability damage is added", () => {
    const character = buildCharacter()
      .withBaseAbilityScore("strength", 16)
      .withAbilityDamage("strength", 10)
      .build();
    const mappedAbilityScores = mapAbilityScores(character.baseAbilityData, []);
    expect(mappedAbilityScores.strength.totalScore).toEqual(6);
  });
  it("calculates character ability score correctly when ability penalty is added", () => {
    const character = buildCharacter()
      .withBaseAbilityScore("strength", 16)
      .withAbilityPenalty("strength", 10)
      .build();
    const mappedAbilityScores = mapAbilityScores(character.baseAbilityData, []);
    expect(mappedAbilityScores.strength.totalScore).toEqual(6);
  });
  it("calculates character ability score correctly when ability damage is added", () => {
    const character = buildCharacter()
      .withBaseAbilityScore("strength", 16)
      .withAbilityDamage("strength", 10)
      .build();
    const mappedAbilityScores = mapAbilityScores(character.baseAbilityData, []);
    expect(mappedAbilityScores.strength.totalScore).toEqual(6);
  });
  it("calculates character ability score correctly when ability penalty is added", () => {
    const character = buildCharacter()
      .withBaseAbilityScore("strength", 16)
      .withAbilityPenalty("strength", 10)
      .build();
    const mappedAbilityScores = mapAbilityScores(character.baseAbilityData, []);
    expect(mappedAbilityScores.strength.totalScore).toEqual(6);
  });
  it("calculates character ability score correctly when all ability penalties are added", () => {
    const character = buildCharacter()
      .withBaseAbilityScore("strength", 16)
      .withAbilityDrain("strength", 1)
      .withAbilityDamage("strength", 1)
      .withAbilityPenalty("strength", 1)
      .build();
    const mappedAbilityScores = mapAbilityScores(character.baseAbilityData, []);
    expect(mappedAbilityScores.strength.totalScore).toEqual(13);
  });
  it("calculates character ability score correctly when all ability penalties and a bonus are added", () => {
    const character = buildCharacter()
      .withBaseAbilityScore("strength", 16)
      .withAbilityDrain("strength", 1)
      .withAbilityDamage("strength", 1)
      .withAbilityPenalty("strength", 1)
      .build();
    const mappedAbilityScores = mapAbilityScores(character.baseAbilityData, [
      strengthSourcePlus2,
    ]);
    expect(mappedAbilityScores.strength.totalScore).toEqual(15);
  });
  it("minimum ability score is 0", () => {
    const character = buildCharacter()
      .withBaseAbilityScore("strength", 16)
      .withAbilityDrain("strength", 20)
      .build();
    const mappedAbilityScores = mapAbilityScores(character.baseAbilityData, []);
    expect(mappedAbilityScores.strength.totalScore).toEqual(0);
  });
});
