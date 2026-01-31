/**
 * Operaciones puras sobre currencies.
 *
 * Todas las funciones son puras y retornan un nuevo estado.
 */

import type { CurrencyState } from '../types';
import type { CurrencyDefinition, CurrencyOperationResult } from './types';
import { currencySuccess, currencyWithWarning } from './types';

/**
 * Añade currency al estado.
 *
 * @param currencies - Estado actual de currencies
 * @param currencyId - ID de la currency a añadir
 * @param amount - Cantidad a añadir
 * @returns Resultado con el nuevo estado
 */
export function addCurrency(
  currencies: CurrencyState,
  currencyId: string,
  amount: number
): CurrencyOperationResult {
  if (amount < 0) {
    return currencyWithWarning(currencies, {
      type: 'invalid_amount',
      message: 'Amount must be non-negative',
      currencyId,
    });
  }

  const currentAmount = currencies[currencyId] ?? 0;

  return currencySuccess({
    ...currencies,
    [currencyId]: currentAmount + amount,
  });
}

/**
 * Elimina currency del estado.
 *
 * @param currencies - Estado actual de currencies
 * @param currencyId - ID de la currency a eliminar
 * @param amount - Cantidad a eliminar
 * @returns Resultado con el nuevo estado
 */
export function removeCurrency(
  currencies: CurrencyState,
  currencyId: string,
  amount: number
): CurrencyOperationResult {
  if (amount < 0) {
    return currencyWithWarning(currencies, {
      type: 'invalid_amount',
      message: 'Amount must be non-negative',
      currencyId,
    });
  }

  const currentAmount = currencies[currencyId] ?? 0;

  if (currentAmount < amount) {
    return currencyWithWarning(currencies, {
      type: 'insufficient_funds',
      message: `Insufficient ${currencyId}: have ${currentAmount}, need ${amount}`,
      currencyId,
    });
  }

  const newAmount = currentAmount - amount;

  // Si queda 0, mantener el registro (no eliminar la key)
  return currencySuccess({
    ...currencies,
    [currencyId]: newAmount,
  });
}

/**
 * Establece directamente el valor de una currency.
 *
 * @param currencies - Estado actual de currencies
 * @param currencyId - ID de la currency
 * @param amount - Nueva cantidad
 * @returns Resultado con el nuevo estado
 */
export function setCurrency(
  currencies: CurrencyState,
  currencyId: string,
  amount: number
): CurrencyOperationResult {
  if (amount < 0) {
    return currencyWithWarning(currencies, {
      type: 'invalid_amount',
      message: 'Amount must be non-negative',
      currencyId,
    });
  }

  return currencySuccess({
    ...currencies,
    [currencyId]: amount,
  });
}

/**
 * Convierte de una currency a otra.
 *
 * @param currencies - Estado actual de currencies
 * @param fromId - ID de la currency origen
 * @param toId - ID de la currency destino
 * @param amount - Cantidad a convertir de la currency origen
 * @param currencyDefs - Definiciones de currencies para obtener ratios
 * @returns Resultado con el nuevo estado
 */
export function convertCurrency(
  currencies: CurrencyState,
  fromId: string,
  toId: string,
  amount: number,
  currencyDefs: CurrencyDefinition[]
): CurrencyOperationResult {
  if (amount <= 0) {
    return currencyWithWarning(currencies, {
      type: 'invalid_amount',
      message: 'Amount must be positive',
      currencyId: fromId,
    });
  }

  const fromDef = currencyDefs.find((c) => c.id === fromId);
  const toDef = currencyDefs.find((c) => c.id === toId);

  if (!fromDef) {
    return currencyWithWarning(currencies, {
      type: 'currency_not_found',
      message: `Currency "${fromId}" not found in definitions`,
      currencyId: fromId,
    });
  }

  if (!toDef) {
    return currencyWithWarning(currencies, {
      type: 'currency_not_found',
      message: `Currency "${toId}" not found in definitions`,
      currencyId: toId,
    });
  }

  const currentFromAmount = currencies[fromId] ?? 0;

  if (currentFromAmount < amount) {
    return currencyWithWarning(currencies, {
      type: 'insufficient_funds',
      message: `Insufficient ${fromId}: have ${currentFromAmount}, need ${amount}`,
      currencyId: fromId,
    });
  }

  // Calcular conversión: from -> base -> to
  const baseValue = amount * fromDef.conversionToBase;
  const toAmount = baseValue / toDef.conversionToBase;

  // Redondear al entero inferior (no dar fracciones de moneda)
  const wholeToAmount = Math.floor(toAmount);

  // Calcular cuánto de from consumimos realmente para wholeToAmount
  // (puede quedar algo de cambio si la conversión no es exacta)
  const actualBaseUsed = wholeToAmount * toDef.conversionToBase;
  const actualFromUsed = actualBaseUsed / fromDef.conversionToBase;

  // Si no se puede convertir nada (conversión da 0)
  if (wholeToAmount === 0) {
    return currencyWithWarning(currencies, {
      type: 'conversion_error',
      message: `Cannot convert ${amount} ${fromId} to ${toId}: result would be 0`,
      currencyId: fromId,
    });
  }

  const newFromAmount = currentFromAmount - actualFromUsed;
  const currentToAmount = currencies[toId] ?? 0;

  return currencySuccess({
    ...currencies,
    [fromId]: newFromAmount,
    [toId]: currentToAmount + wholeToAmount,
  });
}

/**
 * Calcula el valor total en moneda base.
 *
 * @param currencies - Estado actual de currencies
 * @param currencyDefs - Definiciones de currencies
 * @returns Valor total en unidades de moneda base
 */
export function getTotalWealth(
  currencies: CurrencyState,
  currencyDefs: CurrencyDefinition[]
): number {
  let total = 0;

  for (const [currencyId, amount] of Object.entries(currencies)) {
    const def = currencyDefs.find((c) => c.id === currencyId);
    if (def) {
      total += amount * def.conversionToBase;
    }
  }

  return total;
}

/**
 * Calcula el peso total de las currencies.
 *
 * @param currencies - Estado actual de currencies
 * @param currencyDefs - Definiciones de currencies
 * @returns Peso total en libras
 */
export function getCurrencyWeight(
  currencies: CurrencyState,
  currencyDefs: CurrencyDefinition[]
): number {
  let totalWeight = 0;

  for (const [currencyId, amount] of Object.entries(currencies)) {
    const def = currencyDefs.find((c) => c.id === currencyId);
    if (def) {
      totalWeight += amount * def.weightPerUnit;
    }
  }

  return totalWeight;
}

/**
 * Obtiene el valor de una currency específica.
 *
 * @param currencies - Estado actual de currencies
 * @param currencyId - ID de la currency
 * @returns Cantidad actual (0 si no existe)
 */
export function getCurrencyAmount(
  currencies: CurrencyState,
  currencyId: string
): number {
  return currencies[currencyId] ?? 0;
}
