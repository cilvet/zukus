import { SavingThrowChange } from "../baseData/changes"
import { Source, SourceValue } from "./sources"

export interface CalculatedSavingThrows {
    fortitude: CalculatedSavingThrow
    reflex: CalculatedSavingThrow
    will: CalculatedSavingThrow
}

export interface CalculatedSavingThrow {
    totalValue: number
    baseValue: number
    sources: Source<SavingThrowChange>[]
    sourceValues: SourceValue[]
}