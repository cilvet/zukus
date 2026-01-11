import { Buff } from "../baseData/buffs";
import { UpdateResult } from "../interfaces/characterUpdater";

/**
 * @deprecated Use toggleSharedBuff from updater/operations instead.
 * This service will be removed in a future version.
 */
export class SharedBuffService {
  toggleSharedBuff(
    characterSharedBuffs: Buff[],
    sharedBuffs: Buff[],
    buffId: string
  ): UpdateResult<Buff[]> {
    const buff = sharedBuffs.find((b) => b.uniqueId === buffId);
    if (!buff) {
      return {
        success: false,
        error: "Shared buff not found"
      };
    }

    const activeCharacterSharedBuffsIds = characterSharedBuffs.map(
      (buff) => buff.uniqueId
    );

    const isBuffActive = activeCharacterSharedBuffsIds.includes(buffId);

    const newSharedBuffsIds = isBuffActive
      ? activeCharacterSharedBuffsIds.filter((id) => id !== buffId)
      : [...activeCharacterSharedBuffsIds, buffId];

    const newCharacterSharedBuffs = sharedBuffs
      .filter((buff) => newSharedBuffsIds.includes(buff.uniqueId))
      .map((buff) => ({ ...buff, active: true }));

    return {
      success: true,
      value: newCharacterSharedBuffs
    };
  }
} 