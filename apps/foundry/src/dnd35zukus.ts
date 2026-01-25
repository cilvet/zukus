/**
 * D&D 3.5e System for Foundry VTT
 * Using @zukus/core calculation engine
 */

import { ZukusActor } from './documents/actor';
import { ZukusItem } from './documents/item';
import { ZukusActorSheet } from './sheets/actor-sheet';
import { CharacterData } from './data/character-data';
import { DND35ZUKUS } from './config';
import { getAvailableBuffs, getBuffEntity } from './compendium/foundry-compendium-context';
import { initAuth } from './supabase/auth';

// Import styles
import './styles/system.scss';

/**
 * Init Hook - Called when Foundry is initializing
 */
Hooks.once('init', async () => {
  console.log('dnd35zukus | Initializing D&D 3.5e Zukus System');

  // Add config to global namespace
  CONFIG.DND35ZUKUS = DND35ZUKUS;

  // Define custom Document classes
  CONFIG.Actor.documentClass = ZukusActor as typeof Actor;
  CONFIG.Item.documentClass = ZukusItem as typeof Item;

  // Register Data Models
  CONFIG.Actor.dataModels = {
    character: CharacterData,
  };

  // Register sheet classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('dnd35zukus', ZukusActorSheet as typeof ActorSheet, {
    types: ['character'],
    makeDefault: true,
    label: 'DND35ZUKUS.SheetLabels.Character',
  });

  // Preload Handlebars templates
  await preloadHandlebarsTemplates();

  console.log('dnd35zukus | System initialized');
});

/**
 * Ready Hook - Called when Foundry is ready
 */
Hooks.once('ready', async () => {
  console.log('dnd35zukus | System ready');
  console.log('dnd35zukus | Using @zukus/core for character calculations');

  // Initialize Supabase auth (restores session from localStorage)
  await initAuth();
  console.log('dnd35zukus | Supabase auth initialized');

  // Populate buffs compendium from @zukus/core
  await populateBuffsCompendium();
});

/**
 * Populate the buffs compendium from @zukus/core entities.
 * Creates Foundry Item documents for each buff entity.
 */
async function populateBuffsCompendium(): Promise<void> {
  console.log('dnd35zukus | Looking for buffs compendium...');
  console.log('dnd35zukus | Available packs:', Array.from(game.packs?.keys() || []));

  const pack = game.packs?.get('dnd35zukus.buffs') as any;
  if (!pack) {
    console.warn('dnd35zukus | Buffs compendium not found');
    return;
  }

  console.log('dnd35zukus | Found pack:', pack.collection, 'locked:', pack.locked);

  // Check if compendium is already populated
  const existingDocs = await pack.getDocuments();
  if (existingDocs.length > 0) {
    console.log('dnd35zukus | Buffs compendium already populated with', existingDocs.length, 'items');
    return;
  }

  // Get buff entities from core compendium
  const buffEntities = getAvailableBuffs();
  console.log(`dnd35zukus | Populating buffs compendium with ${buffEntities.length} buffs`);

  if (buffEntities.length === 0) {
    console.warn('dnd35zukus | No buff entities found in core compendium');
    return;
  }

  // Unlock the compendium for editing if needed
  const wasLocked = pack.locked;
  if (wasLocked) {
    console.log('dnd35zukus | Unlocking compendium...');
    await pack.configure({ locked: false });
  }

  // Create Item documents for each buff
  let created = 0;
  for (const buffInfo of buffEntities) {
    const entity = getBuffEntity(buffInfo.id) as any;
    if (!entity) {
      console.warn(`dnd35zukus | Entity not found: ${buffInfo.id}`);
      continue;
    }

    // Use legacy_changes (from effectful addon) or changes as fallback
    const changes = entity.legacy_changes || entity.changes || [];

    const itemData = {
      name: entity.name,
      type: 'buff',
      img: 'icons/svg/aura.svg',
      system: {
        description: entity.description,
        category: entity.category || 'Spell',
        spellLevel: entity.spellLevel || 0,
        duration: entity.duration || '',
        // Store the core entity ID for reference when dropped
        coreEntityId: entity.id,
        changes: changes,
      },
    };

    try {
      await Item.create(itemData, { pack: pack.collection });
      created++;
      console.log(`dnd35zukus | Created buff: ${entity.name}`);
    } catch (error) {
      console.error(`dnd35zukus | Error creating buff item: ${entity.name}`, error);
    }
  }

  // Re-lock if it was locked before
  if (wasLocked) {
    await pack.configure({ locked: true });
  }

  console.log(`dnd35zukus | Buffs compendium populated with ${created} items`);
}

/**
 * Preload Handlebars templates for faster rendering
 */
async function preloadHandlebarsTemplates(): Promise<void> {
  const templatePaths = [
    'systems/dnd35zukus/templates/actor/character-sheet.hbs',
  ];

  return loadTemplates(templatePaths) as unknown as Promise<void>;
}

/**
 * Register Handlebars helpers
 */
Handlebars.registerHelper('formatModifier', (value: number) => {
  return value >= 0 ? `+${value}` : `${value}`;
});

Handlebars.registerHelper('times', (n: number, block: any) => {
  let result = '';
  for (let i = 0; i < n; i++) {
    result += block.fn(i);
  }
  return result;
});
