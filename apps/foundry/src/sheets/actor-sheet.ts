/**
 * ZukusActorSheet - Character sheet for D&D 3.5e characters
 */

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
   */
  getData(): ActorSheet.Data {
    const context = super.getData() as any;

    // Add system data
    const actorData = this.actor.toObject(false) as any;
    context.system = actorData.system;
    context.flags = actorData.flags;

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

    // Add config
    context.config = CONFIG.DND35ZUKUS || {};

    return context;
  }

  /**
   * Prepare abilities data for template
   */
  private _prepareAbilities(context: any): any[] {
    const abilityKeys = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    const abilities = context.system.abilities || {};
    const calculated = context.calculated?.abilities || {};

    return abilityKeys.map(key => ({
      key,
      label: game.i18n?.localize(`DND35ZUKUS.AbilityAbbr.${key}`) ?? key.substring(0, 3).toUpperCase(),
      fullLabel: game.i18n?.localize(`DND35ZUKUS.Ability.${key}`) ?? key,
      baseValue: abilities[key]?.value ?? 10,
      score: calculated[key]?.score ?? abilities[key]?.value ?? 10,
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
