import { randomInteger } from "../../../utils/random";
import { SubstitutionExpressions, getRollExpression } from "../expressionAnalysis/expressionAnalysis";
import { getResolvedRollExpression } from "./diceRoller";
import { DiceRoller } from "./diceRoller.types";
import { ResolvedRollExpression, RollExpression } from "./rollExpression";

export class MockDiceRoller implements DiceRoller {
  private staticDiceRollValue: number | undefined;
  private nextDiceRollValues: number[] = [];
  constructor() {
    this.roll = this.roll.bind(this);
    this.mockDiceRolls = this.mockDiceRolls.bind(this);
    this.mockAllDiceRollsTo = this.mockAllDiceRollsTo.bind(this);
    this.randomInteger = this.randomInteger.bind(this);
  }
  private randomInteger(min: number, max: number) {
    if (this.nextDiceRollValues.length > 0) {
      return this.nextDiceRollValues.shift()!;
    }
    if (this.staticDiceRollValue !== undefined) {
      return this.staticDiceRollValue;
    }
    return randomInteger(min, max);
  }

  mockDiceRolls(...args: number[]) {
    this.nextDiceRollValues = args;
  }
  mockAllDiceRollsTo(value: number) {
    this.staticDiceRollValue = value;
  }
  roll(textInput: string, substitutionExpressions?: SubstitutionExpressions): ResolvedRollExpression {
    const rollExpression = getRollExpression(textInput, substitutionExpressions);
    return getResolvedRollExpression(rollExpression, this.randomInteger);
  }
  getRollExpression(
    textInput: string,
    substitutionExpressions?: SubstitutionExpressions | undefined
  ): RollExpression{
    return getRollExpression(textInput, substitutionExpressions);
  }
  resolveRollExpression(rollExpression: RollExpression) {
    return getResolvedRollExpression(rollExpression, this.randomInteger);
  }
}

const diceRoller = new MockDiceRoller();
diceRoller.mockAllDiceRollsTo(1);

const naturePurity = {
  description: `Si diriges el rayo contra una aberración, el rayo causara 5d6 puntos de daño por fuerza y su amenaza de crítico será de 19-20. Si la aberración muere debido a este ataque, su cadáver se transformara en compost vegetal maloliente.

  Puedes generar un rayo adicional por cada 4 NL que tengas por encima del 5º (hasta un máximo de 4 rayos con NL 17). Los rayos pueden ser disparados al mismo blanco o a objetivos distintos, pero todos los rayos deben apuntarse a objetivos que no estén a más de 30’ unos de otros y debes dispararlos todos a la vez.`,
  numberOfRays: "1 + max(floor((@casterLevel - 5)/4), 0)",
  damage: "5d6",
}

const scorchingRay = {
  description: `Atacas a tus enemigos con ardientes rayos. Puedes disparar un rayo, más 1 adicional por cada 4 NL más allá del 3º (hasta un máximo de 3 rayos con NL 11). Cada rayo requiere un ataque de toque a distancia para impactar, e inflige 4d6 puntos de daño por fuego. Los rayos pueden ser disparados al mismo o a diferentes objetivos, pero todos deben estar apuntados hacia blancos que no disten más de 30’ entre sí, ya que se disparan simultáneamente.`,
  damage: "4d6",
  numberOfRays: "1 + max(floor((@casterLevel - 3)/4), 0)",
}

const result = diceRoller.roll(scorchingRay.numberOfRays, {"casterLevel": {
  expression: "17",
}});
result.result
