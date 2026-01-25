/**
 * ZukusActorSheet - Character sheet for D&D 3.5e characters
 *
 * OPTION B: Form updates are intercepted and routed to @zukus/core operations.
 * The CharacterBaseData in flags is the source of truth.
 */

import { ZukusActor } from '../documents/actor';
import { formatModifier } from '../adapters/core-to-foundry';
import type { CalculatedAttack, AttackContextualChange } from '@zukus/core';
import { getAuthState, onAuthStateChange, isLoggedIn } from '../supabase/auth';
import { openLoginDialog, logoutFromZukus } from '../dialogs/login-dialog';
import { openLinkCharacterDialog, unlinkCharacter } from '../dialogs/link-character-dialog';
import { startSync, stopSync, isSyncing } from '../supabase/sync-manager';

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
   * Start syncing when the sheet is rendered (if linked)
   */
  protected async _render(force?: boolean, options?: RenderOptions): Promise<void> {
    await super._render(force, options);

    const zukusActor = this.actor as unknown as ZukusActor;
    const zukusCharacterId = zukusActor.getZukusCharacterId();

    // Start sync if linked, logged in, and not already syncing
    if (zukusCharacterId && isLoggedIn() && !isSyncing(this.actor.id)) {
      startSync(this.actor.id, zukusCharacterId, async (remoteData) => {
        // Apply remote changes to the actor
        console.log('[Zukus] Applying remote changes to actor');
        await zukusActor.setCharacterBaseData(remoteData);
        // Re-render the sheet to show updated data
        this.render(false);
      });
    }
  }

  /**
   * Stop syncing when the sheet is closed
   */
  async close(options?: FormApplication.CloseOptions): Promise<void> {
    stopSync(this.actor.id);
    return super.close(options);
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

    // Prepare attack data
    context.attacks = this._prepareAttacks(context);

    // Prepare class data for the character
    context.classes = this._prepareClasses(context);

    // Get available classes for adding
    context.availableClasses = ZukusActor.getAvailableClasses();

    // Character level
    context.characterLevel = zukusActor.getCharacterLevel();

    // Prepare buffs data
    context.currentBuffs = zukusActor.getBuffs();
    context.availableBuffs = ZukusActor.getAvailableBuffs();

    // Store raw attack data for modal usage
    context.attackData = (this.actor.system as any).attackData || {
      attacks: [],
      attackContextChanges: [],
      attackChanges: [],
    };

    // Add config
    context.config = CONFIG.DND35ZUKUS || {};

    // Add auth state for Zukus sync
    const authState = getAuthState();
    context.isLoggedIn = authState.session !== null;
    context.userEmail = authState.user?.email ?? null;

    // Add link state
    context.isLinked = zukusActor.isLinkedToZukus();
    context.linkedCharacterId = zukusActor.getZukusCharacterId();
    context.isSyncing = isSyncing(this.actor.id);

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
   * Prepare attacks data for template
   */
  private _prepareAttacks(context: any): any[] {
    const attackData = (this.actor.system as any).attackData;
    if (!attackData?.attacks) {
      return [];
    }

    return attackData.attacks.map((attack: CalculatedAttack, index: number) => ({
      index,
      name: attack.name,
      type: attack.type,
      typeLabel: this._getAttackTypeLabel(attack.type),
      attackBonus: attack.attackBonus.totalValue,
      attackBonusDisplay: formatModifier(attack.attackBonus.totalValue),
      damageDisplay: this._formatDamage(attack.damage),
      criticalDamageDisplay: this._formatDamage(attack.criticalDamage),
      sourceValues: attack.attackBonus.sourceValues,
      weaponUniqueId: attack.weaponUniqueId,
    }));
  }

  /**
   * Get human-readable attack type label
   */
  private _getAttackTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      melee: 'Melee',
      ranged: 'Ranged',
      meleeTouch: 'Melee Touch',
      rangedTouch: 'Ranged Touch',
      spell: 'Spell',
      spellLike: 'Spell-Like',
    };
    return labels[type] || type;
  }

  /**
   * Format damage formula for display
   */
  private _formatDamage(damage: any): string {
    if (!damage) return '-';
    // DamageFormula can be ComplexDamageSection or SimpleDamageSectionWithType
    if (damage.type === 'complex' && damage.baseDamage) {
      return damage.name ?? damage.baseDamage.name ?? 'Damage';
    }
    if (damage.type === 'simple' && damage.formula) {
      return damage.formula.expression ?? damage.name ?? 'Damage';
    }
    return damage.name ?? '-';
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

    // Attack controls
    html.find('.attack-item').on('click', this._onAttackClick.bind(this));
    html.find('.attack-roll').on('click', this._onAttackRoll.bind(this));

    // Import/Export controls
    html.find('.import-character').on('click', this._onImportCharacter.bind(this));
    html.find('.export-character').on('click', this._onExportCharacter.bind(this));

    // Zukus sync controls
    html.find('.zukus-login').on('click', this._onZukusLogin.bind(this));
    html.find('.zukus-logout').on('click', this._onZukusLogout.bind(this));
    html.find('.zukus-link').on('click', this._onZukusLink.bind(this));
    html.find('.zukus-unlink').on('click', this._onZukusUnlink.bind(this));

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
   * Handle attack click - open modal with contextual changes
   */
  private async _onAttackClick(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    const attackIndex = Number(event.currentTarget.dataset.attackIndex);

    const attackData = (this.actor.system as any).attackData;
    if (!attackData?.attacks?.[attackIndex]) return;

    const attack = attackData.attacks[attackIndex];
    const contextChanges = attackData.attackContextChanges || [];

    // Filter contextual changes applicable to this attack type
    const applicableChanges = contextChanges.filter(
      (change: AttackContextualChange) =>
        change.appliesTo === 'all' || change.appliesTo === attack.type
    );

    // Open attack modal
    await this._openAttackModal(attack, applicableChanges, attackIndex);
  }

  /**
   * Handle quick attack roll (without opening modal)
   */
  private async _onAttackRoll(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const attackIndex = Number(event.currentTarget.dataset.attackIndex);
    const attackData = (this.actor.system as any).attackData;
    if (!attackData?.attacks?.[attackIndex]) return;

    const attack = attackData.attacks[attackIndex];
    await this._rollAttack(attack, []);
  }

  /**
   * Open the attack modal with contextual changes
   */
  private async _openAttackModal(
    attack: CalculatedAttack,
    contextChanges: AttackContextualChange[],
    attackIndex: number
  ): Promise<void> {
    const selectedChanges = new Set<string>();

    const content = this._renderAttackModalContent(attack, contextChanges, selectedChanges);

    const dialog = new Dialog({
      title: attack.name,
      content,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice-d20"></i>',
          label: 'Roll Attack',
          callback: async () => {
            const selectedArray = Array.from(selectedChanges);
            const appliedChanges = contextChanges.filter(c => selectedArray.includes(c.name));
            await this._rollAttack(attack, appliedChanges);
          },
        },
        close: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel',
        },
      },
      default: 'roll',
      render: (html: JQuery) => {
        // Set up change toggles
        html.find('.context-change-toggle').on('change', (event) => {
          const checkbox = event.currentTarget as HTMLInputElement;
          const changeName = checkbox.dataset.changeName;
          if (!changeName) return;

          if (checkbox.checked) {
            selectedChanges.add(changeName);
          } else {
            selectedChanges.delete(changeName);
          }

          // Update preview
          this._updateAttackPreview(html, attack, contextChanges, selectedChanges);
        });
      },
    }, {
      width: 400,
      classes: ['attack-modal'],
    });

    dialog.render(true);
  }

  /**
   * Render the attack modal content
   */
  private _renderAttackModalContent(
    attack: CalculatedAttack,
    contextChanges: AttackContextualChange[],
    selectedChanges: Set<string>
  ): string {
    const attackBonus = formatModifier(attack.attackBonus.totalValue);
    const damageText = this._formatDamage(attack.damage);

    let changesHtml = '';
    if (contextChanges.length > 0) {
      changesHtml = `
        <div class="context-changes-section">
          <h4>Modifiers</h4>
          <div class="context-changes-list">
            ${contextChanges.map(change => `
              <label class="context-change-item">
                <input type="checkbox"
                       class="context-change-toggle"
                       data-change-name="${change.name}"
                       ${selectedChanges.has(change.name) ? 'checked' : ''}/>
                <span class="change-name">${change.name}</span>
                <span class="change-effect">${this._getChangeEffectText(change)}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `;
    }

    return `
      <div class="attack-modal-content">
        <div class="attack-info">
          <div class="attack-type">${this._getAttackTypeLabel(attack.type)}</div>
        </div>

        <div class="attack-stats-preview">
          <div class="stat-preview">
            <span class="stat-label">Attack</span>
            <span class="stat-value attack-bonus-preview">${attackBonus}</span>
          </div>
          <div class="stat-preview">
            <span class="stat-label">Damage</span>
            <span class="stat-value damage-preview">${damageText}</span>
          </div>
        </div>

        ${changesHtml}

        <div class="attack-breakdown">
          <h4>Attack Bonus Breakdown</h4>
          <div class="breakdown-list">
            ${attack.attackBonus.sourceValues.map(sv => `
              <div class="breakdown-item ${sv.relevant === false ? 'irrelevant' : ''}">
                <span class="source-name">${sv.sourceName}</span>
                <span class="source-value">${formatModifier(sv.value)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get effect text for a contextual change
   */
  private _getChangeEffectText(change: AttackContextualChange): string {
    // Try to calculate the effect from the changes array
    const effects: string[] = [];

    if (change.changes) {
      for (const c of change.changes) {
        const changeType = (c as any).type;
        const formula = (c as any).formula;
        if (changeType === 'ATTACK_ROLLS' && formula?.expression) {
          const val = parseInt(formula.expression, 10);
          if (!isNaN(val)) {
            effects.push(`${val >= 0 ? '+' : ''}${val} ATK`);
          }
        }
        if (changeType === 'DAMAGE' && formula?.expression) {
          const val = parseInt(formula.expression, 10);
          if (!isNaN(val)) {
            effects.push(`${val >= 0 ? '+' : ''}${val} DMG`);
          }
        }
      }
    }

    return effects.join(', ') || '';
  }

  /**
   * Update the attack preview when contextual changes are toggled
   */
  private _updateAttackPreview(
    html: JQuery,
    attack: CalculatedAttack,
    contextChanges: AttackContextualChange[],
    selectedChanges: Set<string>
  ): void {
    // Calculate modified attack bonus
    let modifiedBonus = attack.attackBonus.totalValue;

    for (const change of contextChanges) {
      if (!selectedChanges.has(change.name)) continue;

      if (change.changes) {
        for (const c of change.changes) {
          const changeType = (c as any).type;
          const formula = (c as any).formula;
          if (changeType === 'ATTACK_ROLLS' && formula?.expression) {
            const val = parseInt(formula.expression, 10);
            if (!isNaN(val)) {
              modifiedBonus += val;
            }
          }
        }
      }
    }

    html.find('.attack-bonus-preview').text(formatModifier(modifiedBonus));
  }

  /**
   * Handle import character from JSON
   */
  private async _onImportCharacter(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();

    const content = `
      <div class="import-dialog">
        <p>Paste the CharacterBaseData JSON exported from Zukus app:</p>
        <textarea id="import-json" style="width: 100%; height: 300px; font-family: monospace; font-size: 12px;"></textarea>
      </div>
    `;

    const dialog = new Dialog({
      title: 'Import Character',
      content,
      buttons: {
        import: {
          icon: '<i class="fas fa-file-import"></i>',
          label: 'Import',
          callback: async (html: JQuery) => {
            const jsonText = (html.find('#import-json').val() as string || '').trim();

            if (!jsonText) {
              ui.notifications?.warn('No JSON provided');
              return;
            }

            try {
              const characterData = JSON.parse(jsonText);

              // Basic validation - check for required fields
              if (!characterData.baseAbilityData) {
                throw new Error('Invalid CharacterBaseData: missing baseAbilityData');
              }

              // Update the actor's flags with the imported data
              const zukusActor = this.actor as unknown as ZukusActor;
              await zukusActor.setCharacterBaseData(characterData);

              ui.notifications?.info(`Character data imported successfully!`);
              this.render(false);
            } catch (error) {
              console.error('Import error:', error);
              ui.notifications?.error(`Failed to import: ${(error as Error).message}`);
            }
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel',
        },
      },
      default: 'import',
    }, {
      width: 500,
      height: 450,
    });

    dialog.render(true);
  }

  /**
   * Handle export character to JSON
   */
  private async _onExportCharacter(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();

    const zukusActor = this.actor as unknown as ZukusActor;
    const characterData = zukusActor.getCharacterBaseData();

    if (!characterData) {
      ui.notifications?.warn('No character data to export');
      return;
    }

    const jsonText = JSON.stringify(characterData, null, 2);

    const content = `
      <div class="export-dialog">
        <p>Copy the CharacterBaseData JSON below:</p>
        <textarea id="export-json" style="width: 100%; height: 300px; font-family: monospace; font-size: 12px;" readonly>${jsonText}</textarea>
      </div>
    `;

    const dialog = new Dialog({
      title: 'Export Character',
      content,
      buttons: {
        copy: {
          icon: '<i class="fas fa-copy"></i>',
          label: 'Copy to Clipboard',
          callback: async (html: JQuery) => {
            const textarea = html.find('#export-json')[0] as HTMLTextAreaElement;
            textarea.select();
            document.execCommand('copy');
            ui.notifications?.info('Copied to clipboard!');
          },
        },
        close: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Close',
        },
      },
      default: 'copy',
    }, {
      width: 500,
      height: 450,
    });

    dialog.render(true);
  }

  /**
   * Handle Zukus login button click
   */
  private async _onZukusLogin(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    await openLoginDialog();
    // Re-render after dialog closes to update UI
    // The auth state change will trigger a re-render through the listener
  }

  /**
   * Handle Zukus logout button click
   */
  private async _onZukusLogout(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    await logoutFromZukus();
    this.render(false);
  }

  /**
   * Handle Zukus link button click
   */
  private async _onZukusLink(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    const zukusActor = this.actor as unknown as ZukusActor;
    await openLinkCharacterDialog(zukusActor);
  }

  /**
   * Handle Zukus unlink button click
   */
  private async _onZukusUnlink(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    const zukusActor = this.actor as unknown as ZukusActor;
    await unlinkCharacter(zukusActor);
  }

  /**
   * Roll an attack
   */
  private async _rollAttack(
    attack: CalculatedAttack,
    appliedChanges: AttackContextualChange[]
  ): Promise<void> {
    // Calculate modified attack bonus
    let attackBonus = attack.attackBonus.totalValue;
    const bonusSources: string[] = [];

    for (const change of appliedChanges) {
      if (change.changes) {
        for (const c of change.changes) {
          const changeType = (c as any).type;
          const formula = (c as any).formula;
          if (changeType === 'ATTACK_ROLLS' && formula?.expression) {
            const val = parseInt(formula.expression, 10);
            if (!isNaN(val)) {
              attackBonus += val;
              bonusSources.push(`${change.name}: ${val >= 0 ? '+' : ''}${val}`);
            }
          }
        }
      }
    }

    // Build the roll
    const roll = new Roll('1d20 + @bonus', { bonus: attackBonus });
    await roll.evaluate();

    // Build flavor text
    let flavor = `<strong>${attack.name}</strong> - ${this._getAttackTypeLabel(attack.type)} Attack`;
    if (bonusSources.length > 0) {
      flavor += `<br><small>Modifiers: ${bonusSources.join(', ')}</small>`;
    }
    flavor += `<br><small>Damage: ${this._formatDamage(attack.damage)}</small>`;

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor,
    });
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

    // Calculate total
    const total = sources
      .filter(s => s.relevant !== false)
      .reduce((sum, s) => sum + (s.value || 0), 0);

    // Get a friendly label for the breakdown
    const labelMap: Record<string, string> = {
      'abilities.strength': 'Strength',
      'abilities.dexterity': 'Dexterity',
      'abilities.constitution': 'Constitution',
      'abilities.intelligence': 'Intelligence',
      'abilities.wisdom': 'Wisdom',
      'abilities.charisma': 'Charisma',
      'ac': 'Armor Class',
      'touchAc': 'Touch AC',
      'flatFootedAc': 'Flat-Footed AC',
      'bab': 'Base Attack Bonus',
      'initiative': 'Initiative',
      'grapple': 'Grapple',
      'saves.fortitude': 'Fortitude Save',
      'saves.reflex': 'Reflex Save',
      'saves.will': 'Will Save',
    };
    const label = labelMap[breakdownKey] || breakdownKey;

    // Create tooltip HTML
    const tooltipHtml = `
      <div class="source-breakdown-tooltip">
        <div class="tooltip-header">${label}</div>
        ${sources.map(s => {
          const value = s.value || 0;
          const sign = value >= 0 ? '+' : '';
          const relevantClass = s.relevant === false ? 'irrelevant' : '';
          const signClass = value > 0 ? 'positive' : value < 0 ? 'negative' : '';
          return `
            <div class="source-item ${relevantClass} ${signClass}">
              <span class="source-name">${s.sourceName || 'Unknown'}</span>
              <span class="source-value">${sign}${value}</span>
            </div>
          `;
        }).join('')}
        <div class="tooltip-total">
          <span>Total</span>
          <span class="total-value">${total >= 0 ? '+' : ''}${total}</span>
        </div>
      </div>
    `;

    // Position and show tooltip
    const tooltip = $(tooltipHtml);
    $('body').append(tooltip);

    const rect = element.getBoundingClientRect();
    const tooltipEl = tooltip[0];
    const tooltipRect = tooltipEl.getBoundingClientRect();

    // Position to the right of the element, but keep on screen
    let left = rect.right + 10;
    let top = rect.top;

    // Keep tooltip on screen
    if (left + tooltipRect.width > window.innerWidth) {
      left = rect.left - tooltipRect.width - 10;
    }
    if (top + tooltipRect.height > window.innerHeight) {
      top = window.innerHeight - tooltipRect.height - 10;
    }

    tooltip.css({
      left: left,
      top: top,
    });
  }

  /**
   * Hide source breakdown tooltip
   */
  private _hideSourceBreakdown(): void {
    $('.source-breakdown-tooltip').remove();
  }
}
