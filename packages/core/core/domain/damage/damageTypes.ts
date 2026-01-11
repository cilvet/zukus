
const baseDamageTypes = {
  piercing: "piercing",
  precision: "precision",
  bludgeoning: "bludgeoning",
  slashing: "slashing",
  acid: "acid",
  cold: "cold",
  fire: "fire",
  force: "force",
  lightning: "lightning",
  necrotic: "necrotic",
  poison: "poison",
  psychic: "psychic",
  sacred: "sacred",
  electric: "electric",
  sonic: "sonic",
  positive: "positive",
  negative: "negative",
  untyped: "untyped",
  vile: "vile",
};

export type BasicDamageType = keyof typeof baseDamageTypes;

export type SimpleDamageType = {
  type: 'basic';
  damageType: BasicDamageType;
};

export type MultipleDamageType = {
  type: 'multiple';
  damageTypes: BasicDamageType[];
};

export type HalfAndHalfDamageType = {
  type: 'halfAndHalf';
  firstDamageType: BasicDamageType;
  secondDamageType: BasicDamageType;
};

export type DamageType = SimpleDamageType | MultipleDamageType | HalfAndHalfDamageType;

export type ResultDamageType = DamageType & {
  id: string;
};