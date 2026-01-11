type Prefix = 'variables.';
type UniqueId = `${Prefix}${string}`;

export type Variable = {
    name: string;
    uniqueId: UniqueId;
}