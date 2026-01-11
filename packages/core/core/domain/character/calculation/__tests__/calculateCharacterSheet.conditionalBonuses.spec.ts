import { fighter } from "../../../../../srd/classes";
import { buildBuff } from "../../../../tests/buffs/buildBuff";
import { buildACChange } from "../../../../tests/changes/changeBuilder";
import { buildCharacter } from "../../../../tests/character/buildCharacter";
import { ArmorClassChange } from "../../baseData/changes";
import { calculateCharacterSheet } from "../calculateCharacterSheet";
import { valueIndexKeys } from "../valuesIndex/valuesIndex";

describe("calculateCharacterSheet - Conditional Bonuses", () => {
  it("calculates conditional bonuses correctly", () => {
    const conditionalChange: ArmorClassChange = {
      ...buildACChange("1"),
      conditions: [
        {
          type: "simple",
          firstFormula: "1",
          operator: "==",
          secondFormula: "1",
        },
      ],
    };
    const conditionalBuff = buildBuff().withChange(conditionalChange).build();
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBuff(conditionalBuff)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.totalAc.totalValue).toEqual(11);
  });

  it("doesn't calculate conditional bonuses with unmet conditions", () => {
    const conditionalChange: ArmorClassChange = {
      ...buildACChange("1"),
      conditions: [
        {
          type: "simple",
          firstFormula: "1",
          operator: "==",
          secondFormula: "2",
        },
      ],
    };
    const conditionalBuff = buildBuff().withChange(conditionalChange).build();
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBuff(conditionalBuff)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.totalAc.totalValue).toEqual(10);
  });

  it("calculates conditional bonuses with dynamic values", () => {
    const conditionalChange: ArmorClassChange = {
      ...buildACChange("1"),
      conditions: [
        {
          type: "simple",
          firstFormula: `@${valueIndexKeys.STR_MODIFIER}`,
          operator: ">",
          secondFormula: "-1",
        },
      ],
    };
    const conditionalBuff = buildBuff().withChange(conditionalChange).build();
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBuff(conditionalBuff)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.totalAc.totalValue).toEqual(11);
  });
}); 