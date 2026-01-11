import {
  Feature,
  featureTypes,
} from "../../core/domain/character/baseData/features/feature";
import {
  ShieldProficiencyChange,
  SpecialChange,
  SpecialChangeTypes,
  WeaponProficiencyChange,
} from "../../core/domain/character/baseData/specialChanges";
import { ClassFeature } from "../../core/domain/class/classFeatures";

const weaponsProficiency: WeaponProficiencyChange = {
  type: 'WEAPON_PROFICIENCY',
  weaponTypes: [],
};

const shieldsProficiency: ShieldProficiencyChange = {
  type: 'SHIELD_PROFICIENCY',
  shieldTypes: [],
};

const armorProficiency: SpecialChange = {
  type: 'ARMOR_PROFICIENCY',
  armorTypes: [],
};

export const proficiencies: ClassFeature = {
  uniqueId: "proficiencies",
  name: "Weapon Proficiency",
  description: "You are proficient with all simple and martial weapons.",
  featureType: featureTypes.CLASS_FEATURE,
  specialChanges: [weaponsProficiency, shieldsProficiency, armorProficiency],
};
