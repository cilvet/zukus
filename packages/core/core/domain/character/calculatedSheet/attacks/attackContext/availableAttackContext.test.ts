import { arcoDeGorwin } from "../../../../../../data/characters/gorwin";
import { fighter } from "../../../../../../srd/classes";
import { addDexToDamage, addIntToDamage } from "../../../../../../srd/commonBuffs/commonBuffs";
import { buildCharacter } from "../../../../../tests/character/buildCharacter";
import { getDamageResultText } from "../../../../../utils/stringifyValues/damageResultToString";
import { MockDiceRoller } from "../../../../rolls/DiceRoller/MockDiceRoller";
import { ResolvedAttackContextualChange } from "../../../baseData/contextualChange";
import { getAttackDamageFormula } from "../../../calculation/attacks/attack/getAttackDamageFormula";
import { getDamageFormulaText } from "../../../calculation/attacks/attack/utils/getDamageText";
import { mapSubstitutionDataToSubstitutionExpressions } from "../../../calculation/attacks/attack/utils/mapSubstitutionDataToSubstitutionExpressions";
import { calculateDamage } from "../../../calculation/attacks/damage/calculateDamage";
import { ResolvedAttackContext } from "../calculatedAttack";
import { getWeaponAttackContext } from "./availableAttackContext";

it("should create the correct damage context for a character with a magebane weapon", () => {
  const characterSheet = buildCharacter()
    .withClassLevels(fighter, 14)
    .withBaseAbilityScore("dexterity", 18)
    .withBaseAbilityScore("intelligence", 20)
    .withItem(arcoDeGorwin)
    .withBuff(addDexToDamage)
    .withBuff(addIntToDamage)
    .buildCharacterSheet();

  const attackContext = getWeaponAttackContext(
    arcoDeGorwin,
    characterSheet.attackData.attackContextChanges,
    characterSheet.attackData.attackChanges,
    characterSheet
  );

  const mageBaneChange = attackContext.contextualChanges[0];
  const resolvedMageBaneChange: ResolvedAttackContextualChange = {
    ...mageBaneChange,
    variables: [],
  };

  const resolvedAttackContext: ResolvedAttackContext = {
    appliedContextualChanges: [resolvedMageBaneChange],
    attackType: attackContext.type,
    character: characterSheet,
    weapon: attackContext.weapon,
    wieldType: attackContext.weapon.defaultWieldType,
    appliedChanges: attackContext.changes,
  };

  const damageFormula = getAttackDamageFormula(resolvedAttackContext);
  const damageFormulaText = getDamageFormulaText(
    damageFormula,
    characterSheet.substitutionValues
  );

  const diceRoller = new MockDiceRoller();
  diceRoller.mockAllDiceRollsTo(1);
  const calculatedDamage = calculateDamage(
    damageFormula,
    diceRoller,
    mapSubstitutionDataToSubstitutionExpressions(
      characterSheet.substitutionValues
    )
  );

  const calculatedDamageText = getDamageResultText(calculatedDamage);
  console.log(calculatedDamageText);
});
