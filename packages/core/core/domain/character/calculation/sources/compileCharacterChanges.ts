import {
  AttackChange,
  AttackRollChange,
  BaseAttackBonusChange,
  DamageChange,
  WeaponSizeChange,
} from "../../baseData/attacks";
import {
  AbilityCheckChange,
  AbilityScoreChange,
  AbilitySkillsChange,
  ArmorClassChange,
  Change,
  ChangeTypes,
  ContextualizedChange,
  CustomVariableChange,
  InitiativeChange,
  NaturalArmorClassChange,
  SavingThrowChange,
  SizeChange,
  SingleSkillChange,
  SpeedChange,
  TemporaryHitPointsChange,
} from "../../baseData/changes";
import { CharacterBaseData } from "../../baseData/character";
import { AttackContextualChange as ContextualChange } from "../../baseData/contextualChange";
import { SpecialChange } from "../../baseData/specialChanges";
import { getCurrentLevelsData } from "../classLevels/getCurrentLevelsData";

const {
  ABILITY_CHECKS,
  ABILITY_SCORE,
  ABILITY_SKILLS,
  AC,
  ATTACK_ROLLS,
  BAB,
  DAMAGE,
  INITIATIVE,
  SAVING_THROW,
  SKILL,
  SPEED,
  TEMPORARY_HP,
  NATURAL_AC,
  CRITICAL_CONFIRMATION,
  CRITICAL_MULTIPLIER,
  CRITICAL_RANGE,
  DAMAGE_TYPE,
  SIZE,
  WEAPON_SIZE,
  CUSTOM_VARIABLE,
} = ChangeTypes;

export type CharacterChanges = {
  abilityChanges: ContextualizedChange<
    AbilityScoreChange | AbilityCheckChange
  >[];
  skillChanges: ContextualizedChange<SingleSkillChange | AbilitySkillsChange>[];
  acChanges: ContextualizedChange<ArmorClassChange | NaturalArmorClassChange>[];
  initiativeChanges: ContextualizedChange<InitiativeChange>[];
  babChanges: ContextualizedChange<BaseAttackBonusChange>[];
  savingThrowChanges: ContextualizedChange<SavingThrowChange>[];
  speedChanges: ContextualizedChange<SpeedChange>[];
  temporaryHitPointsChanges: ContextualizedChange<TemporaryHitPointsChange>[];
  attackChanges: ContextualizedChange<AttackChange>[];
  sizeChanges: ContextualizedChange<SizeChange>[];
  weaponSizeChanges: ContextualizedChange<WeaponSizeChange>[];
  customVariableChanges: ContextualizedChange<CustomVariableChange>[];
};

export function compileContextualizedChanges(
  characterBaseData: CharacterBaseData
): [CharacterChanges, ContextualChange[], SpecialChange[]] {
  const classFeatureChanges = compileClassFeatureChanges(characterBaseData);
  const featChanges = compileFeatChanges(characterBaseData);
  const raceChanges = compileRaceChanges(characterBaseData);
  const itemChanges = compileItemChanges(characterBaseData);
  const buffChanges = compileBuffChanges(characterBaseData);
  const specialFeatureChanges = compileSpecialFeatureChanges(characterBaseData);

  const allChanges: ContextualizedChange[] = [
    ...classFeatureChanges[0],
    ...featChanges[0],
    ...raceChanges[0],
    ...itemChanges[0],
    ...buffChanges[0],
    ...specialFeatureChanges[0],
  ];

  const allContextualChanges: ContextualChange[] = [
    ...classFeatureChanges[1],
    ...featChanges[1],
    ...raceChanges[1],
    ...itemChanges[1],
    ...buffChanges[1],
    ...specialFeatureChanges[1],
  ];

  const allSpecialChanges: SpecialChange[] = [
    ...classFeatureChanges[2],
    ...featChanges[2],
    ...raceChanges[2],
    ...itemChanges[2],
    ...buffChanges[2],
    ...specialFeatureChanges[2],
  ];

  const characterChanges: CharacterChanges = {
    abilityChanges: [],
    skillChanges: [],
    acChanges: [],
    initiativeChanges: [],
    babChanges: [],
    savingThrowChanges: [],
    speedChanges: [],
    temporaryHitPointsChanges: [],
    attackChanges: [],
    sizeChanges: [],
    weaponSizeChanges: [],
    customVariableChanges: [],
  };

  allChanges.forEach((change) => {
    switch (change.type) {
      case ABILITY_CHECKS:
        characterChanges.abilityChanges.push(change);
        break;
      case ABILITY_SCORE:
        characterChanges.abilityChanges.push(change);
        break;
      case ABILITY_SKILLS:
        characterChanges.skillChanges.push(change);
        break;
      case AC:
        characterChanges.acChanges.push(change);
        break;
      case NATURAL_AC:
        characterChanges.acChanges.push(change);
        break;
      case INITIATIVE:
        characterChanges.initiativeChanges.push(change);
        break;
      case SKILL:
        characterChanges.skillChanges.push(change);
        break;
      case SAVING_THROW:
        characterChanges.savingThrowChanges.push(change);
        break;
      case BAB:
        characterChanges.babChanges.push(change);
        break;
      case SPEED:
        characterChanges.speedChanges.push(change);
        break;
      case TEMPORARY_HP:
        characterChanges.temporaryHitPointsChanges.push(change);
        break;
      case DAMAGE:
        characterChanges.attackChanges.push(change);
        break;
      case ATTACK_ROLLS:
        characterChanges.attackChanges.push(change);
        break;
      case CRITICAL_CONFIRMATION:
        characterChanges.attackChanges.push(change);
        break;
      case CRITICAL_MULTIPLIER:
        characterChanges.attackChanges.push(change);
        break;
      case CRITICAL_RANGE:
        characterChanges.attackChanges.push(change);
        break;
      case DAMAGE_TYPE:
        characterChanges.attackChanges.push(change);
        break;
      case SIZE:
        characterChanges.sizeChanges.push(change);
        break;
      case WEAPON_SIZE:
        characterChanges.weaponSizeChanges.push(change);
        break;
      case CUSTOM_VARIABLE:
        characterChanges.customVariableChanges.push(change);
        break;
    }
  });

  return [characterChanges, allContextualChanges, allSpecialChanges];
}

/**
 * Categorizes an array of contextualized changes into CharacterChanges structure.
 * This is useful for adding changes from custom entities to the character.
 */
export function categorizeChanges(
  changes: ContextualizedChange[]
): CharacterChanges {
  const characterChanges: CharacterChanges = {
    abilityChanges: [],
    skillChanges: [],
    acChanges: [],
    initiativeChanges: [],
    babChanges: [],
    savingThrowChanges: [],
    speedChanges: [],
    temporaryHitPointsChanges: [],
    attackChanges: [],
    sizeChanges: [],
    weaponSizeChanges: [],
    customVariableChanges: [],
  };

  changes.forEach((change) => {
    switch (change.type) {
      case ABILITY_CHECKS:
        characterChanges.abilityChanges.push(change);
        break;
      case ABILITY_SCORE:
        characterChanges.abilityChanges.push(change);
        break;
      case ABILITY_SKILLS:
        characterChanges.skillChanges.push(change);
        break;
      case AC:
        characterChanges.acChanges.push(change);
        break;
      case NATURAL_AC:
        characterChanges.acChanges.push(change);
        break;
      case INITIATIVE:
        characterChanges.initiativeChanges.push(change);
        break;
      case SKILL:
        characterChanges.skillChanges.push(change);
        break;
      case SAVING_THROW:
        characterChanges.savingThrowChanges.push(change);
        break;
      case BAB:
        characterChanges.babChanges.push(change);
        break;
      case SPEED:
        characterChanges.speedChanges.push(change);
        break;
      case TEMPORARY_HP:
        characterChanges.temporaryHitPointsChanges.push(change);
        break;
      case DAMAGE:
        characterChanges.attackChanges.push(change);
        break;
      case ATTACK_ROLLS:
        characterChanges.attackChanges.push(change);
        break;
      case CRITICAL_CONFIRMATION:
        characterChanges.attackChanges.push(change);
        break;
      case CRITICAL_MULTIPLIER:
        characterChanges.attackChanges.push(change);
        break;
      case CRITICAL_RANGE:
        characterChanges.attackChanges.push(change);
        break;
      case DAMAGE_TYPE:
        characterChanges.attackChanges.push(change);
        break;
      case SIZE:
        characterChanges.sizeChanges.push(change);
        break;
      case WEAPON_SIZE:
        characterChanges.weaponSizeChanges.push(change);
        break;
      case CUSTOM_VARIABLE:
        characterChanges.customVariableChanges.push(change);
        break;
    }
  });

  return characterChanges;
}

/**
 * Merges two CharacterChanges objects, concatenating all arrays.
 */
export function mergeCharacterChanges(
  base: CharacterChanges,
  additions: CharacterChanges
): CharacterChanges {
  return {
    abilityChanges: [...base.abilityChanges, ...additions.abilityChanges],
    skillChanges: [...base.skillChanges, ...additions.skillChanges],
    acChanges: [...base.acChanges, ...additions.acChanges],
    initiativeChanges: [...base.initiativeChanges, ...additions.initiativeChanges],
    babChanges: [...base.babChanges, ...additions.babChanges],
    savingThrowChanges: [...base.savingThrowChanges, ...additions.savingThrowChanges],
    speedChanges: [...base.speedChanges, ...additions.speedChanges],
    temporaryHitPointsChanges: [...base.temporaryHitPointsChanges, ...additions.temporaryHitPointsChanges],
    attackChanges: [...base.attackChanges, ...additions.attackChanges],
    sizeChanges: [...base.sizeChanges, ...additions.sizeChanges],
    weaponSizeChanges: [...base.weaponSizeChanges, ...additions.weaponSizeChanges],
    customVariableChanges: [...base.customVariableChanges, ...additions.customVariableChanges],
  };
}

function compileRaceChanges(
  characterBaseData: CharacterBaseData
): [ContextualizedChange[], ContextualChange[], SpecialChange[]] {
  const changes: ContextualizedChange[] = [];
  const contextualChanges: ContextualChange[] = [];
  const specialChanges: SpecialChange[] = [];

  characterBaseData.race?.racialFeatures.forEach((feature) => {
    feature.changes?.forEach((change) => {
      const contextualizedChange: ContextualizedChange = {
        ...change,
        originId: feature.uniqueId,
        originType: "raceFeature",
        name: feature.name,
      };
      changes.push(contextualizedChange);
    });
    contextualChanges.push(...(feature.contextualChanges || []));
    specialChanges.push(...(feature.specialChanges || []));
  });

  characterBaseData.race?.changes?.forEach((change) => {
    const contextualizedChange: ContextualizedChange = {
      ...change,
      originId: characterBaseData.race!.uniqueId,
      originType: "raceFeature",
      name: characterBaseData.race!.name,
    };
    changes.push(contextualizedChange);
  });
  return [changes, contextualChanges, specialChanges];
}

function compileFeatChanges(
  characterBaseData: CharacterBaseData
): [ContextualizedChange[], ContextualChange[], SpecialChange[]] {
  const changes: ContextualizedChange[] = [];
  const contextualChanges: ContextualChange[] = [];
  const specialChanges: SpecialChange[] = [];
  const levelsData = getCurrentLevelsData(characterBaseData);
  levelsData.forEach((levelData) => {
    levelData.levelFeats.forEach((feat) => {
      feat.changes?.forEach((change) => {
        const contextualizedChange: ContextualizedChange = {
          ...change,
          originId: feat.uniqueId,
          originType: "feat",
          name: feat.name,
        };
        changes.push(contextualizedChange);
      });
      contextualChanges.push(...(feat.contextualChanges || []));
      specialChanges.push(...(feat.specialChanges || []));
    });
  });

  characterBaseData.feats.forEach((feat) => {
    feat.changes?.forEach((change) => {
      const contextualizedChange: ContextualizedChange = {
        ...change,
        originId: feat.uniqueId,
        originType: "feat",
        name: feat.name,
      };
      changes.push(contextualizedChange);
    });
    contextualChanges.push(...(feat.contextualChanges || []));
    specialChanges.push(...(feat.specialChanges || []));
  });

  return [changes, contextualChanges, specialChanges];
}

function compileItemChanges(
  characterBaseData: CharacterBaseData
): [ContextualizedChange[], ContextualChange[], SpecialChange[]] {
  const changes: ContextualizedChange[] = [];
  const contextualChanges: ContextualChange[] = [];
  const specialChanges: SpecialChange[] = [];

  characterBaseData.equipment.items.forEach((item) => {
    const processItemChanges = (change: Change) => {
      const contextualizedChange: ContextualizedChange = {
        ...change,
        originId: item.uniqueId,
        originType: "item",
        name: item.name,
      };
      changes.push(contextualizedChange);
    };

    item.changes?.forEach(processItemChanges);

    if (item.equipable && item.equipped) {
      item.equippedChanges?.forEach(processItemChanges);
      contextualChanges.push(...(item.equippedContextChanges || []));
    }

    if (item.itemType === "WEAPON") {
      item.weaponOnlyChanges?.forEach(processItemChanges);
      contextualChanges.push(...(item.wieldedContextChanges || []));
    }

    contextualChanges.push(...(item.contextualChanges || []));
    specialChanges.push(...(item.specialChanges || []));
    
    if (
      item.itemType === "ARMOR" ||
      item.itemType === "SHIELD" ||
      item.itemType === "WEAPON"
    ) {
      item.enhancements?.forEach((enhancement) => {
        const addChange = (change: Change) => {
          const contextualizedChange: ContextualizedChange = {
            ...change,
            originId: enhancement.uniqueId,
            originType: "item",
            name: enhancement.name,
          };
          changes.push(contextualizedChange);
        };
        if (item.equipped) {
          enhancement.equippedChanges?.forEach(addChange);
        }
        if (item.itemType === "WEAPON" && item.wielded) {
          enhancement.wieldedChanges?.forEach(addChange);
          contextualChanges.push(...(enhancement.wieldedContextChanges || []));
        }
      });
    }
  });
  return [changes, contextualChanges, specialChanges];
}

function compileBuffChanges(
  characterBaseData: CharacterBaseData
): [ContextualizedChange[], ContextualChange[], SpecialChange[]] {
  const changes: ContextualizedChange[] = [];
  const contextualChanges: ContextualChange[] = [];
  const specialChanges: SpecialChange[] = [];

  const allBuffs = [
    ...characterBaseData.buffs ?? [],
    ...characterBaseData.sharedBuffs ?? [],
  ];

  allBuffs
    .filter((buff) => buff.active)
    .forEach((buff) => {
      buff.changes?.forEach((change) => {
        const contextualizedChange: ContextualizedChange = {
          ...change,
          originId: buff.uniqueId,
          originType: buff.originType,
          name: buff.name,
        };
        changes.push(contextualizedChange);
      });
      contextualChanges.push(...(buff.contextualChanges || []));
      specialChanges.push(...(buff.specialChanges || []));
    });
  return [changes, contextualChanges, specialChanges];
}

function compileClassFeatureChanges(
  characterBaseData: CharacterBaseData
): [ContextualizedChange[], ContextualChange[], SpecialChange[]] {
  const changes: ContextualizedChange[] = [];
  const contextualChanges: ContextualChange[] = [];
  const specialChanges: SpecialChange[] = [];
  const levelsData = getCurrentLevelsData(characterBaseData);
  levelsData.forEach((levelData) => {
    levelData &&
      levelData.levelClassFeatures.forEach((feature) => {
        feature.changes?.forEach((change) => {
          const contextualizedChange: ContextualizedChange = {
            ...change,
            originId: feature.uniqueId,
            originType: "classFeature",
            name: feature.name,
          };
          changes.push(contextualizedChange);
        });
        contextualChanges.push(...(feature.contextualChanges || []));
        specialChanges.push(...(feature.specialChanges || []));
      });
  });

  return [changes, contextualChanges, specialChanges];
}

function compileSpecialFeatureChanges(
  characterBaseData: CharacterBaseData
): [ContextualizedChange[], ContextualChange[], SpecialChange[]] {
  const changes: ContextualizedChange[] = [];
  const contextualChanges: ContextualChange[] = [];
  const specialChanges: SpecialChange[] = [];

  characterBaseData.specialFeatures?.forEach((specialFeature) => {
    specialFeature.changes?.forEach((change) => {
      const contextualizedChange: ContextualizedChange = {
        ...change,
        originId: specialFeature.uniqueId,
        originType: "specialFeature",
        name: specialFeature.title,
      };
      changes.push(contextualizedChange);
    });
    contextualChanges.push(...(specialFeature.contextualChanges || []));
    specialChanges.push(...(specialFeature.specialChanges || []));
  });

  return [changes, contextualChanges, specialChanges];
}
