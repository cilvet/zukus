import { FlyingSpeed, Maneuverability, Speed } from "../baseData/speed";
import { Source, SourceValue } from "./sources";

export type CalculatedSpeeds = {
  landSpeed: CalculatedSpeed;
  flySpeed?: CalculatedFlyingSpeed;
  swimSpeed?: CalculatedSpeed;
  climbSpeed?: CalculatedSpeed;
  burrowSpeed?: CalculatedSpeed;
};

export type CalculatedSpeed = {
  totalValue: number;
  sources: Source[];
  sourceValues: SourceValue[];
};

export type CalculatedFlyingSpeed = CalculatedSpeed & {
  maneuverability: Maneuverability;
};
