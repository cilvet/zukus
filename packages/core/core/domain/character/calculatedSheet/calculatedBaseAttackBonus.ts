import { Source, SourceValue } from "./sources"

export interface CalculatedBaseAttackBonus {
    totalValue: number
    baseValue: number
    multipleBaseAttackBonuses: number[]
    sources: Source[]
    sourceValues: SourceValue[]
}


