import { ContainerLayout } from './types';

/**
 * Row layout - represents a horizontal arrangement of elements
 * Elements are arranged side by side within the row
 */
export type RowLayout = ContainerLayout & {
  type: 'row';
  /** Optional spacing between elements */
  spacing?: number;
};

/**
 * Creates a row layout with the given parameters
 */
export function createRow(
  id: string,
  children: any[] = [],
  spacing?: number
): RowLayout {
  return {
    id,
    type: 'row',
    children,
    spacing
  };
}