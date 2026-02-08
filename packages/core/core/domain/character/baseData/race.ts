import { Feature } from "./features/feature";
import { LocatedString } from "../../language/locatedString";
import { Change } from "./changes";
import { Size } from "./sizes";
import { DefaultBaseSpeeds } from "./speed";
import { Resource } from "../../spells/resources";

export type Race = {
  uniqueId: string;
  name: string;
  size: Size;
  baseSpeeds: DefaultBaseSpeeds;
  languages: LocatedString[];
  racialFeatures: Feature[];
  levelAdjustment?: number;
  racialHD?: number;
  changes?: Change[];
  resources?: Resource[];
};
