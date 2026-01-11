import { CharacterBaseData } from "../../baseData/character";
import {
  createSourceRef,
  Effect,
  SourcedEffect,
} from "../../baseData/effects";
import type { ComputedEntity } from "../../../entities/types/base";

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
 * Compiles all effects from character base data and computed entities.
 * 
 * Supports effects from:
 * - Buffs (buff.effects)
 * - Custom Entities (entity.effects) - via computedEntities parameter
 *
 * @param characterBaseData Character base data containing buffs
 * @param computedEntities Optional array of computed entities with effects
 * @returns Compiled effects organized by target prefix
 */
export function compileCharacterEffects(
  characterBaseData: CharacterBaseData,
  computedEntities?: ComputedEntity[]
): CompiledEffects {
  const compiled: CompiledEffects = {
    all: [],
    byPrefix: new Map(),
  };

  // Compile effects from buffs
  compileBuffEffects(characterBaseData, compiled);

  // Compile effects from custom entities
  if (computedEntities) {
    compileEntityEffects(computedEntities, compiled);
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


