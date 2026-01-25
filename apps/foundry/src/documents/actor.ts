/**
 * ZukusActor - Custom Actor class that uses @zukus/core for calculations
 *
 * OPTION B ARCHITECTURE:
 * - CharacterBaseData is stored in actor.flags.zukus.characterBaseData
 * - This is the source of truth, same format as Zukus app
 * - All calculations read from flags, not from actor.system
 * - Updates are done via @zukus/core operations (ops.*)
 */

import {
  calculateCharacterSheet,
  buildCharacter,
  CharacterBaseData,
  CharacterSheet,
  CharacterUpdater,
  ops,
  Buff,
} from '@zukus/core';
import { formatModifier } from '../adapters/core-to-foundry';
import {
  foundryCompendiumContext,
  getAvailableClasses,
  getSystemLevels,
  getAvailableBuffs,
  createBuffFromEntity,
} from '../compendium/foundry-compendium-context';
import { pushLocalChanges, isSyncing } from '../supabase/sync-manager';
import { isLoggedIn } from '../supabase/auth';

// Type for the flags we store
type ZukusFlags = {
  characterBaseData?: CharacterBaseData;
  zukusCharacterId?: string;  // ID of the linked character in Supabase
};

export class ZukusActor extends Actor {
  /**
   * Get the CharacterBaseData from flags.
   * This is the source of truth for Option B.
   */
  getCharacterBaseData(): CharacterBaseData | undefined {
    const flags = this.flags as { zukus?: ZukusFlags };
    return flags.zukus?.characterBaseData;
  }

  /**
   * Set the CharacterBaseData in flags.
   * Use this to update the character after applying operations.
   * If linked to Zukus and syncing, will push changes to cloud.
   */
  async setCharacterBaseData(data: CharacterBaseData): Promise<void> {
    await this.update({
      'flags.zukus.characterBaseData': data,
    });

    // If linked and syncing, push to Supabase
    if (this.isLinkedToZukus() && isLoggedIn() && isSyncing(this.id)) {
      pushLocalChanges(this.id, data);
    }
  }

  // ============================================
  // Zukus Cloud Sync Methods
  // ============================================

  /**
   * Get the linked Zukus character ID (from Supabase).
   */
  getZukusCharacterId(): string | null {
    const flags = this.flags as { zukus?: ZukusFlags };
    return flags.zukus?.zukusCharacterId ?? null;
  }

  /**
   * Set the linked Zukus character ID.
   * Call this when linking to a cloud character.
   */
  async setZukusCharacterId(id: string | null): Promise<void> {
    await this.update({
      'flags.zukus.zukusCharacterId': id,
    });
  }

  /**
   * Check if this actor is linked to a Zukus cloud character.
   */
  isLinkedToZukus(): boolean {
    return this.getZukusCharacterId() !== null;
  }

  /**
   * Called when a new actor is created.
   * Initialize with default CharacterBaseData.
   */
  protected async _onCreate(
    data: foundry.documents.BaseActor.ConstructorData,
    options: DocumentModificationContext<Actor>,
    userId: string
  ): Promise<void> {
    await super._onCreate(data, options, userId);

    // Only initialize if this is a character and we don't have data yet
    if (this.type !== 'character') return;
    if (this.getCharacterBaseData()) return;

    console.log('Zukus | Creating default CharacterBaseData for:', this.name);

    // Create default character data using buildCharacter from core
    // This properly initializes systemLevelsEntity and all required fields
    const defaultData = buildCharacter()
      .withName(this.name)
      .build();

    // Store in flags
    await this.update({
      'flags.zukus.characterBaseData': defaultData,
    });
  }

  /**
   * Prepare data for the actor.
   * Called whenever the actor is updated.
   */
  prepareData(): void {
    super.prepareData();
  }

  /**
   * Prepare base data before embedded documents are prepared.
   */
  prepareBaseData(): void {
    super.prepareBaseData();
  }

  /**
   * Prepare derived data using @zukus/core.
   * This is called AFTER active effects are applied.
   *
   * OPTION B: Read from flags.zukus.characterBaseData
   */
  prepareDerivedData(): void {
    super.prepareDerivedData();

    if (this.type !== 'character') return;

    // Get CharacterBaseData from flags (Option B source of truth)
    const characterData = this.getCharacterBaseData();

    if (!characterData) {
      // No data yet - will be created in _onCreate
      console.log('Zukus | No CharacterBaseData yet for:', this.name);
      return;
    }

    try {
      // Calculate using @zukus/core
      const sheet = calculateCharacterSheet(characterData);

      // Store calculated values in system data (for display, not persistence)
      const systemData = this.system as any;

      // Update calculated display data
      systemData.calculated = {
        abilities: {
          strength: {
            score: sheet.abilityScores.strength.totalScore,
            modifier: sheet.abilityScores.strength.totalModifier,
            modifierDisplay: formatModifier(sheet.abilityScores.strength.totalModifier),
          },
          dexterity: {
            score: sheet.abilityScores.dexterity.totalScore,
            modifier: sheet.abilityScores.dexterity.totalModifier,
            modifierDisplay: formatModifier(sheet.abilityScores.dexterity.totalModifier),
          },
          constitution: {
            score: sheet.abilityScores.constitution.totalScore,
            modifier: sheet.abilityScores.constitution.totalModifier,
            modifierDisplay: formatModifier(sheet.abilityScores.constitution.totalModifier),
          },
          intelligence: {
            score: sheet.abilityScores.intelligence.totalScore,
            modifier: sheet.abilityScores.intelligence.totalModifier,
            modifierDisplay: formatModifier(sheet.abilityScores.intelligence.totalModifier),
          },
          wisdom: {
            score: sheet.abilityScores.wisdom.totalScore,
            modifier: sheet.abilityScores.wisdom.totalModifier,
            modifierDisplay: formatModifier(sheet.abilityScores.wisdom.totalModifier),
          },
          charisma: {
            score: sheet.abilityScores.charisma.totalScore,
            modifier: sheet.abilityScores.charisma.totalModifier,
            modifierDisplay: formatModifier(sheet.abilityScores.charisma.totalModifier),
          },
        },
        hp: {
          current: sheet.hitPoints.currentHp,
          max: sheet.hitPoints.maxHp,
          temp: sheet.hitPoints.temporaryHp,
        },
        ac: {
          total: sheet.armorClass.totalAc.totalValue,
          touch: sheet.armorClass.touchAc.totalValue,
          flatFooted: sheet.armorClass.flatFootedAc.totalValue,
        },
        bab: sheet.baseAttackBonus.totalValue,
        babDisplay: formatModifier(sheet.baseAttackBonus.totalValue),
        initiative: sheet.initiative.totalValue,
        initiativeDisplay: formatModifier(sheet.initiative.totalValue),
        saves: {
          fortitude: sheet.savingThrows.fortitude.totalValue,
          fortitudeDisplay: formatModifier(sheet.savingThrows.fortitude.totalValue),
          reflex: sheet.savingThrows.reflex.totalValue,
          reflexDisplay: formatModifier(sheet.savingThrows.reflex.totalValue),
          will: sheet.savingThrows.will.totalValue,
          willDisplay: formatModifier(sheet.savingThrows.will.totalValue),
        },
        grapple: sheet.grapple.totalValue,
        grappleDisplay: formatModifier(sheet.grapple.totalValue),
        size: sheet.size.currentSize,
      };

      // Store source breakdowns for tooltips
      systemData.sourceBreakdowns = {
        abilities: {
          strength: sheet.abilityScores.strength.sourceValues,
          dexterity: sheet.abilityScores.dexterity.sourceValues,
          constitution: sheet.abilityScores.constitution.sourceValues,
          intelligence: sheet.abilityScores.intelligence.sourceValues,
          wisdom: sheet.abilityScores.wisdom.sourceValues,
          charisma: sheet.abilityScores.charisma.sourceValues,
        },
        ac: sheet.armorClass.totalAc.sourceValues,
        touchAc: sheet.armorClass.touchAc.sourceValues,
        flatFootedAc: sheet.armorClass.flatFootedAc.sourceValues,
        bab: sheet.baseAttackBonus.sourceValues,
        saves: {
          fortitude: sheet.savingThrows.fortitude.sourceValues,
          reflex: sheet.savingThrows.reflex.sourceValues,
          will: sheet.savingThrows.will.sourceValues,
        },
        initiative: sheet.initiative.sourceValues,
        grapple: sheet.grapple.sourceValues,
      };

      // Store attack data for the attacks section
      systemData.attackData = {
        attacks: sheet.attackData.attacks,
        attackContextChanges: sheet.attackData.attackContextChanges,
        attackChanges: sheet.attackData.attackChanges,
      };

      // Sync HP values to system for token display
      systemData.hp.max = sheet.hitPoints.maxHp;
      systemData.hp.value = sheet.hitPoints.currentHp;

      console.log('Zukus | Character calculated from flags:', this.name);
    } catch (error) {
      console.error('Zukus | Error calculating character:', error);
    }
  }

  // ============================================
  // Operations using @zukus/core ops
  // These modify the CharacterBaseData directly
  // Operations return { character, warnings }
  // ============================================

  /**
   * Update an ability base score.
   * Note: No ops for this, we modify directly.
   */
  async updateAbilityScore(
    ability: 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma',
    newScore: number
  ): Promise<void> {
    const data = this.getCharacterBaseData();
    if (!data) return;

    // Direct modification (no ops for abilities yet)
    const updated: CharacterBaseData = {
      ...data,
      baseAbilityData: {
        ...data.baseAbilityData,
        [ability]: {
          ...data.baseAbilityData[ability],
          baseScore: newScore,
        },
      },
    };

    await this.setCharacterBaseData(updated);
  }

  /**
   * Modify HP (positive = heal, negative = damage)
   */
  async modifyHp(amount: number): Promise<void> {
    const data = this.getCharacterBaseData();
    if (!data) return;

    // Get max HP from calculated sheet
    const sheet = calculateCharacterSheet(data);
    const maxHp = sheet.hitPoints.maxHp;

    const result = ops.modifyHp(data, amount, maxHp);
    await this.setCharacterBaseData(result.character);

    // Log warnings if any
    if (result.warnings.length > 0) {
      console.warn('Zukus | HP modification warnings:', result.warnings);
    }
  }

  /**
   * Toggle a buff on/off
   */
  async toggleBuff(buffId: string): Promise<void> {
    const data = this.getCharacterBaseData();
    if (!data) return;

    const result = ops.toggleBuff(data, buffId);
    await this.setCharacterBaseData(result.character);

    if (result.warnings.length > 0) {
      ui.notifications?.warn(result.warnings[0].message);
    }
  }

  /**
   * Add a new buff
   */
  async addBuff(buff: Buff): Promise<void> {
    const data = this.getCharacterBaseData();
    if (!data) return;

    const result = ops.addBuff(data, buff);
    await this.setCharacterBaseData(result.character);

    if (result.warnings.length > 0) {
      ui.notifications?.warn(result.warnings[0].message);
    }
  }

  /**
   * Remove a buff
   */
  async removeBuff(buffId: string): Promise<void> {
    const data = this.getCharacterBaseData();
    if (!data) return;

    const result = ops.deleteBuff(data, buffId);
    await this.setCharacterBaseData(result.character);

    if (result.warnings.length > 0) {
      ui.notifications?.warn(result.warnings[0].message);
    }
  }

  /**
   * Add a buff from a compendium entity.
   * Creates a new buff instance from the compendium entity.
   *
   * @param entityId - ID of the buff entity (e.g., 'buff-bulls-strength')
   */
  async addBuffFromEntity(entityId: string): Promise<void> {
    const buff = createBuffFromEntity(entityId);

    if (!buff) {
      ui.notifications?.warn(`Unknown buff entity: ${entityId}`);
      return;
    }

    await this.addBuff(buff);
  }

  /**
   * Get list of available buff templates from the compendium
   */
  static getAvailableBuffs() {
    return getAvailableBuffs();
  }

  /**
   * Get the character's current buffs
   */
  getBuffs(): Buff[] {
    const data = this.getCharacterBaseData();
    return data?.buffs ?? [];
  }

  /**
   * Get the calculated sheet (for operations that need maxHp, etc.)
   */
  getCalculatedSheet(): CharacterSheet | null {
    const data = this.getCharacterBaseData();
    if (!data) return null;

    try {
      return calculateCharacterSheet(data);
    } catch (error) {
      console.error('Zukus | Error calculating sheet:', error);
      return null;
    }
  }

  // ============================================
  // Class & Level Operations
  // ============================================

  /**
   * Get list of available classes from the compendium
   */
  static getAvailableClasses() {
    return getAvailableClasses();
  }

  /**
   * Add a class to the character.
   * This copies the class definition to the character and resolves granted entities.
   */
  async addClass(classId: string): Promise<void> {
    const data = this.getCharacterBaseData();
    if (!data) return;

    const result = ops.addClass(data, classId, foundryCompendiumContext);

    if (result.warnings.length > 0) {
      for (const warning of result.warnings) {
        console.warn('Zukus | addClass warning:', warning.message);
        ui.notifications?.warn(warning.message);
      }
    }

    await this.setCharacterBaseData(result.character);
  }

  /**
   * Remove a class from the character.
   * This removes the class and all entities granted by it.
   */
  async removeClass(classId: string): Promise<void> {
    const data = this.getCharacterBaseData();
    if (!data) return;

    const result = ops.removeClass(data, classId);

    if (result.warnings.length > 0) {
      for (const warning of result.warnings) {
        console.warn('Zukus | removeClass warning:', warning.message);
        ui.notifications?.warn(warning.message);
      }
    }

    await this.setCharacterBaseData(result.character);
  }

  /**
   * Add a level to the character.
   * This adds a level slot and assigns it to a class.
   * Uses CharacterUpdater to ensure proper state management.
   *
   * @param classId - The class to take this level in
   * @param hpRoll - The HP roll for this level (default: average)
   */
  async addLevel(classId: string, hpRoll?: number): Promise<void> {
    let data = this.getCharacterBaseData();
    if (!data) return;

    // Ensure the class is added to the character first
    if (!data.classEntities || !data.classEntities[classId]) {
      const addResult = ops.addClass(data, classId, foundryCompendiumContext);
      data = addResult.character;

      if (addResult.warnings.length > 0) {
        for (const warning of addResult.warnings) {
          console.warn('Zukus | addClass warning:', warning.message);
        }
      }
    }

    // Note: systemLevelsEntity is set by buildCharacter() on actor creation
    // If somehow missing, set it now
    if (!data.systemLevelsEntity) {
      const systemLevels = getSystemLevels();
      if (systemLevels) {
        data = { ...data, systemLevelsEntity: systemLevels as any };
      }
    }

    // Add a level slot
    const slotResult = ops.addLevelSlot(data);
    data = slotResult.character;

    // Get the new slot index
    const slotIndex = (data.levelSlots?.length ?? 1) - 1;

    // Assign the class to the slot
    const classResult = ops.setLevelSlotClass(data, slotIndex, classId);
    data = classResult.character;

    if (classResult.warnings.length > 0) {
      for (const warning of classResult.warnings) {
        console.warn('Zukus | setLevelSlotClass warning:', warning.message);
        ui.notifications?.warn(warning.message);
      }
    }

    // Set HP roll (default to average if not specified)
    const classEntity = data.classEntities?.[classId];
    const hitDie = classEntity?.hitDie ?? 10;
    const actualHpRoll = hpRoll ?? Math.ceil(hitDie / 2);

    const hpResult = ops.setLevelSlotHp(data, slotIndex, actualHpRoll);
    data = hpResult.character;

    // IMPORTANT: Update character.level.level to match levelSlots count
    // This is required because the calculation uses character.level.level
    // to determine how many levelSlots to process
    const newLevel = data.levelSlots?.length ?? 0;
    data = {
      ...data,
      level: {
        ...data.level,
        level: newLevel,
      },
    };

    await this.setCharacterBaseData(data);

    console.log(`Zukus | Added level ${newLevel} as ${classId}`);
  }

  /**
   * Remove the last level from the character.
   */
  async removeLevel(): Promise<void> {
    let data = this.getCharacterBaseData();
    if (!data) return;

    const result = ops.removeLastLevelSlot(data);
    data = result.character;

    if (result.warnings.length > 0) {
      for (const warning of result.warnings) {
        console.warn('Zukus | removeLevel warning:', warning.message);
        ui.notifications?.warn(warning.message);
      }
    }

    // Update character.level.level to match levelSlots count
    const newLevel = data.levelSlots?.length ?? 0;
    data = {
      ...data,
      level: {
        ...data.level,
        level: newLevel,
      },
    };

    await this.setCharacterBaseData(data);
  }

  /**
   * Get the character's current level
   */
  getCharacterLevel(): number {
    const data = this.getCharacterBaseData();
    if (!data) return 0;
    return ops.getCharacterLevel(data);
  }

  /**
   * Get the character's level in a specific class
   */
  getClassLevel(classId: string): number {
    const data = this.getCharacterBaseData();
    if (!data) return 0;
    return ops.getClassLevel(data, classId);
  }

  /**
   * Set the level in a specific class.
   * Will add or remove levels as needed.
   *
   * @param classId - The class to set level for
   * @param targetLevel - The desired level in that class
   */
  async setClassLevel(classId: string, targetLevel: number): Promise<void> {
    let data = this.getCharacterBaseData();
    if (!data) return;

    const currentClassLevel = ops.getClassLevel(data, classId);
    const diff = targetLevel - currentClassLevel;

    if (diff === 0) return;

    // Ensure the class is added first
    if (!data.classEntities || !data.classEntities[classId]) {
      const addResult = ops.addClass(data, classId, foundryCompendiumContext);
      data = addResult.character;
    }

    // Ensure systemLevelsEntity is set
    if (!data.systemLevelsEntity) {
      const systemLevels = getSystemLevels();
      if (systemLevels) {
        data = { ...data, systemLevelsEntity: systemLevels as any };
      }
    }

    if (diff > 0) {
      // Add levels
      for (let i = 0; i < diff; i++) {
        const slotResult = ops.addLevelSlot(data);
        data = slotResult.character;

        const slotIndex = (data.levelSlots?.length ?? 1) - 1;

        const classResult = ops.setLevelSlotClass(data, slotIndex, classId);
        data = classResult.character;

        // Set average HP
        const classEntity = data.classEntities?.[classId];
        const hitDie = classEntity?.hitDie ?? 10;
        const hpRoll = Math.ceil(hitDie / 2);

        const hpResult = ops.setLevelSlotHp(data, slotIndex, hpRoll);
        data = hpResult.character;
      }
    } else {
      // Remove levels (from the end, only for this class)
      const levelsToRemove = Math.abs(diff);
      let removed = 0;

      // Find and remove level slots for this class (from end to start)
      while (removed < levelsToRemove && data.levelSlots && data.levelSlots.length > 0) {
        const lastIndex = data.levelSlots.length - 1;
        const lastSlot = data.levelSlots[lastIndex];

        if (lastSlot.classId === classId) {
          const result = ops.removeLastLevelSlot(data);
          data = result.character;
          removed++;
        } else {
          // Need to find and swap slots - for now just remove from end
          // This is a simplification; a more complex implementation would reorder
          const result = ops.removeLastLevelSlot(data);
          data = result.character;
          removed++;
        }
      }
    }

    // IMPORTANT: Update character.level.level to match levelSlots count
    const newTotalLevel = data.levelSlots?.length ?? 0;
    data = {
      ...data,
      level: {
        ...data.level,
        level: newTotalLevel,
      },
    };

    await this.setCharacterBaseData(data);
    console.log(`Zukus | Set ${classId} level to ${targetLevel} (total level: ${newTotalLevel})`);
  }

  // ============================================
  // Roll methods (unchanged from before)
  // ============================================

  /**
   * Roll an ability check
   */
  async rollAbilityCheck(abilityKey: string): Promise<void> {
    const calculated = (this.system as any).calculated;
    if (!calculated?.abilities?.[abilityKey]) {
      ui.notifications?.warn(`Unknown ability: ${abilityKey}`);
      return;
    }

    const ability = calculated.abilities[abilityKey];
    const label = game.i18n?.localize(`DND35ZUKUS.Ability.${abilityKey}`) ?? abilityKey;

    const roll = new Roll('1d20 + @mod', { mod: ability.modifier });
    await roll.evaluate();

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${label} Check`,
    });
  }

  /**
   * Roll a saving throw
   */
  async rollSavingThrow(saveKey: 'fortitude' | 'reflex' | 'will'): Promise<void> {
    const calculated = (this.system as any).calculated;
    if (!calculated?.saves?.[saveKey]) {
      ui.notifications?.warn(`Unknown save: ${saveKey}`);
      return;
    }

    const save = calculated.saves[saveKey];
    const label =
      game.i18n?.localize(`DND35ZUKUS.Saves.${saveKey.charAt(0).toUpperCase() + saveKey.slice(1)}`) ?? saveKey;

    const roll = new Roll('1d20 + @mod', { mod: save });
    await roll.evaluate();

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${label} Save`,
    });
  }

  /**
   * Roll initiative
   */
  async rollInitiativeCheck(): Promise<void> {
    const calculated = (this.system as any).calculated;
    const initiative = calculated?.initiative ?? 0;

    const roll = new Roll('1d20 + @mod', { mod: initiative });
    await roll.evaluate();

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: 'Initiative',
    });
  }
}
