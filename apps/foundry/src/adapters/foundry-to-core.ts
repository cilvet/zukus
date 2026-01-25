/**
 * Adapter: Foundry VTT -> @zukus/core
 *
 * Converts Foundry Actor data to CharacterBaseData format
 * for calculation by the Zukus engine.
 */

import type { CharacterBaseData } from '@zukus/core';
import type { CharacterDataSchema } from '../data/character-data';

// Local type definitions (these match the core types but aren't exported)
type CharacterLevel = {
  level: number;
  xp: number;
  levelsData: CharacterLevelData[];
};

type CharacterLevelData = {
  classUniqueId: string;
  level: number;
  hitDie: number;
  hitDieRoll: number;
  levelClassFeatures: any[];
  levelFeats: any[];
  permanentIntelligenceStatAtLevel: number;
};

type FoundryActor = {
  name: string;
  system: CharacterDataSchema;
  items: Collection<Item>;
};

type Item = {
  type: string;
  name: string;
  system: Record<string, unknown>;
};

type Collection<T> = {
  filter: (fn: (item: T) => boolean) => T[];
  map: <U>(fn: (item: T) => U) => U[];
};

/**
 * Converts a Foundry Actor to CharacterBaseData for @zukus/core
 */
export function foundryActorToZukusData(actor: FoundryActor): CharacterBaseData {
  const system = actor.system;

  // Convert abilities
  const baseAbilityData = {
    strength: {
      baseScore: system.abilities.strength.value,
      drain: system.abilities.strength.drain,
      damage: system.abilities.strength.damage,
    },
    dexterity: {
      baseScore: system.abilities.dexterity.value,
      drain: system.abilities.dexterity.drain,
      damage: system.abilities.dexterity.damage,
    },
    constitution: {
      baseScore: system.abilities.constitution.value,
      drain: system.abilities.constitution.drain,
      damage: system.abilities.constitution.damage,
    },
    intelligence: {
      baseScore: system.abilities.intelligence.value,
      drain: system.abilities.intelligence.drain,
      damage: system.abilities.intelligence.damage,
    },
    wisdom: {
      baseScore: system.abilities.wisdom.value,
      drain: system.abilities.wisdom.drain,
      damage: system.abilities.wisdom.damage,
    },
    charisma: {
      baseScore: system.abilities.charisma.value,
      drain: system.abilities.charisma.drain,
      damage: system.abilities.charisma.damage,
    },
  };

  // Extract classes from Items
  const classItems = actor.items.filter(i => i.type === 'class');
  const classes = classItems.map(classItem => ({
    classUniqueId: classItem.system.classId as string || classItem.name.toLowerCase().replace(/\s/g, '-'),
    level: (classItem.system.level as number) || 1,
    hitDie: (classItem.system.hitDie as number) || 10,
  }));

  // Build level data
  const totalLevel = system.details.level;
  const levelsData: CharacterLevelData[] = [];

  // Simple level data generation (can be enhanced later)
  for (const cls of classes) {
    for (let i = 1; i <= cls.level; i++) {
      levelsData.push({
        classUniqueId: cls.classUniqueId,
        level: i,
        hitDie: cls.hitDie,
        hitDieRoll: i === 1 ? cls.hitDie : Math.ceil(cls.hitDie / 2), // Max at 1st, average after
        levelClassFeatures: [],
        levelFeats: [],
        permanentIntelligenceStatAtLevel: system.abilities.intelligence.value,
      });
    }
  }

  const level: CharacterLevel = {
    level: totalLevel,
    xp: system.details.xp,
    levelsData,
  };

  // Extract buffs from Items
  const buffItems = actor.items.filter(i => i.type === 'buff');
  const buffs = buffItems.map(buffItem => ({
    uniqueId: buffItem.system.uniqueId as string || crypto.randomUUID(),
    name: buffItem.name,
    description: buffItem.system.description as string || '',
    originType: 'item' as const,
    originName: buffItem.name,
    originUniqueId: buffItem.system.uniqueId as string || '',
    active: buffItem.system.active as boolean ?? true,
    changes: buffItem.system.changes as any[] || [],
  }));

  // Extract feats from Items
  const featItems = actor.items.filter(i => i.type === 'feat');
  const feats = featItems.map(featItem => ({
    uniqueId: featItem.system.uniqueId as string || crypto.randomUUID(),
    name: featItem.name,
    description: featItem.system.description as string || '',
    changes: featItem.system.changes as any[] || [],
  }));

  return {
    name: actor.name,
    baseAbilityData,
    classes,
    level,
    currentDamage: system.hp.damage,
    temporaryHp: system.hp.temp,
    currentTemporalHp: system.hp.temp,
    equipment: {
      items: [],
      armor: undefined,
      shield: undefined,
    },
    skills: {},
    skillData: {},
    feats,
    buffs,
    sharedBuffs: [],
    updatedAt: new Date().toISOString(),
  };
}
