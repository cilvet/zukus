/**
 * ZukusActor - Custom Actor class that uses @zukus/core for calculations
 */

import { calculateCharacterSheet } from '@zukus/core';
import { foundryActorToZukusData } from '../adapters/foundry-to-core';
import { zukusSheetToFoundryUpdate, formatModifier } from '../adapters/core-to-foundry';

export class ZukusActor extends Actor {
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
   */
  prepareDerivedData(): void {
    super.prepareDerivedData();

    if (this.type !== 'character') return;

    try {
      // Convert Foundry data to Zukus format
      const zukusData = foundryActorToZukusData(this as any);

      // Calculate using @zukus/core
      const sheet = calculateCharacterSheet(zukusData);

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
        bab: sheet.baseAttackBonus.sourceValues,
        saves: {
          fortitude: sheet.savingThrows.fortitude.sourceValues,
          reflex: sheet.savingThrows.reflex.sourceValues,
          will: sheet.savingThrows.will.sourceValues,
        },
        initiative: sheet.initiative.sourceValues,
      };

      // Update HP max from calculation
      systemData.hp.max = sheet.hitPoints.maxHp;
      systemData.hp.value = sheet.hitPoints.currentHp;

      console.log('Zukus | Character calculated:', this.name, systemData.calculated);
    } catch (error) {
      console.error('Zukus | Error calculating character:', error);
    }
  }

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
    const label = game.i18n?.localize(`DND35ZUKUS.Saves.${saveKey.charAt(0).toUpperCase() + saveKey.slice(1)}`) ?? saveKey;

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
