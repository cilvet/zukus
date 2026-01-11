import { CustomVariableChange } from "./changes";


export type BaseSource = CustomVariableChange & {
    name: string;
    createVariableForSource: boolean;
}