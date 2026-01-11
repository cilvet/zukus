import { LocatedString } from "../../../../language/locatedString";
import { BaseFeature, Feature, featureTypes } from "../feature";

export type Feat = BaseFeature & {
  featureType: featureTypes.FEAT;
  prerequisites?: Prerequisite[];
  featurePoolIds?: string[];
  overridenValue?: Feat;
};

// de momento no vamos a tener en cuenta los prerequisitos que no sean feats
export type Prerequisite = {
  name: LocatedString;
  featUniqueId: string;
};

export type ExtraFeat = Feature & {
  featUniqueId?: string;
};
