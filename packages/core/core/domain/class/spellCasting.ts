
export enum SpellCastingType {
    DIVINE,
    ARCANE
}

export interface ClassSpellsPerDayProgression {
    [level: number]: ClassLevelSpellsPerDay
}

export interface ClassLevelSpellsPerDay {
    0: number
    1: number
    2: number
    3: number
    4: number
    5: number
    6: number
    7: number
    8: number
    9: number
}

export interface ClassSpellsKnownProgression {
    [level: number]: ClassLevelKnownSpells
}

export interface ClassLevelKnownSpells {
    0: number
    1: number
    2: number
    3: number
    4: number
    5: number
    6: number
    7: number
    8: number
    9: number
}