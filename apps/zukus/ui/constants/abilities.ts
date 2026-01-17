/**
 * Abreviaturas de abilities para mostrar en UI.
 */
export const ABILITY_ABBR: Record<string, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

/**
 * Obtiene la abreviatura de una ability.
 */
export function getAbilityAbbr(abilityKey: string): string {
  return ABILITY_ABBR[abilityKey] ?? abilityKey.toUpperCase().slice(0, 3)
}
