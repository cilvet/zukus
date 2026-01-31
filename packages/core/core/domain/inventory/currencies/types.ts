/**
 * Sistema de Currencies
 *
 * Las currencies se definen como entidades del compendium,
 * permitiendo configuración flexible por sistema de juego.
 */

/**
 * Definición de una currency (entidad de compendium).
 */
export type CurrencyDefinition = {
  /** ID único de la currency */
  id: string;
  /** Tipo de entidad (siempre 'currency') */
  entityType: 'currency';
  /** Nombre para mostrar */
  name: string;
  /** Abreviatura (e.g., 'gp', 'sp', 'cp') */
  abbreviation: string;
  /** Ratio de conversión respecto a la moneda base (1 = base) */
  conversionToBase: number;
  /** Peso por unidad en libras */
  weightPerUnit: number;
};

/**
 * Resultado de operaciones de currency.
 */
export type CurrencyOperationResult = {
  currencies: { [currencyId: string]: number };
  warnings: CurrencyWarning[];
};

export type CurrencyWarning = {
  type: 'currency_not_found' | 'insufficient_funds' | 'invalid_amount' | 'conversion_error';
  message: string;
  currencyId?: string;
};

/**
 * Helper para crear resultado exitoso.
 */
export function currencySuccess(
  currencies: { [currencyId: string]: number }
): CurrencyOperationResult {
  return { currencies, warnings: [] };
}

/**
 * Helper para crear resultado con warning.
 */
export function currencyWithWarning(
  currencies: { [currencyId: string]: number },
  warning: CurrencyWarning
): CurrencyOperationResult {
  return { currencies, warnings: [warning] };
}
