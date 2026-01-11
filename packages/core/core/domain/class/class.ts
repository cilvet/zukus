import { HitDie } from "../character/baseData/hitDie";
import { defaultSkills } from "../character/baseData/skills";
import { BabType } from "./baseAttackBonus";
import { ClassFeature } from "./classFeatures";
import { ClassSavingThrowProgression } from "./saves";
import { ClassSpellsKnownProgression, ClassSpellsPerDayProgression, SpellCastingType } from "./spellCasting";

export type CharacterClass = {
    name?: string
    uniqueId: string
    hitDie: HitDie,
    baseSavesProgression: ClassSavingThrowProgression
    baseAttackBonusProgression: BabType
    levels: ClassLevel[]
    classFeatures: ClassFeature[]
    description?: string
    sourceBook?: string
    createdBy?: string
    spellCasting: boolean
    spellCastingAbilityUniqueId?: string
    allSpellsKnown?: boolean
    spellsPerDayProgression?: ClassSpellsPerDayProgression
    spellsKnownProgression?: ClassSpellsKnownProgression
    spellCastingType?: SpellCastingType
    classSkills?: (typeof defaultSkills[number] | string & {})[]
}

export type ClassLevel = {
    level: number
    classFeatures: ClassFeature[]
}

export enum ClassType {
    BASE,
    PRESTIGE,
    RACIAL
}



