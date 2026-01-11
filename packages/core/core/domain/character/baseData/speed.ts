
export type DefaultBaseSpeeds = {
    landSpeed?: Speed
    flySpeed?: FlyingSpeed
    swimSpeed?: Speed
    climbSpeed?: Speed
    burrowSpeed?: Speed
}

export type BaseSpeeds = DefaultBaseSpeeds & {
    [key: string]: Speed
}

export enum Maneuverability {
    CLUMSY = "CLUMSY",
    AVERAGE = "AVERAGE",
    GOOD = "GOOD",
    PERFECT = "PERFECT",
}

export interface Speed {
    value: number
}

export interface FlyingSpeed extends Speed {
    maneuverability: Maneuverability
}