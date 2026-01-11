import { BaseFeature, featureTypes } from "../character/baseData/features/feature";

export type ClassFeature = BaseFeature & {
  featureType: featureTypes.CLASS_FEATURE;
};

