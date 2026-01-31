import { CharacterBaseData } from "../../baseData/character";
import {
  createSourceRef,
  Effect,
  SourcedEffect,
} from "../../baseData/effects";
import type { ComputedEntity, StandardEntity } from "../../../entities/types/base";
import type { InventoryEntityResolver } from "../../../compendiums/types";
import { applyPropertyEffectsToItem } from "../../../inventory/properties/resolveItemEffects";

// =============================================================================
// COMPILED EFFECTS - Effects organized by target prefix
// =============================================================================

/**
 * Effects organized by their target prefix for efficient lookup.
 * Each key is a target prefix (e.g., "size", "ability", "ac").
 */
export type CompiledEffects = {
  all: SourcedEffect[];
  byPrefix: Map<string, SourcedEffect[]>;
};

/**
 * Gets the prefix of a target path.
 * e.g., "ability.strength.score" -> "ability"
 * e.g., "size.total" -> "size"
 */
function getTargetPrefix(target: string): string {
  const dotIndex = target.indexOf(".");
  if (dotIndex === -1) {
    return target;
  }
  return target.substring(0, dotIndex);
}

/**
 * Adds a sourced effect to the compiled effects structure.
 */
function addEffect(compiled: CompiledEffects, effect: SourcedEffect): void {
  compiled.all.push(effect);

  const prefix = getTargetPrefix(effect.target);
  const existing = compiled.byPrefix.get(prefix);
  if (existing) {
    existing.push(effect);
  } else {
    compiled.byPrefix.set(prefix, [effect]);
  }
}

/**
 * Converts an Effect to a SourcedEffect by adding source information.
 */
function toSourcedEffect(
  effect: Effect,
  sourceType: string,
  sourceId: string,
  sourceName: string
): SourcedEffect {
  return {
    ...effect,
    sourceRef: createSourceRef(sourceType, sourceId),
    sourceName,
  };
}

// =============================================================================
// COMPILE EFFECTS FROM CHARACTER DATA
// =============================================================================

/**
 * Options for compiling character effects.
 */
export type CompileEffectsOptions = {
  /** Optional array of computed entities with effects */
  computedEntities?: ComputedEntity[];
  /** Optional resolver for inventory item entities */
  inventoryEntityResolver?: InventoryEntityResolver;
};

/**
 * Compiles all effects from character base data and computed entities.
 *
 * Supports effects from:
 * - Buffs (buff.effects)
 * - Custom Entities (entity.effects) - via computedEntities parameter
 * - Equipped Inventory Items (item.effects) - via inventoryEntityResolver
 *
 * @param characterBaseData Character base data containing buffs and inventory
 * @param options Optional configuration for effect compilation
 * @returns Compiled effects organized by target prefix
 */
export function compileCharacterEffects(
  characterBaseData: CharacterBaseData,
  options?: CompileEffectsOptions | ComputedEntity[]
): CompiledEffects {
  const compiled: CompiledEffects = {
    all: [],
    byPrefix: new Map(),
  };

  // Handle legacy signature (computedEntities as second param)
  const opts: CompileEffectsOptions = Array.isArray(options)
    ? { computedEntities: options }
    : options ?? {};

  // Compile effects from buffs
  compileBuffEffects(characterBaseData, compiled);

  // Compile effects from custom entities
  if (opts.computedEntities) {
    compileEntityEffects(opts.computedEntities, compiled);
  }

  // Compile effects from equipped inventory items
  if (opts.inventoryEntityResolver && characterBaseData.inventoryState) {
    compileInventoryItemEffects(
      characterBaseData,
      opts.inventoryEntityResolver,
      compiled
    );
  }

  return compiled;
}

/**
 * Compiles effects from active buffs.
 */
function compileBuffEffects(
  characterBaseData: CharacterBaseData,
  compiled: CompiledEffects
): void {
  const allBuffs = [
    ...(characterBaseData.buffs ?? []),
    ...(characterBaseData.sharedBuffs ?? []),
  ];

  allBuffs
    .filter((buff) => buff.active)
    .forEach((buff) => {
      buff.effects?.forEach((effect) => {
        const sourcedEffect = toSourcedEffect(
          effect,
          buff.originType,
          buff.uniqueId,
          buff.name
        );
        addEffect(compiled, sourcedEffect);
      });
    });
}

/**
 * Compiles effects from custom entities.
 * Uses the entityType directly as the source type.
 */
function compileEntityEffects(
  computedEntities: ComputedEntity[],
  compiled: CompiledEffects
): void {
  computedEntities.forEach((entity) => {
    // Skip if entity is suppressed
    if (entity._meta.suppressed) {
      return;
    }

    // Get effects from entity (if any)
    const effects = entity.effects ?? [];

    effects.forEach((effect) => {
      const sourcedEffect = toSourcedEffect(
        effect,
        entity.entityType,
        entity.id,
        entity.name || entity.id
      );
      addEffect(compiled, sourcedEffect);
    });
  });
}

// =============================================================================
// QUERY EFFECTS
// =============================================================================

/**
 * Gets all effects that match a specific target prefix.
 *
 * @param compiled The compiled effects structure
 * @param prefix The target prefix to match (e.g., "size", "ability")
 * @returns Array of effects matching the prefix
 */
export function getEffectsByPrefix(
  compiled: CompiledEffects,
  prefix: string
): SourcedEffect[] {
  return compiled.byPrefix.get(prefix) ?? [];
}

/**
 * Gets all effects that match a specific target exactly.
 *
 * @param compiled The compiled effects structure
 * @param target The exact target to match (e.g., "size.total")
 * @returns Array of effects matching the exact target
 */
export function getEffectsByTarget(
  compiled: CompiledEffects,
  target: string
): SourcedEffect[] {
  const prefix = getTargetPrefix(target);
  const prefixEffects = compiled.byPrefix.get(prefix) ?? [];
  return prefixEffects.filter((effect) => effect.target === target);
}

// =============================================================================
// INVENTORY ITEM EFFECTS
// =============================================================================

/**
 * Compiles effects from equipped inventory items.
 *
 * For each equipped item:
 * 1. Resolve the entity from the compendium
 * 2. If the entity has properties with effects, apply them to get resolved item
 * 3. Extract effects that DON'T target @item (those are for the item itself)
 * 4. Add character-targeting effects to compiled
 *
 * Effects with target starting with "@item." are NOT included here - those
 * modify the item itself and are handled during attack/item resolution.
 */
function compileInventoryItemEffects(
  characterBaseData: CharacterBaseData,
  resolver: InventoryEntityResolver,
  compiled: CompiledEffects
): void {
  const items = characterBaseData.inventoryState?.items ?? [];

  for (const item of items) {
    // Only process equipped items
    if (!item.equipped) {
      continue;
    }

    // Resolve the entity
    const entity = resolver(item.entityType, item.itemId);
    if (!entity) {
      continue;
    }

    // Get effects from the entity
    const entityWithEffects = entity as StandardEntity & {
      effects?: Effect[];
      properties?: string[];
    };

    // Collect all effects from the entity
    const effects: Effect[] = [];

    // Direct effects from the entity
    if (entityWithEffects.effects) {
      effects.push(...entityWithEffects.effects);
    }

    // If the item has properties, resolve them and collect their effects
    // But only non-@item effects (property effects that target character stats)
    if (entityWithEffects.properties && entityWithEffects.properties.length > 0) {
      const propertyEntities: StandardEntity[] = [];
      for (const propId of entityWithEffects.properties) {
        // Determine property entity type based on item type
        const propertyType = getPropertyTypeForItem(item.entityType);
        const propEntity = resolver(propertyType, propId);
        if (propEntity) {
          propertyEntities.push(propEntity);
        }
      }

      // Collect effects from properties that target character (not @item)
      for (const prop of propertyEntities) {
        const propEffects = (prop as StandardEntity & { effects?: Effect[] }).effects ?? [];
        for (const effect of propEffects) {
          // Skip @item effects - those are for modifying the item
          if (!effect.target.startsWith("@item.")) {
            effects.push(effect);
          }
        }
      }
    }

    // Add character-targeting effects to compiled
    for (const effect of effects) {
      // Skip @item effects
      if (effect.target.startsWith("@item.")) {
        continue;
      }

      // Determine if this effect should only apply when wielded
      // For now, all effects from equipped items apply
      // TODO: Add support for wielded-only effects via conditions

      const sourcedEffect = toSourcedEffect(
        effect,
        "item",
        item.instanceId,
        entity.name || item.itemId
      );
      addEffect(compiled, sourcedEffect);
    }
  }
}

/**
 * Gets the property entity type for a given item entity type.
 * E.g., 'weapon' -> 'weaponProperty', 'armor' -> 'armorProperty'
 */
function getPropertyTypeForItem(itemEntityType: string): string {
  return `${itemEntityType}Property`;
}


