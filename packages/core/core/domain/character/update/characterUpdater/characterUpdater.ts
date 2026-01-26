import { Buff } from "../../baseData/buffs";
import { CharacterBaseData, CharacterLevelData, SpecialFeature, Alignment } from "../../baseData/character";
import { Equipment, Item } from "../../baseData/equipment";
import { CharacterSheet } from "../../calculatedSheet/sheet";
import { calculateCharacterSheet } from "../../calculation/calculateCharacterSheet";
import {
  ICharacterUpdater,
  UpdateResult,
} from "../../interfaces/characterUpdater";
import * as ops from "../../updater/operations";
import { ClassFeature } from "../../../class/classFeatures";
import { Feat } from "../../baseData/features/feats/feat";
import type { StandardEntity } from "../../../entities/types/base";
import { useSlot, refreshSlots } from "../../../cge/slotOperations";
import { prepareEntityInSlot, unprepareSlot } from "../../../cge/preparationOperations";

/**
 * Character Updater - Wrapper con estado sobre funciones puras.
 * 
 * Este updater mantiene el estado del personaje y proporciona una interfaz
 * conveniente para actualizaciones, notificando cambios automáticamente.
 * 
 * Todas las operaciones delegan a funciones puras en operations/.
 */
export class CharacterUpdater implements ICharacterUpdater {
  private character: CharacterBaseData | null;
  private characterSheet: CharacterSheet | null = null;
  private sharedBuffs: Buff[];
  private onCharacterUpdated: (
    sheet: CharacterSheet,
    baseData: CharacterBaseData
  ) => void;
  private characterNotSet: UpdateResult = { success: false, error: "Character is not set" };

  constructor(
    character: CharacterBaseData | null,
    sharedBuffs: Buff[],
    onCharacterUpdated?: (
      sheet: CharacterSheet,
      baseData: CharacterBaseData
    ) => void
  ) {
    this.character = character;
    if (character) {
      this.characterSheet = calculateCharacterSheet(character);
    }
    this.sharedBuffs = sharedBuffs;
    this.onCharacterUpdated = onCharacterUpdated || (() => {});
  }

  /**
   * Notifica cambios y recalcula el sheet.
   */
  private notifyUpdate() {
    if (!this.character) {
      return;
    }
    this.character.updatedAt = new Date().toISOString();
    this.characterSheet = calculateCharacterSheet(this.character);
    this.onCharacterUpdated(this.characterSheet, this.character);
  }

  /**
   * Convierte OperationResult a UpdateResult legacy.
   */
  private toUpdateResult(result: ops.OperationResult): UpdateResult {
    if (result.warnings.length > 0) {
      return { success: false, error: result.warnings[0].message };
    }
    return { success: true };
  }

  // =============================================================================
  // Buff Management
  // =============================================================================

  toggleBuff(buffId: string): UpdateResult {
    if (!this.character) return this.characterNotSet;
    
    const result = ops.toggleBuff(this.character, buffId);
    
    if (result.warnings.length > 0) {
      return this.toUpdateResult(result);
    }
    
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  addBuff(buff: Buff): UpdateResult {
    if (!this.character) return this.characterNotSet;
    
    const result = ops.addBuff(this.character, buff);
    
    if (result.warnings.length > 0) {
      return this.toUpdateResult(result);
    }
    
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  editBuff(buff: Buff): UpdateResult {
    if (!this.character) return this.characterNotSet;
    
    const result = ops.editBuff(this.character, buff);
    
    if (result.warnings.length > 0) {
      return this.toUpdateResult(result);
    }
    
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  deleteBuff(buffId: string): UpdateResult {
    if (!this.character) return this.characterNotSet;
    
    const result = ops.deleteBuff(this.character, buffId);
    
    if (result.warnings.length > 0) {
      return this.toUpdateResult(result);
    }
    
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  toggleSharedBuff(buffId: string): UpdateResult {
    if (!this.character) return this.characterNotSet;
    
    const result = ops.toggleSharedBuff(this.character, buffId, this.sharedBuffs);
    
    if (result.warnings.length > 0) {
      return this.toUpdateResult(result);
    }
    
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  // =============================================================================
  // Equipment Management
  // =============================================================================

  updateEquippedItems(equipment: Equipment): UpdateResult {
    if (!this.character) return this.characterNotSet;
    
    const result = ops.updateEquipment(this.character, equipment);
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  addItemToInventory(item: Item): UpdateResult {
    if (!this.character) return this.characterNotSet;
    
    const result = ops.addItem(this.character, item);
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  removeItemFromInventory(itemUniqueId: string): UpdateResult {
    if (!this.character) return this.characterNotSet;
    
    const result = ops.removeItem(this.character, itemUniqueId);
    
    if (result.warnings.length > 0) {
      return this.toUpdateResult(result);
    }
    
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  updateItem(itemToUpdate: Item): UpdateResult {
    if (!this.character) return this.characterNotSet;
    
    const result = ops.updateItem(this.character, itemToUpdate);
    
    if (result.warnings.length > 0) {
      return this.toUpdateResult(result);
    }
    
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  toggleItemEquipped(itemUniqueId: string): UpdateResult {
    if (!this.character) return this.characterNotSet;
    
    const result = ops.toggleItemEquipped(this.character, itemUniqueId);
    
    if (result.warnings.length > 0) {
      return this.toUpdateResult(result);
    }
    
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  // =============================================================================
  // Special Features Management
  // =============================================================================

  updateSpecialFeatures(specialFeatures: SpecialFeature[]): UpdateResult {
    if (!this.character) return this.characterNotSet;
    
    const result = ops.setSpecialFeatures(this.character, specialFeatures);
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  updateSpecialFeature(
    featureUniqueId: string,
    feature: SpecialFeature
  ): UpdateResult {
    if (!this.character) return this.characterNotSet;
    
    const result = ops.updateSpecialFeature(this.character, featureUniqueId, feature);
    
    if (result.warnings.length > 0) {
      return this.toUpdateResult(result);
    }
    
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  addSpecialFeature(feature: SpecialFeature): UpdateResult {
    if (!this.character) return this.characterNotSet;
    
    const result = ops.addSpecialFeature(this.character, feature);
    
    if (result.warnings.length > 0) {
      return this.toUpdateResult(result);
    }
    
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  removeSpecialFeature(featureUniqueId: string): UpdateResult {
    if (!this.character) return this.characterNotSet;
    
    const result = ops.removeSpecialFeature(this.character, featureUniqueId);
    
    if (result.warnings.length > 0) {
      return this.toUpdateResult(result);
    }
    
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  // =============================================================================
  // Character Properties
  // =============================================================================

  updateTheme(theme: string): UpdateResult {
    if (!this.character) return this.characterNotSet;
    
    const result = ops.setTheme(this.character, theme);
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  updateName(name: string): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const result = ops.setName(this.character, name);
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  updateDescription(description: string): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const result = ops.setDescription(this.character, description);
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  updateAlignment(alignment: Alignment | null): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const result = ops.setAlignment(this.character, alignment);
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  updateAge(age: string): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const result = ops.setAge(this.character, age);
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  updateGender(gender: string): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const result = ops.setGender(this.character, gender);
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  updateHeight(height: string): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const result = ops.setHeight(this.character, height);
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  updateWeight(weight: string): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const result = ops.setWeight(this.character, weight);
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  updateEyes(eyes: string): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const result = ops.setEyes(this.character, eyes);
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  updateHair(hair: string): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const result = ops.setHair(this.character, hair);
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  updateSkin(skin: string): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const result = ops.setSkin(this.character, skin);
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  updateDeity(deity: string): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const result = ops.setDeity(this.character, deity);
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  updateBackground(background: string): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const result = ops.setBackground(this.character, background);
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  // =============================================================================
  // HP Management
  // =============================================================================

  updateHp(hpAdded: number): UpdateResult {
    if (!this.character || !this.characterSheet) {
      return this.characterNotSet;
    }

    const maxHp = this.characterSheet.hitPoints.maxHp;
    const result = ops.modifyHp(this.character, hpAdded, maxHp);
    
    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  // =============================================================================
  // Resource Management
  // =============================================================================

  consumeResource(resourceId: string, amount?: number): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const calculatedSheet = this.getCharacterSheet();
    const calculatedResource = calculatedSheet?.resources?.[resourceId];
    
    if (!calculatedResource) {
      return { success: false, error: "Resource not found" };
    }

    const result = ops.consumeResource(
      this.character,
      resourceId,
      amount,
      calculatedResource
    );

    if (result.warnings.length > 0) {
      return this.toUpdateResult(result);
    }

    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  rechargeResource(resourceId: string, amount?: number): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const calculatedSheet = this.getCharacterSheet();
    const calculatedResource = calculatedSheet?.resources?.[resourceId];
    
    if (!calculatedResource) {
      return { success: false, error: "Resource not found" };
    }

    const result = ops.rechargeResource(
      this.character,
      resourceId,
      amount,
      calculatedResource
    );

    if (result.warnings.length > 0) {
      return this.toUpdateResult(result);
    }

    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  rechargeAllResources(): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const calculatedSheet = this.getCharacterSheet();
    if (!calculatedSheet?.resources || Object.keys(calculatedSheet.resources).length === 0) {
      return { success: false, error: "No calculated resources found" };
    }

    const result = ops.rechargeAllResources(
      this.character,
      calculatedSheet.resources
    );

    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  rest(): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const calculatedSheet = this.getCharacterSheet();
    if (!calculatedSheet) {
      return { success: false, error: "Could not calculate character sheet" };
    }

    const healingAmount = calculatedSheet.substitutionValues?.["restHealingFormula"] ?? 1;

    const hpResult = this.updateHp(healingAmount);
    if (!hpResult.success) {
      return { success: false, error: `Failed to heal HP during rest: ${hpResult.error}` };
    }

    const calculatedResources = calculatedSheet?.resources;
    if (calculatedResources && Object.keys(calculatedResources).length > 0) {
      const resourceResult = this.rechargeAllResources();
      if (!resourceResult.success) {
        return { success: false, error: `Failed to recharge resources during rest: ${resourceResult.error}` };
      }
    }

    // Refresh all CGE spell/power slots
    const cgeIds = Object.keys(calculatedSheet.cge ?? {});
    for (const cgeId of cgeIds) {
      const cgeResult = this.refreshSlotsForCGE(cgeId);
      if (!cgeResult.success) {
        return { success: false, error: `Failed to refresh CGE slots for ${cgeId}: ${cgeResult.error}` };
      }
    }

    return { success: true };
  }

  // =============================================================================
  // Character Base Data
  // =============================================================================

  updateCharacterBaseData(character: CharacterBaseData): UpdateResult {
    this.character = character;
    this.notifyUpdate();
    return { success: true };
  }

  getCharacterBaseData(): CharacterBaseData | null {
    return this.character;
  }

  getCharacterSheet(): CharacterSheet | null {
    if (!this.character) return null;
    this.characterSheet = calculateCharacterSheet(this.character);
    return this.characterSheet;
  }

  setOnCharacterUpdated(
    callback: (sheet: CharacterSheet, baseData: CharacterBaseData) => void
  ) {
    this.onCharacterUpdated = callback;
  }

  setCurrentCharacterLevel(level: number): UpdateResult {
    if (!this.character) {
      return this.characterNotSet;
    }
    this.character = {
      ...this.character,
      level: {
        level,
        levelsData: this.character.level.levelsData,
        xp: this.character.level.xp,
      },
    };
    this.notifyUpdate();
    return { success: true };
  }

  // =============================================================================
  // Legacy Class Features Management
  // @deprecated - These methods are part of the old level system
  // =============================================================================

  /** @deprecated Use new levels system instead */
  updateClassFeature(
    featureUniqueId: string,
    feature: ClassFeature
  ): UpdateResult {
    if (!this.character) return this.characterNotSet;

    let levelData: CharacterLevelData | null = null;
    let featureIndex = -1;

    for (const ld of this.character.level.levelsData) {
      const index = ld.levelClassFeatures.findIndex(
        (f) => f.uniqueId === featureUniqueId
      );
      if (index !== -1) {
        levelData = ld;
        featureIndex = index;
        break;
      }
    }

    if (!levelData || featureIndex === -1) {
      return {
        success: false,
        error: `Class feature ${featureUniqueId} not found in any level`,
      };
    }

    this.character = {
      ...this.character,
      level: {
        ...this.character.level,
        levelsData: this.character.level.levelsData.map((ld) => {
          if (ld === levelData) {
            return {
              ...ld,
              levelClassFeatures: ld.levelClassFeatures.map((f, idx) => {
                if (idx === featureIndex) {
                  return feature;
                }
                return f;
              }),
            };
          }
          return ld;
        }),
      },
    };

    this.notifyUpdate();
    return { success: true };
  }

  /** @deprecated Use new levels system instead */
  addClassFeature(
    feature: ClassFeature
  ): UpdateResult {
    if (!this.character) return this.characterNotSet;

    for (const ld of this.character.level.levelsData) {
      const featureExists = ld.levelClassFeatures.some(
        (f) => f.uniqueId === feature.uniqueId
      );

      if (featureExists) {
        return {
          success: false,
          error: `Class feature ${feature.uniqueId} already exists`,
        };
      }
    }

    if (this.character.level.levelsData.length === 0) {
      return {
        success: false,
        error: "Character has no levels",
      };
    }

    const firstLevel = this.character.level.levelsData[0];

    this.character = {
      ...this.character,
      level: {
        ...this.character.level,
        levelsData: this.character.level.levelsData.map((ld) => {
          if (ld === firstLevel) {
            return {
              ...ld,
              levelClassFeatures: [...ld.levelClassFeatures, feature],
            };
          }
          return ld;
        }),
      },
    };

    this.notifyUpdate();
    return { success: true };
  }

  /** @deprecated Use new levels system instead */
  removeClassFeature(
    featureUniqueId: string
  ): UpdateResult {
    if (!this.character) return this.characterNotSet;

    let levelData: CharacterLevelData | null = null;

    for (const ld of this.character.level.levelsData) {
      const featureExists = ld.levelClassFeatures.some(
        (f) => f.uniqueId === featureUniqueId
      );

      if (featureExists) {
        levelData = ld;
        break;
      }
    }

    if (!levelData) {
      return {
        success: false,
        error: `Class feature ${featureUniqueId} not found in any level`,
      };
    }

    this.character = {
      ...this.character,
      level: {
        ...this.character.level,
        levelsData: this.character.level.levelsData.map((ld) => {
          if (ld === levelData) {
            return {
              ...ld,
              levelClassFeatures: ld.levelClassFeatures.filter(
                (f) => f.uniqueId !== featureUniqueId
              ),
            };
          }
          return ld;
        }),
      },
    };

    this.notifyUpdate();
    return { success: true };
  }

  // =============================================================================
  // Legacy Feats Management
  // @deprecated - These methods are part of the old level system
  // =============================================================================

  /** @deprecated Use new levels system instead */
  updateFeat(featUniqueId: string, feat: Feat): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const featIndex = this.character.feats.findIndex(
      (f) => f.uniqueId === featUniqueId
    );

    if (featIndex === -1) {
      return {
        success: false,
        error: `Feat ${featUniqueId} not found in character feats`,
      };
    }

    this.character = {
      ...this.character,
      feats: this.character.feats.map((f, idx) => {
        if (idx === featIndex) {
          return feat;
        }
        return f;
      }),
    };

    this.notifyUpdate();
    return { success: true };
  }

  /** @deprecated Use new levels system instead */
  addFeat(feat: Feat): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const featExists = this.character.feats.some(
      (f) => f.uniqueId === feat.uniqueId
    );

    if (featExists) {
      return {
        success: false,
        error: `Feat ${feat.uniqueId} already exists in character feats`,
      };
    }

    this.character = {
      ...this.character,
      feats: [...this.character.feats, feat],
    };

    this.notifyUpdate();
    return { success: true };
  }

  /** @deprecated Use new levels system instead */
  removeFeat(featUniqueId: string): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const featExists = this.character.feats.some(
      (f) => f.uniqueId === featUniqueId
    );

    if (!featExists) {
      return {
        success: false,
        error: `Feat ${featUniqueId} not found in character feats`,
      };
    }

    this.character = {
      ...this.character,
      feats: this.character.feats.filter((f) => f.uniqueId !== featUniqueId),
    };

    this.notifyUpdate();
    return { success: true };
  }

  /** @deprecated Use new levels system instead */
  updateLevelFeat(level: number, featUniqueId: string, feat: Feat): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const levelData = this.character.level.levelsData.find(
      (ld) => ld.level === level
    );

    if (!levelData) {
      return {
        success: false,
        error: `Level ${level} not found`,
      };
    }

    const featIndex = levelData.levelFeats.findIndex(
      (f) => f.uniqueId === featUniqueId
    );

    if (featIndex === -1) {
      return {
        success: false,
        error: `Feat ${featUniqueId} not found at level ${level}`,
      };
    }

    this.character = {
      ...this.character,
      level: {
        ...this.character.level,
        levelsData: this.character.level.levelsData.map((ld) => {
          if (ld.level === level) {
            return {
              ...ld,
              levelFeats: ld.levelFeats.map((f, idx) => {
                if (idx === featIndex) {
                  return feat;
                }
                return f;
              }),
            };
          }
          return ld;
        }),
      },
    };

    this.notifyUpdate();
    return { success: true };
  }

  /** @deprecated Use new levels system instead */
  addLevelFeat(level: number, feat: Feat): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const levelData = this.character.level.levelsData.find(
      (ld) => ld.level === level
    );

    if (!levelData) {
      return {
        success: false,
        error: `Level ${level} not found`,
      };
    }

    const featExists = levelData.levelFeats.some(
      (f) => f.uniqueId === feat.uniqueId
    );

    if (featExists) {
      return {
        success: false,
        error: `Feat ${feat.uniqueId} already exists at level ${level}`,
      };
    }

    this.character = {
      ...this.character,
      level: {
        ...this.character.level,
        levelsData: this.character.level.levelsData.map((ld) => {
          if (ld.level === level) {
            return {
              ...ld,
              levelFeats: [...ld.levelFeats, feat],
            };
          }
          return ld;
        }),
      },
    };

    this.notifyUpdate();
    return { success: true };
  }

  /** @deprecated Use new levels system instead */
  removeLevelFeat(level: number, featUniqueId: string): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const levelData = this.character.level.levelsData.find(
      (ld) => ld.level === level
    );

    if (!levelData) {
      return {
        success: false,
        error: `Level ${level} not found`,
      };
    }

    const featExists = levelData.levelFeats.some(
      (f) => f.uniqueId === featUniqueId
    );

    if (!featExists) {
      return {
        success: false,
        error: `Feat ${featUniqueId} not found at level ${level}`,
      };
    }

    this.character = {
      ...this.character,
      level: {
        ...this.character.level,
        levelsData: this.character.level.levelsData.map((ld) => {
          if (ld.level === level) {
            return {
              ...ld,
              levelFeats: ld.levelFeats.filter(
                (f) => f.uniqueId !== featUniqueId
              ),
            };
          }
          return ld;
        }),
      },
    };

    this.notifyUpdate();
    return { success: true };
  }

  // =============================================================================
  // Custom Entities Management
  // =============================================================================

  addCustomEntity(entity: StandardEntity, entityType: string): UpdateResult {
    if (!this.character) return this.characterNotSet;

    if (entity.entityType !== entityType) {
      return {
        success: false,
        error: `Entity entityType "${entity.entityType}" does not match provided entityType "${entityType}"`,
      };
    }

    if (!this.character.customEntities) {
      this.character.customEntities = {};
    }

    if (!this.character.customEntities[entityType]) {
      this.character.customEntities[entityType] = [];
    }

    const entityExists = this.character.customEntities[entityType].some(
      (e) => e.id === entity.id
    );

    if (entityExists) {
      return {
        success: false,
        error: `Entity with id "${entity.id}" already exists in customEntities of type "${entityType}"`,
      };
    }

    this.character = {
      ...this.character,
      customEntities: {
        ...this.character.customEntities,
        [entityType]: [...this.character.customEntities[entityType], entity],
      },
    };

    this.notifyUpdate();
    return { success: true };
  }

  removeCustomEntity(entityId: string, entityType: string): UpdateResult {
    if (!this.character) return this.characterNotSet;

    if (!this.character.customEntities) {
      return {
        success: false,
        error: `No customEntities found in character`,
      };
    }

    if (!this.character.customEntities[entityType]) {
      return {
        success: false,
        error: `No entities of type "${entityType}" found in customEntities`,
      };
    }

    const entityExists = this.character.customEntities[entityType].some(
      (e) => e.id === entityId
    );

    if (!entityExists) {
      return {
        success: false,
        error: `Entity with id "${entityId}" not found in customEntities of type "${entityType}"`,
      };
    }

    const updatedEntities = this.character.customEntities[entityType].filter(
      (e) => e.id !== entityId
    );

    if (updatedEntities.length === 0) {
      const { [entityType]: _, ...rest } = this.character.customEntities;
      this.character = {
        ...this.character,
        customEntities: Object.keys(rest).length > 0 ? rest : undefined,
      };
    } else {
      this.character = {
        ...this.character,
        customEntities: {
          ...this.character.customEntities,
          [entityType]: updatedEntities,
        },
      };
    }

    this.notifyUpdate();
    return { success: true };
  }

  updateCustomEntity(
    entityId: string,
    entityType: string,
    entity: StandardEntity
  ): UpdateResult {
    if (!this.character) return this.characterNotSet;

    if (entity.entityType !== entityType) {
      return {
        success: false,
        error: `Entity entityType "${entity.entityType}" does not match provided entityType "${entityType}"`,
      };
    }

    if (entity.id !== entityId) {
      return {
        success: false,
        error: `Entity id "${entity.id}" does not match provided entityId "${entityId}"`,
      };
    }

    if (!this.character.customEntities) {
      return {
        success: false,
        error: `No customEntities found in character`,
      };
    }

    if (!this.character.customEntities[entityType]) {
      return {
        success: false,
        error: `No entities of type "${entityType}" found in customEntities`,
      };
    }

    const entityIndex = this.character.customEntities[entityType].findIndex(
      (e) => e.id === entityId
    );

    if (entityIndex === -1) {
      return {
        success: false,
        error: `Entity with id "${entityId}" not found in customEntities of type "${entityType}"`,
      };
    }

    this.character = {
      ...this.character,
      customEntities: {
        ...this.character.customEntities,
        [entityType]: this.character.customEntities[entityType].map((e, idx) =>
          idx === entityIndex ? entity : e
        ),
      },
    };

    this.notifyUpdate();
    return { success: true };
  }

  // =============================================================================
  // CGE (Spellcasting) Management
  // =============================================================================

  /**
   * Consume a slot from a CGE (e.g., cast a spell).
   * @param cgeId The CGE identifier (e.g., "wizard-spells")
   * @param level The spell level to consume
   */
  useSlotForCGE(cgeId: string, level: number): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const result = useSlot(this.character, cgeId, level);

    if (result.warnings.length > 0) {
      return { success: false, error: result.warnings[0].message };
    }

    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  /**
   * Refresh all slots for a CGE (e.g., after a long rest).
   * @param cgeId The CGE identifier (e.g., "wizard-spells")
   */
  refreshSlotsForCGE(cgeId: string): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const result = refreshSlots(this.character, cgeId);

    if (result.warnings.length > 0) {
      return { success: false, error: result.warnings[0].message };
    }

    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  /**
   * Prepare an entity in a specific slot (Vancian-style).
   * @param cgeId The CGE identifier
   * @param slotLevel The level of the slot
   * @param slotIndex The index of the slot at that level (0-based)
   * @param entityId The entity ID to prepare
   */
  prepareEntityForCGE(
    cgeId: string,
    slotLevel: number,
    slotIndex: number,
    entityId: string
  ): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const result = prepareEntityInSlot(
      this.character,
      cgeId,
      slotLevel,
      slotIndex,
      entityId
    );

    if (result.warnings.length > 0) {
      return { success: false, error: result.warnings[0].message };
    }

    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  /**
   * Remove preparation from a specific slot.
   * @param cgeId The CGE identifier
   * @param slotLevel The level of the slot
   * @param slotIndex The index of the slot at that level (0-based)
   */
  unprepareSlotForCGE(
    cgeId: string,
    slotLevel: number,
    slotIndex: number
  ): UpdateResult {
    if (!this.character) return this.characterNotSet;

    const result = unprepareSlot(this.character, cgeId, slotLevel, slotIndex);

    if (result.warnings.length > 0) {
      return { success: false, error: result.warnings[0].message };
    }

    this.character = result.character;
    this.notifyUpdate();
    return { success: true };
  }

  getCustomEntities(
    entityType?: string
  ): StandardEntity[] | Record<string, StandardEntity[]> {
    if (!this.character || !this.character.customEntities) {
      return entityType ? [] : {};
    }

    if (entityType) {
      return this.character.customEntities[entityType] || [];
    }

    return this.character.customEntities;
  }
}
