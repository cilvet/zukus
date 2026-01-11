export type Dice = {
  sides: number;
}

export type SimpleDiceExpression = `${number}d${number}`;

const myDiceExpression: SimpleDiceExpression = '2d6';
const a: SimpleDiceExpression = '2d4';

export const commonDice = [ 'd4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100' ] as const;

export const regularDice: Record<typeof commonDice[number], Dice> = {
  d4: { sides: 4 },
  d6: { sides: 6 },
  d8: { sides: 8 },
  d10: { sides: 10 },
  d12: { sides: 12 },
  d20: { sides: 20 },
  d100: { sides: 100 },
};
