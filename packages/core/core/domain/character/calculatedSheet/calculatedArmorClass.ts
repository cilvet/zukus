import { ArmorClassChange, NaturalArmorClassChange } from "../baseData/changes"
import { Source, SourceValue } from "./sources"

export interface CalculatedArmorClass {
    totalAc: CalculatedACType
    touchAc: CalculatedACType
    naturalAc: CalculatedACType
    flatFootedAc: CalculatedACType
}

export type CalculatedACType = {
    totalValue: number
    sources: Source[]
    sourceValues: SourceValue[]
}

