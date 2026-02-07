/**
 * Spanish Translation Pack for D&D 3.5 Feats
 *
 * Contains all feat translations from English to Spanish.
 */

import type { TranslationPack } from '../types';

export const dnd35FeatsSpanishPack: TranslationPack = {
  id: 'dnd35-feats-es',
  name: 'D&D 3.5 Feats - Spanish',
  targetCompendiumId: 'dnd35-example',
  targetVersionRange: '^1.0.0',
  locale: 'es',
  source: 'official',
  version: '1.0.0',
  translations: {
    'feat-power-attack': {
      name: 'Ataque Poderoso',
      description: 'Puedes sacrificar precisión por potencia en el combate cuerpo a cuerpo.',
      category: 'Combate',
      benefit: 'En tu turno, antes de hacer tiradas de ataque con un arma cuerpo a cuerpo, puedes elegir restar un número de tu elección (hasta tu BAB) de todas tus tiradas de ataque cuerpo a cuerpo y añadir el mismo número a todas tus tiradas de daño cuerpo a cuerpo.',
    },
    'feat-cleave': {
      name: 'Hendir',
      description: 'Puedes seguir atacando después de derribar a un enemigo.',
      category: 'Combate',
      benefit: 'Si derribas a un oponente con un ataque cuerpo a cuerpo, puedes hacer inmediatamente un ataque cuerpo a cuerpo adicional contra otro oponente adyacente.',
    },
    'feat-great-cleave': {
      name: 'Gran Hendida',
      description: 'Puedes hendir a través de múltiples oponentes.',
      category: 'Combate',
      benefit: 'Esta dote funciona como Hendir, excepto que no hay límite al número de veces que puedes usarla por ronda.',
    },
    'feat-dodge': {
      name: 'Esquivar',
      description: 'Eres especialmente hábil para esquivar ataques.',
      category: 'General',
      benefit: 'Durante tu turno, puedes designar un oponente y recibes un bonificador de +1 a la CA contra los ataques de ese oponente.',
    },
    'feat-mobility': {
      name: 'Movilidad',
      description: 'Eres especialmente hábil para moverte en combate.',
      category: 'General',
      benefit: 'Recibes un bonificador de +4 a la CA contra ataques de oportunidad.',
    },
    'feat-spring-attack': {
      name: 'Ataque Saltarín',
      description: 'Puedes moverte hacia un enemigo, golpear y retirarte.',
      category: 'Combate',
      benefit: 'Puedes moverte tanto antes como después del ataque, sin provocar ataques de oportunidad del defensor.',
    },
    'feat-improved-initiative': {
      name: 'Iniciativa Mejorada',
      description: 'Reaccionas más rápido que la mayoría en combate.',
      category: 'General',
      benefit: 'Recibes un bonificador de +4 a tus tiradas de iniciativa.',
    },
    'feat-toughness': {
      name: 'Dureza',
      description: 'Tienes más resistencia que la mayoría.',
      category: 'General',
      benefit: 'Recibes +3 puntos de golpe.',
    },
    'feat-combat-reflexes': {
      name: 'Reflejos de Combate',
      description: 'Puedes hacer múltiples ataques de oportunidad.',
      category: 'General',
      benefit: 'Puedes hacer un número de ataques de oportunidad igual a 1 + tu modificador de Destreza.',
    },
    'feat-weapon-focus': {
      name: 'Enfoque en Arma',
      description: 'Eres especialmente hábil con un tipo de arma.',
      category: 'Combate',
      benefit: 'Recibes un bonificador de +1 a todas las tiradas de ataque con el arma seleccionada.',
    },
    'feat-weapon-specialization': {
      name: 'Especialización con Arma',
      description: 'Infliges daño extra con un tipo específico de arma.',
      category: 'Combate',
      benefit: 'Obtienes un bonificador de +2 a todas las tiradas de daño con el arma seleccionada.',
    },
    'feat-greater-weapon-focus': {
      name: 'Mayor Enfoque en Arma',
      description: 'Tienes una habilidad excepcional con un tipo específico de arma.',
      category: 'Combate',
      benefit: 'Obtienes un bonificador adicional de +1 a las tiradas de ataque con el arma seleccionada.',
    },
    'feat-greater-weapon-specialization': {
      name: 'Mayor Especialización con Arma',
      description: 'Infliges aún más daño con un tipo específico de arma.',
      category: 'Combate',
      benefit: 'Obtienes un bonificador adicional de +2 a las tiradas de daño con el arma seleccionada.',
    },
    'feat-improved-critical': {
      name: 'Golpe Crítico Mejorado',
      description: 'Los ataques con el arma tienen más probabilidad de ser críticos.',
      category: 'Combate',
      benefit: 'Tu rango de amenaza se duplica con el arma seleccionada.',
    },
    'feat-weapon-finesse': {
      name: 'Sutileza con Arma',
      description: 'Puedes usar Destreza en lugar de Fuerza para ataques con armas ligeras.',
      category: 'Combate',
      benefit: 'Usa tu modificador de Destreza en lugar de Fuerza en tiradas de ataque con armas ligeras.',
    },
    'feat-point-blank-shot': {
      name: 'Disparo a Bocajarro',
      description: 'Eres hábil con ataques a distancia contra oponentes cercanos.',
      category: 'Combate',
      benefit: 'Recibes +1 a las tiradas de ataque y daño con ataques a distancia a 9 m o menos.',
    },
    'feat-precise-shot': {
      name: 'Disparo Preciso',
      description: 'Puedes disparar a enemigos en combate cuerpo a cuerpo sin penalización.',
      category: 'Combate',
      benefit: 'No tomas la penalización de -4 al disparar a enemigos en combate cuerpo a cuerpo.',
    },
    'feat-rapid-shot': {
      name: 'Disparo Rápido',
      description: 'Puedes disparar con velocidad excepcional.',
      category: 'Combate',
      benefit: 'Obtienes un ataque extra por ronda con -2 a todos los ataques.',
    },
    'feat-manyshot': {
      name: 'Disparo Múltiple',
      description: 'Puedes disparar múltiples flechas simultáneamente.',
      category: 'Combate',
      benefit: 'Como acción estándar, dispara dos flechas con una tirada de ataque (-4).',
    },
    'feat-shot-on-the-run': {
      name: 'Disparo en Movimiento',
      description: 'Puedes moverte, disparar y moverte de nuevo.',
      category: 'Combate',
      benefit: 'Puedes moverte antes y después de un ataque a distancia.',
    },
    'feat-two-weapon-fighting': {
      name: 'Combate con Dos Armas',
      description: 'Puedes luchar con un arma en cada mano.',
      category: 'Combate',
      benefit: 'Reduces las penalizaciones por luchar con dos armas.',
    },
    'feat-improved-two-weapon-fighting': {
      name: 'Combate con Dos Armas Mejorado',
      description: 'Eres un experto luchando con dos armas.',
      category: 'Combate',
      benefit: 'Obtienes un segundo ataque con el arma secundaria a -5.',
    },
    'feat-greater-two-weapon-fighting': {
      name: 'Combate con Dos Armas Superior',
      description: 'Eres un maestro luchando con dos armas.',
      category: 'Combate',
      benefit: 'Obtienes un tercer ataque con el arma secundaria a -10.',
    },
    'feat-combat-expertise': {
      name: 'Maestría en Combate',
      description: 'Puedes sacrificar ataque por defensa.',
      category: 'Combate',
      benefit: 'Toma hasta -5 en ataque para añadir el mismo valor a CA como esquiva.',
    },
    'feat-improved-trip': {
      name: 'Derribo Mejorado',
      description: 'Estás entrenado en derribar oponentes.',
      category: 'Combate',
      benefit: 'No provocas ataques de oportunidad al derribar. +4 al intento.',
    },
    'feat-improved-disarm': {
      name: 'Desarme Mejorado',
      description: 'Sabes cómo desarmar oponentes.',
      category: 'Combate',
      benefit: 'No provocas ataques de oportunidad al desarmar. +4 al intento.',
    },
    'feat-improved-bull-rush': {
      name: 'Embestida Mejorada',
      description: 'Sabes cómo empujar oponentes.',
      category: 'Combate',
      benefit: 'No provocas ataques de oportunidad al embestir. +4 al intento.',
    },
    'feat-improved-overrun': {
      name: 'Atropello Mejorado',
      description: 'Eres hábil atropellando oponentes.',
      category: 'Combate',
      benefit: 'No provocas ataques de oportunidad al atropellar. +4 al intento.',
    },
    'feat-improved-sunder': {
      name: 'Destruir Mejorado',
      description: 'Eres hábil destruyendo armas y escudos.',
      category: 'Combate',
      benefit: 'No provocas ataques de oportunidad al destruir. +4 al intento.',
    },
    'feat-whirlwind-attack': {
      name: 'Ataque Giratorio',
      description: 'Puedes atacar a todos los enemigos a tu alcance.',
      category: 'Combate',
      benefit: 'Haz un ataque a cada oponente a tu alcance.',
    },
    'feat-improved-unarmed-strike': {
      name: 'Golpe sin Armas Mejorado',
      description: 'Eres hábil luchando sin armas.',
      category: 'Combate',
      benefit: 'Se te considera armado cuando estás desarmado.',
    },
    'feat-stunning-fist': {
      name: 'Puñetazo Aturdidor',
      description: 'Puedes aturdir oponentes con golpes sin armas.',
      category: 'Combate',
      benefit: 'El enemigo debe hacer salvación de Fortaleza o quedar aturdido.',
    },
    'feat-mounted-combat': {
      name: 'Combate Montado',
      description: 'Eres hábil en combate montado.',
      category: 'Combate',
      benefit: 'Una vez por ronda, puedes negar un impacto a tu montura con una tirada de Montar.',
    },
    'feat-ride-by-attack': {
      name: 'Ataque al Pasar',
      description: 'Puedes atacar mientras cargas montado.',
      category: 'Combate',
      benefit: 'Puedes moverte antes y después de atacar durante una carga montada.',
    },
    'feat-spirited-charge': {
      name: 'Carga Devastadora',
      description: 'Infliges daño devastador en cargas montadas.',
      category: 'Combate',
      benefit: 'Daño doble (triple con lanza) en carga montada.',
    },
    'feat-blind-fight': {
      name: 'Combate a Ciegas',
      description: 'Sabes luchar sin ver a tus enemigos.',
      category: 'Combate',
      benefit: 'Puedes volver a tirar el porcentaje de fallo por ocultamiento.',
    },
    'feat-spell-focus': {
      name: 'Enfoque en Conjuro',
      description: 'Eres hábil con una escuela de magia.',
      category: 'General',
      benefit: '+1 a la CD de salvaciones contra tus conjuros de la escuela elegida.',
    },
  },
};
