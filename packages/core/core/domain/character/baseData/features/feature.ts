import { Change } from "../changes";
import { ClassFeature } from "../../../class/classFeatures";
import { Feat } from "./feats/feat";
import { SpecialChange } from "../specialChanges";
import { ContextualChange } from "../contextualChange";
import { Resource } from "../../../spells/resources";

export type BaseFeature = {
  uniqueId: string;
  name: string;
  description: string;
  changes?: Change[];
  specialChanges?: SpecialChange[];
  contextualChanges?: ContextualChange[];
  featureType: featureTypes;
  resources?: Resource[];
};

export enum featureTypes {
  CLASS_FEATURE = "CLASS_FEATURE",
  FEAT = "FEAT",
  OTHER = "OTHER",
  RACIAL_FEATURE = "RACIAL_FEATURE",
}

export type Feature = ClassFeature | Feat | BaseFeature;

