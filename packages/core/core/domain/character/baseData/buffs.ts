import { Change, ChangeOriginType } from "./changes";
import { ContextualChange } from "./contextualChange";
import { Effect } from "./effects";
import { SpecialChange } from "./specialChanges";
import { Resource } from "../../spells/resources";

export type Buff = {
    uniqueId: string;
    name: string;
    description: string;
    originType: ChangeOriginType,
    originName: string;
    originUniqueId: string;
    active: boolean;
    changes?: Change[];
    specialChanges?: SpecialChange[];
    contextualChanges?: ContextualChange[];
    resources?: Resource[];
    /** New effects system - will eventually replace changes */
    effects?: Effect[];
};
