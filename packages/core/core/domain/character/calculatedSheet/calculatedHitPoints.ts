import { TemporaryHpChange } from "../baseData/changes"
import { Source, SourceValue } from "./sources"

export type CalculatedHitPoints = {
    maxHp: number
    currentHp: number
    currentDamage: number
    temporaryHp: number
    temporaryHpSourceValues: SourceValue[]
    temporaryHpSources: Source<TemporaryHpChange>[]
    customCurrentHp?: number
}