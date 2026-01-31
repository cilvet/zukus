import { CharacterBaseData } from "../../baseData/character";
import {
  createSourceRef,
  Effect,
  SourcedEffect,
} from "../../baseData/effects";
import type { Condition, SimpleCondition } from "../../baseData/conditions";
import type { ComputedEntity, StandardEntity } from "../../../entities/types/base";
import {
  isItemEquipped,
  isItemActive,
  isItemWielded,
} from "../../../inventory/instanceFields";
import type { InventoryItemInstance } from "../../../inventory/types";

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
};

/**
 * Compiles all effects from character base data and computed entities.
 *
 * Supports effects from:
 * - Buffs (buff.effects)
 * - Custom Entities (entity.effects) - via computedEntities parameter
 * - Equipped Inventory Items (item.effects) - via stored entity on item
 *
 * Inventory items are self-contained: their entities are stored directly
 * on the item when acquired, so no external resolver is needed.
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

  // Compile effects from equipped inventory items (entities stored on items)
  if (characterBaseData.inventoryState) {
    compileInventoryItemEffects(characterBaseData, compiled);
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
  compiled: CompiledEffects
): void {
  const items = characterBaseData.inventoryState?.items ?? [];

  for (const item of items) {
    // Only process equipped items with stored entity
    if (!isItemEquipped(item) || !item.entity) {
      continue;
    }

    const entity = item.entity;

    // Get effects from the entity (properties already applied at acquisition time)
    const entityWithEffects = entity as StandardEntity & {
      effects?: Effect[];
    };

    // Collect effects from the entity
    const effects = entityWithEffects.effects ?? [];

    // Add character-targeting effects to compiled
    for (const effect of effects) {
      // Skip @item effects
      if (effect.target.startsWith("@item.")) {
        continue;
      }

      // Resolve @instance.X conditions with actual item instance values
      // This allows effects to have conditions like @instance.active == 1
      const resolvedEffect = resolveInstanceConditions(effect, item);

      const sourcedEffect = toSourcedEffect(
        resolvedEffect,
        "item",
        item.instanceId,
        entity.name || item.itemId
      );
      addEffect(compiled, sourcedEffect);
    }
  }
}

// =============================================================================
// INSTANCE FIELD CONDITION RESOLUTION
// =============================================================================

/**
 * Resolves @instance.X references in effect conditions using the item's instance values.
 *
 * This allows effects to have conditions like:
 * - @instance.equipped == 1 (check if item is equipped)
 * - @instance.active == 1 (check if item is active)
 * - @instance.wielded == 1 (check if weapon is wielded)
 *
 * The @instance.X references are replaced with the actual numeric values (0 or 1 for booleans).
 */
function resolveInstanceConditions(
  effect: Effect,
  item: InventoryItemInstance
): Effect {
  if (!effect.conditions || effect.conditions.length === 0) {
    return effect;
  }

  const resolvedConditions = effect.conditions.map((condition) =>
    resolveInstanceCondition(condition, item)
  );

  return {
    ...effect,
    conditions: resolvedConditions,
  };
}

/**
 * Resolves a single condition, replacing @instance.X with actual values.
 */
function resolveInstanceCondition(
  condition: Condition,
  item: InventoryItemInstance
): Condition {
  if (condition.type !== "simple") {
    return condition;
  }

  const simpleCondition = condition as SimpleCondition;

  // Check if either formula references @instance
  const hasInstanceRef =
    simpleCondition.firstFormula.includes("@instance.") ||
    simpleCondition.secondFormula.includes("@instance.");

  if (!hasInstanceRef) {
    return condition;
  }

  return {
    ...simpleCondition,
    firstFormula: resolveInstanceFormula(simpleCondition.firstFormula, item),
    secondFormula: resolveInstanceFormula(simpleCondition.secondFormula, item),
  };
}

/**
 * Replaces @instance.X references in a formula with actual values.
 */
function resolveInstanceFormula(
  formula: string,
  item: InventoryItemInstance
): string {
  return formula.replace(/@instance\.(\w+)/g, (match, fieldName) => {
    const value = getInstanceFieldValueByName(item, fieldName);
    // Convert to numeric: booleans become 0/1, numbers stay as-is
    if (typeof value === "boolean") {
      return value ? "1" : "0";
    }
    if (typeof value === "number") {
      return value.toString();
    }
    // String values - return 0 as we can't use strings in numeric conditions
    return "0";
  });
}

/**
 * Gets an instance field value by name from the item.
 */
function getInstanceFieldValueByName(
  item: InventoryItemInstance,
  fieldName: string
): boolean | number | string {
  // Handle common fields with dedicated helpers for type safety
  switch (fieldName) {
    case "equipped":
      return isItemEquipped(item);
    case "wielded":
      return isItemWielded(item);
    case "active":
      return isItemActive(item);
    default:
      // For custom fields, read directly from instanceValues with a default of 0/false
      return item.instanceValues?.[fieldName] ?? false;
  }
}


