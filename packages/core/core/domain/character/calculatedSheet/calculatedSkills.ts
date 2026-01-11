import { SkillChange } from "../baseData/changes";
import { BaseSkill, SimpleSkill, SkillData } from "../baseData/skills";
import { Source, SourceValue } from "./sources";

export type CalculatedSingleSkill = SimpleSkill & {
    skillData: SkillData
    totalBonus: number
    sourceValues: SourceValue[]
    sources: Source<SkillChange>[]
    isClassSkill: boolean
}

export type CalculatedParentSkill =  BaseSkill & {
    type: 'parent',
    isClassSkill: boolean
    subSkills: CalculatedSingleSkill[]
}

export type CalculatedSkill = CalculatedSingleSkill | CalculatedParentSkill

export type CalculatedSkills = { [key: string]: CalculatedSkill }