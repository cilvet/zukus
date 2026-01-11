import { Buff } from "../baseData/buffs";
import { CharacterBaseData, SpecialFeature } from "../baseData/character";
import { CharacterSheet } from "../calculatedSheet/sheet";
import { Equipment, Item } from "../baseData/equipment";
import { ClassFeature } from "../../class/classFeatures";
import { Feat } from "../baseData/features/feats/feat";
import type { StandardEntity } from "../../entities/types/base";

export type UpdateResult<T = void> =
  | {
      success: false;
      error: string;
    }
  | (T extends void
      ? {
          success: true;
          value?: T;
        }
      : {
          success: true;
          value: T;
        });

export interface ICharacterUpdater {
  // Buff management
  toggleBuff(buffId: string): UpdateResult;
  addBuff(buff: Buff): UpdateResult;
  deleteBuff(buffId: string): UpdateResult;
  editBuff(buff: Buff): UpdateResult;
  toggleSharedBuff(buffId: string): UpdateResult;

  // Character base data
  updateCharacterBaseData(character: CharacterBaseData): UpdateResult;
  getCharacterBaseData(): CharacterBaseData | null;
  getCharacterSheet(): CharacterSheet | null;
  setOnCharacterUpdated(callback: (sheet: CharacterSheet, baseData: CharacterBaseData) => void): void;

  // Equipment management
  updateEquippedItems(equipment: Equipment): UpdateResult;
  addItemToInventory(item: Item): UpdateResult;
  removeItemFromInventory(itemUniqueId: string): UpdateResult;
  updateItem(item: Item): UpdateResult;
  toggleItemEquipped(itemUniqueId: string): UpdateResult;

  // Class Features management
  updateClassFeature(featureUniqueId: string, feature: ClassFeature): UpdateResult;
  addClassFeature(feature: ClassFeature): UpdateResult;
  removeClassFeature(featureUniqueId: string): UpdateResult;

  // Feats management
  updateFeat(featUniqueId: string, feat: Feat): UpdateResult;
  addFeat(feat: Feat): UpdateResult;
  removeFeat(featUniqueId: string): UpdateResult;
  updateLevelFeat(level: number, featUniqueId: string, feat: Feat): UpdateResult;
  addLevelFeat(level: number, feat: Feat): UpdateResult;
  removeLevelFeat(level: number, featUniqueId: string): UpdateResult;

  // Special Features management
  updateSpecialFeature(featureUniqueId: string, feature: SpecialFeature): UpdateResult;
  addSpecialFeature(feature: SpecialFeature): UpdateResult;
  removeSpecialFeature(featureUniqueId: string): UpdateResult;
  updateSpecialFeatures(specialFeatures: SpecialFeature[]): UpdateResult;

  // Character properties
  updateTheme(theme: string): UpdateResult;
  updateName(name: string): UpdateResult;
  updateHp(hpAdded: number): UpdateResult;
  setCurrentCharacterLevel(level: number): UpdateResult;
  
  // Resource management
  consumeResource(resourceId: string, amount?: number): UpdateResult;
  rechargeResource(resourceId: string, amount?: number): UpdateResult;
  rechargeAllResources(): UpdateResult;
  
  // Rest functionality
  rest(): UpdateResult;
  
  // Custom Entities management
  addCustomEntity(entity: StandardEntity, entityType: string): UpdateResult;
  removeCustomEntity(entityId: string, entityType: string): UpdateResult;
  updateCustomEntity(entityId: string, entityType: string, entity: StandardEntity): UpdateResult;
  getCustomEntities(entityType?: string): StandardEntity[] | Record<string, StandardEntity[]>;
}
