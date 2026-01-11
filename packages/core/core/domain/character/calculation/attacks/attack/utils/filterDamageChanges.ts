import { DamageChange, DamageTypeChange } from "../../../../baseData/attacks";
import { Change, ChangeTypes, ContextualizedChange } from "../../../../baseData/changes";

export const filterDamageChanges = (change: ContextualizedChange): change is ContextualizedChange<DamageChange> => {
  return change.type === 'DAMAGE';
};
