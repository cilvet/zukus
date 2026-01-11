/**
 * D&D 3.5 Example Feats
 * 
 * Includes general feats and fighter bonus feats.
 */

import type { StandardEntity } from '../../../entities/types/base';
import type { AttackContextualChange } from '../../../character/baseData/contextualChange';
import type { Effect } from '../../../character/baseData/effects';
import { effectTargets } from '../../../character/baseData/effects';
import { ChangeTypes } from '../../../character/baseData/changes';

// =============================================================================
// General Combat Feats
// =============================================================================

const generalFeats: StandardEntity[] = [
  {
    id: 'feat-power-attack',
    entityType: 'feat',
    name: 'Ataque Poderoso',
    description: 'Puedes sacrificar precisión por potencia en el combate cuerpo a cuerpo.',
    category: 'Combate',
    benefit: 'En tu turno, antes de hacer tiradas de ataque con un arma cuerpo a cuerpo, puedes elegir restar un número de tu elección (hasta tu BAB) de todas tus tiradas de ataque cuerpo a cuerpo y añadir el mismo número a todas tus tiradas de daño cuerpo a cuerpo.',
    tags: ['fighterBonusFeat', 'combate', 'ataque'],
    legacy_contextualChanges: [
      {
        type: 'attack',
        name: 'Ataque Poderoso',
        appliesTo: 'melee',
        optional: true,
        available: true,
        variables: [
          {
            name: 'Puntos de Ataque Poderoso',
            identifier: 'powerAttackPoints',
            min: 1,
            max: 5,
          },
        ],
        changes: [
          {
            type: ChangeTypes.ATTACK_ROLLS,
            formula: { expression: '-@powerAttackPoints' },
            bonusTypeId: 'UNTYPED',
          },
          {
            type: ChangeTypes.DAMAGE,
            formula: { expression: '@powerAttackPoints * 2' },
            bonusTypeId: 'UNTYPED',
          },
        ],
      } as AttackContextualChange,
    ],
  } as StandardEntity,
  {
    id: 'feat-cleave',
    entityType: 'feat',
    name: 'Hendir',
    description: 'Puedes seguir atacando después de derribar a un enemigo.',
    category: 'Combate',
    prerequisites: ['feat-power-attack'],
    benefit: 'Si derribas a un oponente con un ataque cuerpo a cuerpo, puedes hacer inmediatamente un ataque cuerpo a cuerpo adicional contra otro oponente adyacente.',
    tags: ['fighterBonusFeat', 'combate', 'ataque'],
  } as StandardEntity,
  {
    id: 'feat-great-cleave',
    entityType: 'feat',
    name: 'Gran Hendida',
    description: 'Puedes hendir a través de múltiples oponentes.',
    category: 'Combate',
    prerequisites: ['feat-power-attack', 'feat-cleave'],
    benefit: 'Esta dote funciona como Hendir, excepto que no hay límite al número de veces que puedes usarla por ronda.',
    tags: ['fighterBonusFeat', 'combate', 'ataque'],
  } as StandardEntity,
  {
    id: 'feat-dodge',
    entityType: 'feat',
    name: 'Esquivar',
    description: 'Eres especialmente hábil para esquivar ataques.',
    category: 'General',
    benefit: 'Durante tu turno, puedes designar un oponente y recibes un bonificador de +1 a la CA contra los ataques de ese oponente.',
    tags: ['fighterBonusFeat', 'defensivo', 'general'],
    effects: [
      {
        target: effectTargets.AC_TOTAL,
        formula: '1',
        bonusType: 'DODGE',
      } as Effect,
    ],
  } as StandardEntity,
  {
    id: 'feat-mobility',
    entityType: 'feat',
    name: 'Movilidad',
    description: 'Eres especialmente hábil para moverte en combate.',
    category: 'General',
    prerequisites: ['feat-dodge'],
    benefit: 'Recibes un bonificador de +4 a la CA contra ataques de oportunidad.',
    tags: ['fighterBonusFeat', 'movimiento', 'general'],
    effects: [
      {
        target: effectTargets.AC_TOTAL,
        formula: '4',
        bonusType: 'DODGE',
      } as Effect,
    ],
  } as StandardEntity,
  {
    id: 'feat-spring-attack',
    entityType: 'feat',
    name: 'Ataque Saltarín',
    description: 'Puedes moverte hacia un enemigo, golpear y retirarte.',
    category: 'Combate',
    prerequisites: ['feat-dodge', 'feat-mobility'],
    benefit: 'Puedes moverte tanto antes como después del ataque, sin provocar ataques de oportunidad del defensor.',
    tags: ['fighterBonusFeat', 'combate', 'movimiento'],
  } as StandardEntity,
  {
    id: 'feat-improved-initiative',
    entityType: 'feat',
    name: 'Iniciativa Mejorada',
    description: 'Reaccionas más rápido que la mayoría en combate.',
    category: 'General',
    benefit: 'Recibes un bonificador de +4 a tus tiradas de iniciativa.',
    tags: ['fighterBonusFeat', 'iniciativa', 'general'],
    effects: [
      {
        target: effectTargets.INITIATIVE_TOTAL,
        formula: '4',
        bonusType: 'ENHANCEMENT',
      } as Effect,
    ],
  } as StandardEntity,
  {
    id: 'feat-toughness',
    entityType: 'feat',
    name: 'Dureza',
    description: 'Tienes más resistencia que la mayoría.',
    category: 'General',
    benefit: 'Recibes +3 puntos de golpe.',
    tags: ['fighterBonusFeat', 'vitalidad', 'general'],
    effects: [
      {
        target: effectTargets.HP_MAX,
        formula: '3',
        bonusType: 'UNTYPED',
      } as Effect,
    ],
  } as StandardEntity,
  {
    id: 'feat-combat-reflexes',
    entityType: 'feat',
    name: 'Reflejos de Combate',
    description: 'Puedes hacer múltiples ataques de oportunidad.',
    category: 'General',
    benefit: 'Puedes hacer un número de ataques de oportunidad igual a 1 + tu modificador de Destreza.',
    tags: ['fighterBonusFeat', 'combate', 'general'],
  } as StandardEntity,
];

// =============================================================================
// Weapon Feats
// =============================================================================

const weaponFeats: StandardEntity[] = [
  {
    id: 'feat-weapon-focus',
    entityType: 'feat',
    name: 'Enfoque en Arma',
    description: 'Eres especialmente hábil con un tipo de arma.',
    category: 'Combate',
    benefit: 'Recibes un bonificador de +1 a todas las tiradas de ataque con el arma seleccionada.',
    tags: ['fighterBonusFeat', 'combate', 'arma'],
  } as StandardEntity,
  {
    id: 'feat-weapon-specialization',
    entityType: 'feat',
    name: 'Especialización con Arma',
    description: 'Infliges daño extra con un tipo específico de arma.',
    category: 'Combate',
    prerequisites: ['feat-weapon-focus'],
    benefit: 'Obtienes un bonificador de +2 a todas las tiradas de daño con el arma seleccionada.',
    tags: ['fighterBonusFeat', 'combate', 'arma'],
  } as StandardEntity,
  {
    id: 'feat-greater-weapon-focus',
    entityType: 'feat',
    name: 'Mayor Enfoque en Arma',
    description: 'Tienes una habilidad excepcional con un tipo específico de arma.',
    category: 'Combate',
    prerequisites: ['feat-weapon-focus'],
    benefit: 'Obtienes un bonificador adicional de +1 a las tiradas de ataque con el arma seleccionada.',
    tags: ['fighterBonusFeat', 'combate', 'arma'],
  } as StandardEntity,
  {
    id: 'feat-greater-weapon-specialization',
    entityType: 'feat',
    name: 'Mayor Especialización con Arma',
    description: 'Infliges aún más daño con un tipo específico de arma.',
    category: 'Combate',
    prerequisites: ['feat-weapon-focus', 'feat-weapon-specialization', 'feat-greater-weapon-focus'],
    benefit: 'Obtienes un bonificador adicional de +2 a las tiradas de daño con el arma seleccionada.',
    tags: ['fighterBonusFeat', 'combate', 'arma'],
  } as StandardEntity,
  {
    id: 'feat-improved-critical',
    entityType: 'feat',
    name: 'Golpe Crítico Mejorado',
    description: 'Los ataques con el arma tienen más probabilidad de ser críticos.',
    category: 'Combate',
    benefit: 'Tu rango de amenaza se duplica con el arma seleccionada.',
    tags: ['fighterBonusFeat', 'combate', 'arma'],
  } as StandardEntity,
  {
    id: 'feat-weapon-finesse',
    entityType: 'feat',
    name: 'Sutileza con Arma',
    description: 'Puedes usar Destreza en lugar de Fuerza para ataques con armas ligeras.',
    category: 'Combate',
    benefit: 'Usa tu modificador de Destreza en lugar de Fuerza en tiradas de ataque con armas ligeras.',
    tags: ['fighterBonusFeat', 'combate', 'arma'],
  } as StandardEntity,
];

// =============================================================================
// Ranged Combat Feats
// =============================================================================

const rangedFeats: StandardEntity[] = [
  {
    id: 'feat-point-blank-shot',
    entityType: 'feat',
    name: 'Disparo a Bocajarro',
    description: 'Eres hábil con ataques a distancia contra oponentes cercanos.',
    category: 'Combate',
    benefit: 'Recibes +1 a las tiradas de ataque y daño con ataques a distancia a 9 m o menos.',
    tags: ['fighterBonusFeat', 'combate', 'distancia'],
  } as StandardEntity,
  {
    id: 'feat-precise-shot',
    entityType: 'feat',
    name: 'Disparo Preciso',
    description: 'Puedes disparar a enemigos en combate cuerpo a cuerpo sin penalización.',
    category: 'Combate',
    prerequisites: ['feat-point-blank-shot'],
    benefit: 'No tomas la penalización de -4 al disparar a enemigos en combate cuerpo a cuerpo.',
    tags: ['fighterBonusFeat', 'combate', 'distancia'],
  } as StandardEntity,
  {
    id: 'feat-rapid-shot',
    entityType: 'feat',
    name: 'Disparo Rápido',
    description: 'Puedes disparar con velocidad excepcional.',
    category: 'Combate',
    prerequisites: ['feat-point-blank-shot'],
    benefit: 'Obtienes un ataque extra por ronda con -2 a todos los ataques.',
    tags: ['fighterBonusFeat', 'combate', 'distancia'],
  } as StandardEntity,
  {
    id: 'feat-manyshot',
    entityType: 'feat',
    name: 'Disparo Múltiple',
    description: 'Puedes disparar múltiples flechas simultáneamente.',
    category: 'Combate',
    prerequisites: ['feat-point-blank-shot', 'feat-rapid-shot'],
    benefit: 'Como acción estándar, dispara dos flechas con una tirada de ataque (-4).',
    tags: ['fighterBonusFeat', 'combate', 'distancia'],
  } as StandardEntity,
  {
    id: 'feat-shot-on-the-run',
    entityType: 'feat',
    name: 'Disparo en Movimiento',
    description: 'Puedes moverte, disparar y moverte de nuevo.',
    category: 'Combate',
    prerequisites: ['feat-dodge', 'feat-mobility', 'feat-point-blank-shot'],
    benefit: 'Puedes moverte antes y después de un ataque a distancia.',
    tags: ['fighterBonusFeat', 'combate', 'distancia', 'movimiento'],
  } as StandardEntity,
];

// =============================================================================
// Two-Weapon Fighting Feats
// =============================================================================

const twoWeaponFeats: StandardEntity[] = [
  {
    id: 'feat-two-weapon-fighting',
    entityType: 'feat',
    name: 'Combate con Dos Armas',
    description: 'Puedes luchar con un arma en cada mano.',
    category: 'Combate',
    benefit: 'Reduces las penalizaciones por luchar con dos armas.',
    tags: ['fighterBonusFeat', 'combate'],
  } as StandardEntity,
  {
    id: 'feat-improved-two-weapon-fighting',
    entityType: 'feat',
    name: 'Combate con Dos Armas Mejorado',
    description: 'Eres un experto luchando con dos armas.',
    category: 'Combate',
    prerequisites: ['feat-two-weapon-fighting'],
    benefit: 'Obtienes un segundo ataque con el arma secundaria a -5.',
    tags: ['fighterBonusFeat', 'combate'],
  } as StandardEntity,
  {
    id: 'feat-greater-two-weapon-fighting',
    entityType: 'feat',
    name: 'Combate con Dos Armas Superior',
    description: 'Eres un maestro luchando con dos armas.',
    category: 'Combate',
    prerequisites: ['feat-two-weapon-fighting', 'feat-improved-two-weapon-fighting'],
    benefit: 'Obtienes un tercer ataque con el arma secundaria a -10.',
    tags: ['fighterBonusFeat', 'combate'],
  } as StandardEntity,
];

// =============================================================================
// Combat Maneuver Feats
// =============================================================================

const maneuverFeats: StandardEntity[] = [
  {
    id: 'feat-combat-expertise',
    entityType: 'feat',
    name: 'Maestría en Combate',
    description: 'Puedes sacrificar ataque por defensa.',
    category: 'Combate',
    benefit: 'Toma hasta -5 en ataque para añadir el mismo valor a CA como esquiva.',
    tags: ['fighterBonusFeat', 'combate', 'defensivo'],
  } as StandardEntity,
  {
    id: 'feat-improved-trip',
    entityType: 'feat',
    name: 'Derribo Mejorado',
    description: 'Estás entrenado en derribar oponentes.',
    category: 'Combate',
    prerequisites: ['feat-combat-expertise'],
    benefit: 'No provocas ataques de oportunidad al derribar. +4 al intento.',
    tags: ['fighterBonusFeat', 'combate'],
  } as StandardEntity,
  {
    id: 'feat-improved-disarm',
    entityType: 'feat',
    name: 'Desarme Mejorado',
    description: 'Sabes cómo desarmar oponentes.',
    category: 'Combate',
    prerequisites: ['feat-combat-expertise'],
    benefit: 'No provocas ataques de oportunidad al desarmar. +4 al intento.',
    tags: ['fighterBonusFeat', 'combate'],
  } as StandardEntity,
  {
    id: 'feat-improved-bull-rush',
    entityType: 'feat',
    name: 'Embestida Mejorada',
    description: 'Sabes cómo empujar oponentes.',
    category: 'Combate',
    prerequisites: ['feat-power-attack'],
    benefit: 'No provocas ataques de oportunidad al embestir. +4 al intento.',
    tags: ['fighterBonusFeat', 'combate'],
  } as StandardEntity,
  {
    id: 'feat-improved-overrun',
    entityType: 'feat',
    name: 'Atropello Mejorado',
    description: 'Eres hábil atropellando oponentes.',
    category: 'Combate',
    prerequisites: ['feat-power-attack'],
    benefit: 'No provocas ataques de oportunidad al atropellar. +4 al intento.',
    tags: ['fighterBonusFeat', 'combate'],
  } as StandardEntity,
  {
    id: 'feat-improved-sunder',
    entityType: 'feat',
    name: 'Destruir Mejorado',
    description: 'Eres hábil destruyendo armas y escudos.',
    category: 'Combate',
    prerequisites: ['feat-power-attack'],
    benefit: 'No provocas ataques de oportunidad al destruir. +4 al intento.',
    tags: ['fighterBonusFeat', 'combate'],
  } as StandardEntity,
  {
    id: 'feat-whirlwind-attack',
    entityType: 'feat',
    name: 'Ataque Giratorio',
    description: 'Puedes atacar a todos los enemigos a tu alcance.',
    category: 'Combate',
    prerequisites: ['feat-dodge', 'feat-mobility', 'feat-spring-attack'],
    benefit: 'Haz un ataque a cada oponente a tu alcance.',
    tags: ['fighterBonusFeat', 'combate'],
  } as StandardEntity,
];

// =============================================================================
// Unarmed Combat Feats
// =============================================================================

const unarmedFeats: StandardEntity[] = [
  {
    id: 'feat-improved-unarmed-strike',
    entityType: 'feat',
    name: 'Golpe sin Armas Mejorado',
    description: 'Eres hábil luchando sin armas.',
    category: 'Combate',
    benefit: 'Se te considera armado cuando estás desarmado.',
    tags: ['fighterBonusFeat', 'combate'],
  } as StandardEntity,
  {
    id: 'feat-stunning-fist',
    entityType: 'feat',
    name: 'Puñetazo Aturdidor',
    description: 'Puedes aturdir oponentes con golpes sin armas.',
    category: 'Combate',
    prerequisites: ['feat-improved-unarmed-strike'],
    benefit: 'El enemigo debe hacer salvación de Fortaleza o quedar aturdido.',
    tags: ['fighterBonusFeat', 'combate'],
  } as StandardEntity,
];

// =============================================================================
// Mounted Combat Feats
// =============================================================================

const mountedFeats: StandardEntity[] = [
  {
    id: 'feat-mounted-combat',
    entityType: 'feat',
    name: 'Combate Montado',
    description: 'Eres hábil en combate montado.',
    category: 'Combate',
    benefit: 'Una vez por ronda, puedes negar un impacto a tu montura con una tirada de Montar.',
    tags: ['fighterBonusFeat', 'combate', 'montado'],
  } as StandardEntity,
  {
    id: 'feat-ride-by-attack',
    entityType: 'feat',
    name: 'Ataque al Pasar',
    description: 'Puedes atacar mientras cargas montado.',
    category: 'Combate',
    prerequisites: ['feat-mounted-combat'],
    benefit: 'Puedes moverte antes y después de atacar durante una carga montada.',
    tags: ['fighterBonusFeat', 'combate', 'montado'],
  } as StandardEntity,
  {
    id: 'feat-spirited-charge',
    entityType: 'feat',
    name: 'Carga Devastadora',
    description: 'Infliges daño devastador en cargas montadas.',
    category: 'Combate',
    prerequisites: ['feat-mounted-combat', 'feat-ride-by-attack'],
    benefit: 'Daño doble (triple con lanza) en carga montada.',
    tags: ['fighterBonusFeat', 'combate', 'montado'],
  } as StandardEntity,
];

// =============================================================================
// Other Combat Feats
// =============================================================================

const otherCombatFeats: StandardEntity[] = [
  {
    id: 'feat-blind-fight',
    entityType: 'feat',
    name: 'Combate a Ciegas',
    description: 'Sabes luchar sin ver a tus enemigos.',
    category: 'Combate',
    benefit: 'Puedes volver a tirar el porcentaje de fallo por ocultamiento.',
    tags: ['fighterBonusFeat', 'combate'],
  } as StandardEntity,
];

// =============================================================================
// Magic Feats
// =============================================================================

const magicFeats: StandardEntity[] = [
  {
    id: 'feat-spell-focus',
    entityType: 'feat',
    name: 'Enfoque en Conjuro',
    description: 'Eres hábil con una escuela de magia.',
    category: 'General',
    benefit: '+1 a la CD de salvaciones contra tus conjuros de la escuela elegida.',
    tags: ['magia', 'general'],
  } as StandardEntity,
];

// =============================================================================
// Export All Feats
// =============================================================================

export const allFeats: StandardEntity[] = [
  ...generalFeats,
  ...weaponFeats,
  ...rangedFeats,
  ...twoWeaponFeats,
  ...maneuverFeats,
  ...unarmedFeats,
  ...mountedFeats,
  ...otherCombatFeats,
  ...magicFeats,
];

// Export individual groups for reference
export {
  generalFeats,
  weaponFeats,
  rangedFeats,
  twoWeaponFeats,
  maneuverFeats,
  unarmedFeats,
  mountedFeats,
  magicFeats,
};

