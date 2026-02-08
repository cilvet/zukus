// Human
export { humanRace, humanRacialTraits } from './human';

// Dwarf
export { dwarfRace, dwarfRacialTraits } from './dwarf';

// Elf
export { elfRace, elfRacialTraits } from './elf';

// Gnome
export { gnomeRace, gnomeRacialTraits, gnomeSpellLikeAbilities, gnomeSpellLikeAbilitiesTrait } from './gnome';

// Half-Elf
export { halfElfRace, halfElfRacialTraits } from './halfElf';

// Half-Orc
export { halfOrcRace, halfOrcRacialTraits } from './halfOrc';

// Halfling
export { halflingRace, halflingRacialTraits } from './halfling';

// Drow
export { drowRace, drowRacialTraits, drowSpellLikeAbilities, drowSpellLikeAbilitiesTrait } from './drow';

// =============================================================================
// Aggregate exports for compendium registration
// =============================================================================

import { humanRace, humanRacialTraits } from './human';
import { dwarfRace, dwarfRacialTraits } from './dwarf';
import { elfRace, elfRacialTraits } from './elf';
import { gnomeRace, gnomeRacialTraits, gnomeSpellLikeAbilities, gnomeSpellLikeAbilitiesTrait } from './gnome';
import { halfElfRace, halfElfRacialTraits } from './halfElf';
import { halfOrcRace, halfOrcRacialTraits } from './halfOrc';
import { halflingRace, halflingRacialTraits } from './halfling';
import { drowRace, drowRacialTraits, drowSpellLikeAbilities, drowSpellLikeAbilitiesTrait } from './drow';

import type { StandardEntity } from '../../core/domain/entities/types/base';

/** All 8 race entities for the compendium */
export const allRaces: StandardEntity[] = [
  humanRace,
  dwarfRace,
  elfRace,
  gnomeRace,
  halfElfRace,
  halfOrcRace,
  halflingRace,
  drowRace,
];

/** All racial trait entities for the compendium */
export const allRacialTraits: StandardEntity[] = [
  ...humanRacialTraits,
  ...dwarfRacialTraits,
  ...elfRacialTraits,
  ...gnomeRacialTraits,
  ...halfElfRacialTraits,
  ...halfOrcRacialTraits,
  ...halflingRacialTraits,
  ...drowRacialTraits,
];

/** All racial SLA entities for the compendium */
export const allRacialSpellLikeAbilities: StandardEntity[] = [
  ...gnomeSpellLikeAbilities,
  ...drowSpellLikeAbilities,
];

/** All racial class feature entities (SLA trait CGE definitions) */
export const allRacialClassFeatures: StandardEntity[] = [
  gnomeSpellLikeAbilitiesTrait,
  drowSpellLikeAbilitiesTrait,
];
