/**
 * Dwarf Racial Traits
 *
 * D&D 3.5 SRD Dwarf racial features:
 * - Darkvision 60 ft.
 * - Stonecunning (+2 Search for stonework)
 * - Stability (+4 vs bull rush/trip)
 * - +2 saves vs poison
 * - +2 saves vs spells/spell-like effects
 * - +1 attack vs orcs/goblinoids
 * - +4 dodge AC vs giants
 * - +2 Appraise (stone/metal), +2 Craft (stone/metal)
 * - Weapon Familiarity: dwarven waraxe, dwarven urgrosh as martial
 * - Armor speed: unaffected by medium/heavy armor or load
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';

export const dwarfDarkvision: StandardEntity = {
  id: 'dwarf-darkvision',
  entityType: 'racialTrait',
  name: 'Darkvision',
  description:
    'Dwarves can see in the dark up to 60 feet. Darkvision is black and white only, but it is otherwise like normal sight, and dwarves can function just fine with no light at all.',
  tags: ['dwarf', 'racial', 'vision'],
};

export const dwarfStonecunning: StandardEntity = {
  id: 'dwarf-stonecunning',
  entityType: 'racialTrait',
  name: 'Stonecunning',
  description:
    '+2 racial bonus on Search checks to notice unusual stonework, such as sliding walls, stonework traps, new construction, unsafe stone surfaces, shaky stone ceilings, and the like. A dwarf who merely comes within 10 feet of unusual stonework can make a Search check as if he were actively searching, and a dwarf can use the Search skill to find stonework traps as a rogue can. A dwarf can also intuit depth, sensing his approximate depth underground as naturally as a human can sense which way is up.',
  tags: ['dwarf', 'racial'],
};

export const dwarfStability: StandardEntity = {
  id: 'dwarf-stability',
  entityType: 'racialTrait',
  name: 'Stability',
  description:
    'A dwarf gains a +4 bonus on ability checks made to resist being bull rushed or tripped when standing on the ground (but not when climbing, flying, riding, or otherwise not standing firmly on the ground).',
  tags: ['dwarf', 'racial'],
};

export const dwarfSaveVsPoison: StandardEntity = {
  id: 'dwarf-save-vs-poison',
  entityType: 'racialTrait',
  name: 'Hardy (Poison)',
  description: '+2 racial bonus on saving throws against poison.',
  tags: ['dwarf', 'racial'],
};

export const dwarfSaveVsSpells: StandardEntity = {
  id: 'dwarf-save-vs-spells',
  entityType: 'racialTrait',
  name: 'Hardy (Spells)',
  description: '+2 racial bonus on saving throws against spells and spell-like effects.',
  tags: ['dwarf', 'racial'],
};

export const dwarfCombatBonusVsOrcs: StandardEntity = {
  id: 'dwarf-combat-vs-orcs',
  entityType: 'racialTrait',
  name: 'Hatred (Orcs & Goblinoids)',
  description: '+1 racial bonus on attack rolls against orcs and goblinoids.',
  tags: ['dwarf', 'racial'],
};

export const dwarfDodgeVsGiants: StandardEntity = {
  id: 'dwarf-dodge-vs-giants',
  entityType: 'racialTrait',
  name: 'Giant Dodging',
  description: '+4 dodge bonus to Armor Class against monsters of the giant type.',
  tags: ['dwarf', 'racial'],
};

export const dwarfSkillBonuses: StandardEntity = {
  id: 'dwarf-skill-bonuses',
  entityType: 'racialTrait',
  name: 'Dwarven Craftsmanship',
  description:
    '+2 racial bonus on Appraise checks related to stone or metal items. +2 racial bonus on Craft checks related to stone or metal.',
  tags: ['dwarf', 'racial'],
};

export const dwarfWeaponFamiliarity: StandardEntity = {
  id: 'dwarf-weapon-familiarity',
  entityType: 'racialTrait',
  name: 'Weapon Familiarity',
  description:
    'Dwarves may treat dwarven waraxes and dwarven urgroshes as martial weapons, rather than exotic weapons.',
  tags: ['dwarf', 'racial', 'weaponProficiency'],
};

export const dwarfArmorSpeed: StandardEntity = {
  id: 'dwarf-armor-speed',
  entityType: 'racialTrait',
  name: 'Steady',
  description:
    'Dwarves can move at their stated speed (20 ft.) even when wearing medium or heavy armor or when carrying a medium or heavy load (unlike other creatures, whose speed is reduced in such situations).',
  tags: ['dwarf', 'racial'],
};

export const dwarfRacialTraits: StandardEntity[] = [
  dwarfDarkvision,
  dwarfStonecunning,
  dwarfStability,
  dwarfSaveVsPoison,
  dwarfSaveVsSpells,
  dwarfCombatBonusVsOrcs,
  dwarfDodgeVsGiants,
  dwarfSkillBonuses,
  dwarfWeaponFamiliarity,
  dwarfArmorSpeed,
];
