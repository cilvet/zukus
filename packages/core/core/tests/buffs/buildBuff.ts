import { Buff } from "../../domain/character/baseData/buffs";
import { Change } from "../../domain/character/baseData/changes";
import { SpecialChange } from "../../domain/character/baseData/specialChanges";

export function buildBuff() {
  const buff: Buff = {
    description: "buff description",
    name: "buff name",
    originName: "buff origin name",
    originType: "spell",
    originUniqueId: "buff origin unique id",
    uniqueId: "buff unique id",
    changes: [],
    specialChanges: [],
    active: true,
  };

  return {
    withChange: function (change: Change) {
      buff.changes!.push(change);
      return this;
    },
    withSpecialChange: function (specialChange: SpecialChange) {
      buff.specialChanges!.push(specialChange);
      return this;
    },
    build: function () {
      return buff;
    },
  };
}
