import { ChangeTypes } from "../../core/domain/character/baseData/changes";
import { featureTypes } from "../../core/domain/character/baseData/features/feature";
import { valueIndexKeys } from "../../core/domain/character/calculation/valuesIndex/valuesIndex";
import { BabType } from "../../core/domain/class/baseAttackBonus";
import { CharacterClass } from "../../core/domain/class/class";
import { SaveType } from "../../core/domain/class/saves";

export const arqueroPsionico: CharacterClass = {
  name: "Arquero Psíquico",
  hitDie: 8,
  description: "",
  baseAttackBonusProgression: BabType.GOOD,
  baseSavesProgression: {
    fortitude: SaveType.GOOD,
    reflex: SaveType.POOR,
    will: SaveType.POOR,
  },
  classSkills: [
    'autohypnosis',
  ],
  levels: [
    {
      level: 1,
      classFeatures: [
        {
          name: "Flecha energizada",
          description:
            "Al realizar un ataque con un arma a distancia, puedes gastar 1 punto de poder para imbuir el proyectil o arma arrojadiza con un tipo de energía (frío, fuego, electricidad o sonido). El arma convertirá un 50% de su daño a daño del tipo de energía elegido y además causará 1d6 puntos de daño adicionales del tipo de energía seleccionado. Adicionalmente, puedes gastar tu foco psiónico cuando un proyectil o arma arrojadiza imbuidos con energía impacte contra un objetivo para crear una explosión de energía, con un radio de 10’ que infligirá el daño por energía del ataque a todas las criaturas que no fueran el objetivo del ataque. Esas criaturas pueden reducir el daño a la mitad con una TS de Reflejos con éxito (CD 10 + la mitad de tu nivel de guerrero psíquico + tu bonificador de Inteligencia). El arma o proyectil quedarán destruidos tras hacerlo explotar.",
          featureType: featureTypes.CLASS_FEATURE,
          uniqueId: "flecha-energizada",
          contextualChanges: [
            {
              name: "Flecha energizada",
              type: "attack",
              appliesTo: "ranged",
              available: true,
              optional: true,
              changes: [
                {
                  name: "Flecha energizada",
                  type: 'DAMAGE',
                  bonusTypeId: "UNTYPED",
                  formula: {
                    expression: "2d6",
                  },
                  originId: "flecha-energizada",
                  originType: "classFeature",
                },
              ],
              variables: [],
            },
          ],
        },
        {
            name: "Foco psiónico",
            description: "",
            featureType: featureTypes.CLASS_FEATURE,
            uniqueId: "foco-psionico",
            contextualChanges: [
              {
                name: "Foco psiónico",
                type: 'attack',
                appliesTo: "all",
                available: true,
                optional: true,
                changes: [
                  {
                    name: "Foco psiónico",
                    type: 'DAMAGE',
                    bonusTypeId: "UNTYPED",
                    formula: {
                      expression: `@${valueIndexKeys.INT_MODIFIER}`,
                    },
                    originId: "foco-psionico",
                    originType: "classFeature",
                  },
                ],
                variables: [],
              },
            ],
        }
      ],
    },
  ],
  classFeatures: [],
  spellCasting: false,
  uniqueId: "arqueroPsionico",
  sourceBook: "D&D 3.Txus",
};
