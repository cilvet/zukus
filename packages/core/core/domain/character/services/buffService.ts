import { Buff } from "../baseData/buffs";
import { UpdateResult } from "../interfaces/characterUpdater";

/**
 * @deprecated Use buffOperations from updater/operations instead.
 * This service will be removed in a future version.
 */
export class BuffService {
  isValidBuff(buff: Buff): boolean {
    return buff.name !== "" && buff.description !== "";
  }

  toggleBuff(buffs: Buff[], buffId: string): UpdateResult<Buff[]> {
    const buff = buffs.find((buff) => buff.uniqueId === buffId);
    if (!buff) {
      return {
        success: false,
        error: "Buff not found"
      };
    }
    
    const newBuffs = buffs.map((b) => {
      if (b.uniqueId === buffId) {
        return {
          ...b,
          active: !b.active
        };
      }
      return b;
    });

    return {
      success: true,
      value: newBuffs
    };
  }

  addBuff(buffs: Buff[], buff: Buff): UpdateResult<Buff[]> {
    if (!this.isValidBuff(buff)) {
      return {
        success: false,
        error: "Invalid buff"
      };
    }

    if (buffs?.some(b => b.uniqueId === buff.uniqueId)) {
      return {
        success: false,
        error: "Buff already exists"
      };
    }

    return {
      success: true,
      value: [...buffs || [], buff]
    };
  }

  editBuff(buffs: Buff[], buff: Buff): UpdateResult<Buff[]> {
    if (!this.isValidBuff(buff)) {
      return {
        success: false,
        error: "Invalid buff"
      };
    }

    const updatedBuffs = buffs.map(b => 
      b.uniqueId === buff.uniqueId ? buff : b
    );

    return {
      success: true,
      value: updatedBuffs
    };
  }

  deleteBuff(buffs: Buff[], buffId: string): UpdateResult<Buff[]> {
    const buffExists = buffs.some(buff => buff.uniqueId === buffId);
    if (!buffExists) {
      return {
        success: false,
        error: "Buff not found"
      };
    }

    return {
      success: true,
      value: buffs.filter((buff) => buff.uniqueId !== buffId)
    };
  }
} 