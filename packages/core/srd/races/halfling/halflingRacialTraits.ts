/**
 * Halfling Racial Traits
 *
 * D&D 3.5 SRD Halfling racial features:
 * - +1 racial bonus on all saving throws
 * - +2 morale bonus on saves vs fear (stacks with +1)
 * - +1 attack with thrown weapons and slings
 * - +2 Climb, Jump, Listen, Move Silently
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';

export const halflingSavingThrowBonus: StandardEntity = {
  id: 'halfling-saving-throw-bonus',
  entityType: 'racialTrait',
  name: 'Lucky',
  description: '+1 racial bonus on all saving throws.',
  tags: ['halfling', 'racial'],
  effects: [
    { target: 'savingThrow.fort.total', formula: '1', bonusType: 'RACIAL' },
    { target: 'savingThrow.reflex.total', formula: '1', bonusType: 'RACIAL' },
    { target: 'savingThrow.will.total', formula: '1', bonusType: 'RACIAL' },
  ],
};

export const halflingFearless: StandardEntity = {
  id: 'halfling-fearless',
  entityType: 'racialTrait',
  name: 'Fearless',
  description:
    '+2 morale bonus on saving throws against fear. This bonus stacks with the halfling\'s +1 bonus on saving throws in general.',
  tags: ['halfling', 'racial'],
};

export const halflingKeenThrower: StandardEntity = {
  id: 'halfling-keen-thrower',
  entityType: 'racialTrait',
  name: 'Keen Thrower',
  description: '+1 racial bonus on attack rolls with thrown weapons and slings.',
  tags: ['halfling', 'racial'],
};

export const halflingSkillBonuses: StandardEntity = {
  id: 'halfling-skill-bonuses',
  entityType: 'racialTrait',
  name: 'Halfling Agility',
  description:
    '+2 racial bonus on Climb, Jump, Listen, and Move Silently checks.',
  tags: ['halfling', 'racial'],
  effects: [
    { target: 'skills.climb.total', formula: '2', bonusType: 'RACIAL' },
    { target: 'skills.jump.total', formula: '2', bonusType: 'RACIAL' },
    { target: 'skills.listen.total', formula: '2', bonusType: 'RACIAL' },
    { target: 'skills.move-silently.total', formula: '2', bonusType: 'RACIAL' },
  ],
};

export const halflingRacialTraits: StandardEntity[] = [
  halflingSavingThrowBonus,
  halflingFearless,
  halflingKeenThrower,
  halflingSkillBonuses,
];
