import { ViewElement } from '../layouts/types';

/**
 * Base types for visual view elements
 * Views are the actual visual components that display data
 */

export type ViewType = 'attribute';
// Future view types can be added here (e.g., 'skill' | 'saving_throw', etc.)

/**
 * Base type for all view elements
 */
export type BaseView = ViewElement & {
  /** Type of view element */
  type: ViewType;
  /** Optional label to display */
  label?: string;
};