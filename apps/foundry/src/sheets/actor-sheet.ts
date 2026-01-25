/**
 * ZukusActorSheet - Character sheet for D&D 3.5e characters
 *
 * OPTION B: Form updates are intercepted and routed to @zukus/core operations.
 * The CharacterBaseData in flags is the source of truth.
 */

import { ZukusActor } from '../documents/actor';

export class ZukusActorSheet extends ActorSheet {
  /**
   * Default options for this sheet
   */
  static get defaultOptions(): ActorSheet.Options {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dnd35zukus', 'sheet', 'actor', 'character'],
      template: 'systems/dnd35zukus/templates/actor/character-sheet.hbs',
      width: 720,
      height: 680,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'abilities',
        },
      ],
      dragDrop: [{ dragSelector: '.item-list .item', dropSelector: null }],
    });
  }

  /**
   * Prepare data for rendering the sheet
   *
   * OPTION B: Read base values from flags.zukus.characterBaseData
   */
  getData(): ActorSheet.Data {
    const context = super.getData() as any;
    const zukusActor = this.actor as unknown as ZukusActor;

    // Add system data
    const actorData = this.actor.toObject(false) as any;
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Get CharacterBaseData from flags (Option B source of truth)
    context.characterBaseData = zukusActor.getCharacterBaseData();

    // Get calculated data (from ZukusActor.prepareDerivedData)
    context.calculated = (this.actor.system as any).calculated || {};
    context.sourceBreakdowns = (this.actor.system as any).sourceBreakdowns || {};

    // Prepare abilities array for template iteration
    context.abilities = this._prepareAbilities(context);

    // Prepare combat stats
    context.combat = this._prepareCombatStats(context);

    // Prepare saves
    context.saves = this._prepareSaves(context);

    // Organize items by type
    context.itemsByType = this._prepareItems();

    // Prepare class data for the character
    context.classes = this._prepareClasses(context);

    // Get available classes for adding
    context.availableClasses = ZukusActor.getAvailableClasses();

    // Character level
    context.characterLevel = zukusActor.getCharacterLevel();

    // Prepare buffs data
    context.currentBuffs = zukusActor.getBuffs();
    context.availableBuffs = ZukusActor.getAvailableBuffs();

    // Add config
    context.config = CONFIG.DND35ZUKUS || {};

    return context;
  }

  /**
   * Prepare classes data for template
   */
  private _prepareClasses(context: any): any[] {
    const characterData = context.characterBaseData;
    if (!characterData?.classEntities) {
      return [];
    }

    const zukusActor = this.actor as unknown as ZukusActor;

    return Object.entries(characterData.classEntities).map(([classId, classEntity]: [string, any]) => ({
      id: classId,
      name: classEntity.name,
      level: zukusActor.getClassLevel(classId),
      hitDie: classEntity.hitDie,
    }));
  }

  /**
   * Prepare abilities data for template
   *
   * OPTION B: Base values come from CharacterBaseData in flags
   */
  private _prepareAbilities(context: any): any[] {
    const abilityKeys = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;
    const baseData = context.characterBaseData?.baseAbilityData || {};
    const calculated = context.calculated?.abilities || {};

    return abilityKeys.map(key => ({
      key,
      label: game.i18n?.localize(`DND35ZUKUS.AbilityAbbr.${key}`) ?? key.substring(0, 3).toUpperCase(),
      fullLabel: game.i18n?.localize(`DND35ZUKUS.Ability.${key}`) ?? key,
      // Base value from CharacterBaseData (Option B source of truth)
      baseValue: baseData[key]?.baseScore ?? 10,
      // Calculated values from the sheet
      score: calculated[key]?.score ?? baseData[key]?.baseScore ?? 10,
      modifier: calculated[key]?.modifier ?? 0,
      modifierDisplay: calculated[key]?.modifierDisplay ?? '+0',
      sourceValues: context.sourceBreakdowns?.abilities?.[key] ?? [],
    }));
  }

  /**
   * Prepare combat stats for template
   */
  private _prepareCombatStats(context: any): any {
    const calculated = context.calculated || {};

    return {
      hp: {
        current: calculated.hp?.current ?? context.system.hp?.value ?? 0,
        max: calculated.hp?.max ?? context.system.hp?.max ?? 0,
        temp: calculated.hp?.temp ?? context.system.hp?.temp ?? 0,
      },
      ac: {
        total: calculated.ac?.total ?? 10,
        touch: calculated.ac?.touch ?? 10,
        flatFooted: calculated.ac?.flatFooted ?? 10,
      },
      bab: calculated.bab ?? 0,
      babDisplay: calculated.babDisplay ?? '+0',
      initiative: calculated.initiative ?? 0,
      initiativeDisplay: calculated.initiativeDisplay ?? '+0',
      grapple: calculated.grapple ?? 0,
      grappleDisplay: calculated.grappleDisplay ?? '+0',
    };
  }

  /**
   * Prepare saves for template
   */
  private _prepareSaves(context: any): any[] {
    const saves = context.calculated?.saves || {};

    return [
      {
        key: 'fortitude',
        label: game.i18n?.localize('DND35ZUKUS.Saves.Fortitude') ?? 'Fort',
        value: saves.fortitude ?? 0,
        display: saves.fortitudeDisplay ?? '+0',
        sourceValues: context.sourceBreakdowns?.saves?.fortitude ?? [],
      },
      {
        key: 'reflex',
        label: game.i18n?.localize('DND35ZUKUS.Saves.Reflex') ?? 'Ref',
        value: saves.reflex ?? 0,
        display: saves.reflexDisplay ?? '+0',
        sourceValues: context.sourceBreakdowns?.saves?.reflex ?? [],
      },
      {
        key: 'will',
        label: game.i18n?.localize('DND35ZUKUS.Saves.Will') ?? 'Will',
        value: saves.will ?? 0,
        display: saves.willDisplay ?? '+0',
        sourceValues: context.sourceBreakdowns?.saves?.will ?? [],
      },
    ];
  }

  /**
   * Organize items by type
   */
  private _prepareItems(): Record<string, Item[]> {
    const items = this.actor.items;

    return {
      classes: items.filter(i => i.type === 'class') as unknown as Item[],
      feats: items.filter(i => i.type === 'feat') as unknown as Item[],
      buffs: items.filter(i => i.type === 'buff') as unknown as Item[],
    };
  }

  /**
   * Activate event listeners on the sheet
   */
  activateListeners(html: JQuery): void {
    super.activateListeners(html);

    // Everything below here is only for editable sheets
    if (!this.isEditable) return;

    // Ability rolls
    html.find('.ability-card').on('click', this._onAbilityRoll.bind(this));

    // Save rolls
    html.find('.save-item.rollable').on('click', this._onSaveRoll.bind(this));

    // Initiative roll
    html.find('.initiative-roll').on('click', this._onInitiativeRoll.bind(this));

    // Item controls
    html.find('.item-create').on('click', this._onItemCreate.bind(this));
    html.find('.item-edit').on('click', this._onItemEdit.bind(this));
    html.find('.item-delete').on('click', this._onItemDelete.bind(this));

    // Class controls
    html.find('.add-class-level').on('click', this._onAddClassLevel.bind(this));
    html.find('.remove-level').on('click', this._onRemoveLevel.bind(this));
    html.find('.class-level-input').on('change', this._onClassLevelChange.bind(this));

    // Buff controls
    html.find('.add-buff').on('click', this._onAddBuff.bind(this));
    html.find('.toggle-buff').on('click', this._onToggleBuff.bind(this));
    html.find('.remove-buff').on('click', this._onRemoveBuff.bind(this));

    // Source breakdown tooltips
    html.find('[data-source-breakdown]').on('mouseenter', this._showSourceBreakdown.bind(this));
    html.find('[data-source-breakdown]').on('mouseleave', this._hideSourceBreakdown.bind(this));
  }

  /**
   * Handle ability check rolls
   */
  private async _onAbilityRoll(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    const abilityKey = event.currentTarget.dataset.ability;
    if (abilityKey) {
      await (this.actor as any).rollAbilityCheck(abilityKey);
    }
  }

  /**
   * Handle saving throw rolls
   */
  private async _onSaveRoll(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    const saveKey = event.currentTarget.dataset.save as 'fortitude' | 'reflex' | 'will';
    if (saveKey) {
      await (this.actor as any).rollSavingThrow(saveKey);
    }
  }

  /**
   * Handle initiative roll
   */
  private async _onInitiativeRoll(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    await (this.actor as any).rollInitiativeCheck();
  }

  /**
   * Handle item creation
   */
  private async _onItemCreate(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;

    const itemData = {
      name: `New ${type}`,
      type: type,
      system: {},
    };

    await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle item editing
   */
  private _onItemEdit(event: JQuery.ClickEvent): void {
    event.preventDefault();
    const li = $(event.currentTarget).closest('.item');
    const item = this.actor.items.get(li.data('itemId'));
    item?.sheet?.render(true);
  }

  /**
   * Handle item deletion
   */
  private async _onItemDelete(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    const li = $(event.currentTarget).closest('.item');
    const item = this.actor.items.get(li.data('itemId'));

    if (item) {
      await item.delete();
      li.slideUp(200);
    }
  }

  /**
   * Handle adding a class level
   */
  private async _onAddClassLevel(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    const classId = event.currentTarget.dataset.classId;

    if (!classId) {
      ui.notifications?.warn('No class selected');
      return;
    }

    const zukusActor = this.actor as unknown as ZukusActor;
    await zukusActor.addLevel(classId);

    // Re-render the sheet to show updated level
    this.render(false);
  }

  /**
   * Handle removing the last level
   */
  private async _onRemoveLevel(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();

    const zukusActor = this.actor as unknown as ZukusActor;
    const currentLevel = zukusActor.getCharacterLevel();

    if (currentLevel === 0) {
      ui.notifications?.warn('Character has no levels to remove');
      return;
    }

    // Confirm removal
    const confirmed = await Dialog.confirm({
      title: 'Remove Level',
      content: `<p>Remove level ${currentLevel}?</p>`,
    });

    if (confirmed) {
      await zukusActor.removeLevel();
      this.render(false);
    }
  }

  /**
   * Handle direct class level input change
   */
  private async _onClassLevelChange(event: JQuery.ChangeEvent): Promise<void> {
    event.preventDefault();
    const input = event.currentTarget as HTMLInputElement;
    const classId = input.dataset.classId;
    const newLevel = parseInt(input.value, 10);

    if (!classId || isNaN(newLevel) || newLevel < 0) {
      ui.notifications?.warn('Invalid level value');
      return;
    }

    const zukusActor = this.actor as unknown as ZukusActor;
    await zukusActor.setClassLevel(classId, newLevel);
    this.render(false);
  }

  /**
   * Handle adding a buff from compendium entity
   */
  private async _onAddBuff(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    const entityId = event.currentTarget.dataset.buffId;

    if (!entityId) {
      ui.notifications?.warn('No buff selected');
      return;
    }

    const zukusActor = this.actor as unknown as ZukusActor;
    await zukusActor.addBuffFromEntity(entityId);
    this.render(false);
  }

  /**
   * Handle toggling a buff on/off
   */
  private async _onToggleBuff(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    const buffId = event.currentTarget.dataset.buffId;

    if (!buffId) {
      ui.notifications?.warn('No buff selected');
      return;
    }

    const zukusActor = this.actor as unknown as ZukusActor;
    await zukusActor.toggleBuff(buffId);
    this.render(false);
  }

  /**
   * Handle removing a buff
   */
  private async _onRemoveBuff(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    const buffId = event.currentTarget.dataset.buffId;

    if (!buffId) {
      ui.notifications?.warn('No buff selected');
      return;
    }

    const zukusActor = this.actor as unknown as ZukusActor;
    await zukusActor.removeBuff(buffId);
    this.render(false);
  }

  /**
   * Handle dropping an Item onto the actor sheet.
   * Intercept buff drops and route to @zukus/core operations.
   */
  protected async _onDropItem(
    event: DragEvent,
    data: { type: string; uuid?: string }
  ): Promise<Item[] | boolean> {
    // Get the dropped item
    if (!data.uuid) return super._onDropItem(event, data);

    const item = await fromUuid(data.uuid) as Item | null;
    if (!item) return super._onDropItem(event, data);

    // Check if it's a buff from our compendium
    if (item.type === 'buff') {
      const systemData = item.system as any;
      const coreEntityId = systemData?.coreEntityId;

      if (coreEntityId) {
        // Use @zukus/core to add the buff
        const zukusActor = this.actor as unknown as ZukusActor;
        await zukusActor.addBuffFromEntity(coreEntityId);
        this.render(false);
        return []; // Prevent default item creation
      }
    }

    // For other item types, use default behavior
    return super._onDropItem(event, data);
  }

  /**
   * OPTION B: Intercept form updates and route to @zukus/core operations.
   *
   * Instead of letting Foundry update Actor.system directly,
   * we map form changes to operations on CharacterBaseData.
   */
  protected async _updateObject(
    event: Event,
    formData: Record<string, unknown>
  ): Promise<void> {
    const zukusActor = this.actor as unknown as ZukusActor;

    // Process ability score changes
    const abilityKeys = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;

    for (const ability of abilityKeys) {
      const formKey = `system.abilities.${ability}.value`;
      if (formKey in formData) {
        const newValue = Number(formData[formKey]);
        if (!isNaN(newValue)) {
          await zukusActor.updateAbilityScore(ability, newValue);
          // Remove from formData so Foundry doesn't also update it
          delete formData[formKey];
        }
      }
    }

    // Process HP changes (current HP via damage tracking)
    if ('system.hp.value' in formData) {
      const newHpValue = Number(formData['system.hp.value']);
      const sheet = zukusActor.getCalculatedSheet();
      if (sheet && !isNaN(newHpValue)) {
        const currentHp = sheet.hitPoints.currentHp;
        const hpChange = newHpValue - currentHp;
        if (hpChange !== 0) {
          await zukusActor.modifyHp(hpChange);
        }
      }
      delete formData['system.hp.value'];
    }

    // Let Foundry handle any remaining updates (like name, biography, etc.)
    // These don't affect CharacterBaseData calculations
    const remainingKeys = Object.keys(formData).filter(
      (key) => !key.startsWith('flags.zukus')
    );

    if (remainingKeys.length > 0) {
      // Filter to only pass non-zukus data to parent
      const filteredData: Record<string, unknown> = {};
      for (const key of remainingKeys) {
        filteredData[key] = formData[key];
      }
      await super._updateObject(event, filteredData);
    }
  }

  /**
   * Show source breakdown tooltip
   */
  private _showSourceBreakdown(event: JQuery.MouseEnterEvent): void {
    const element = event.currentTarget;
    const breakdownKey = element.dataset.sourceBreakdown;
    if (!breakdownKey) return;

    const sourceBreakdowns = (this.actor.system as any).sourceBreakdowns || {};
    let sources: any[] = [];

    // Navigate to the correct breakdown data
    const keys = breakdownKey.split('.');
    let current: any = sourceBreakdowns;
    for (const key of keys) {
      current = current?.[key];
    }
    if (Array.isArray(current)) {
      sources = current;
    }

    if (sources.length === 0) return;

    // Create tooltip HTML
    const tooltipHtml = `
      <div class="source-breakdown">
        ${sources.map(s => `
          <div class="source-item ${s.relevant === false ? 'irrelevant' : ''}">
            <span class="source-name">${s.sourceName || 'Unknown'}</span>
            <span class="source-value">${s.value >= 0 ? '+' : ''}${s.value}</span>
          </div>
        `).join('')}
      </div>
    `;

    // Position and show tooltip
    const tooltip = $(tooltipHtml);
    $('body').append(tooltip);

    const rect = element.getBoundingClientRect();
    tooltip.css({
      position: 'fixed',
      left: rect.right + 10,
      top: rect.top,
    });
  }

  /**
   * Hide source breakdown tooltip
   */
  private _hideSourceBreakdown(): void {
    $('.source-breakdown').remove();
  }
}
