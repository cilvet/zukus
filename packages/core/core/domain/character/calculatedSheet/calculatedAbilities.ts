import { defaultAbilityIds } from "../baseData/abilities"
import { AbilityCheckChange, AbilityScoreChange } from "../baseData/changes"
import { Source, SourceValue, SourceValuesByType } from "./sources"

export type CalculatedAbilities = {
    strength: CalculatedAbility
    dexterity: CalculatedAbility
    constitution: CalculatedAbility
    intelligence: CalculatedAbility
    wisdom: CalculatedAbility
    charisma: CalculatedAbility
    [key: string]: CalculatedAbility
}

export type CalculatedAbility = {
    uniqueAbilityId: string
    baseScore: number
    baseModifier: number
    totalScore: number
    abilityCheckScore: number
    totalModifier: number
    abilityCheckModifier: number
    drain: number
    damage: number
    penalty: number
    checkSourceVales: SourceValue[]
    sourceValues: SourceValue[]
    sources: Source<AbilityScoreChange>[]
}
