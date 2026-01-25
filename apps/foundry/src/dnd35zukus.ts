/**
 * D&D 3.5e System for Foundry VTT
 * Using @zukus/core calculation engine
 */

import { ZukusActor } from './documents/actor';
import { ZukusItem } from './documents/item';
import { ZukusActorSheet } from './sheets/actor-sheet';
import { CharacterData } from './data/character-data';
import { DND35ZUKUS } from './config';

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
Hooks.once('ready', () => {
  console.log('dnd35zukus | System ready');
  console.log('dnd35zukus | Using @zukus/core for character calculations');
});

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
