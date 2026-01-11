export enum SaveType {
  GOOD = "GOOD",
  POOR = "POOR",
  VARIANT_GOOD = "VARIANT_GOOD",
  VARIANT_POOR = "VARIANT_POOR",
}

export enum SavingThrowId {
  FORTITUDE = "FORTITUDE",
  REFLEX = "REFLEX",
  WILL = "WILL",
  ALL = "ALL",
}

export interface ClassSavingThrowProgression {
  fortitude: SaveType;
  reflex: SaveType;
  will: SaveType;
}
