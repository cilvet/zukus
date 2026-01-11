import { buildCharacter } from "../../../../tests/character/buildCharacter";
import {
  ChangeTypes, InitiativeChange,
  Source
} from "../../baseData/changes";

const initiativeSourcePlus2: Source<InitiativeChange> = {
  bonusTypeId: "ENHANCEMENT",
  formula: {
    expression: "2",
  },
  name: "Initiative +2",
  type: 'INITIATIVE',
  originId: "initiativeSourcePlus2",
  originType: "other",
  totalValue: 2,
};

describe("calculateInitiative", () => {
  it("calculates character ability score correctly when no bonuses are added", () => {
    const character = buildCharacter()
      .withBaseAbilityScore("strength", 16)
      .build();
    // const mappedAbilityScores = calculateInitiative(character.baseAbilityData, []);
    // expect(mappedAbilityScores.strength.totalScore).toEqual(16);
  });
});
