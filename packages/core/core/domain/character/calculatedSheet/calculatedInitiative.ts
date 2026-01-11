import { InitiativeChange } from "../baseData/changes"
import { Source, SourceValue, SourceValuesByType } from "./sources"

export interface CalculatedInitiative {
    totalValue: number
    sources: Source<InitiativeChange>[]
    sourceValues: SourceValue[]
}

