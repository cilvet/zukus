import { DamageTypeChange } from "../../../../baseData/attacks";
import { Change, ChangeTypes, ContextualizedChange } from "../../../../baseData/changes";

export const filterDamageTypeChanges = (change: ContextualizedChange): change is ContextualizedChange<DamageTypeChange> => {
  return change.type === 'DAMAGE_TYPE';
};
