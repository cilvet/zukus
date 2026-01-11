import { BaseView } from './types';

/**
 * Attribute view - displays a D&D attribute with two values
 * Typically shows the raw attribute value (large) and the modifier bonus (small)
 */
export type AttributeView = BaseView & {
  type: 'attribute';
  /** Custom variable ID for the main attribute value (displayed prominently) */
  primaryValue: string;
  /** Custom variable ID for the secondary value, typically the modifier (displayed smaller) */
  secondaryValue: string;
  /** Label for the attribute (e.g., "Strength", "Dexterity") */
  label: string;
};

/**
 * Creates an attribute view with the given parameters
 */
export function createAttributeView(
  id: string,
  label: string,
  primaryValue: string,
  secondaryValue: string
): AttributeView {
  return {
    id,
    type: 'attribute',
    label,
    primaryValue,
    secondaryValue
  };
}