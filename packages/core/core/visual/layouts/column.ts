import { ContainerLayout } from './types';

/**
 * Column layout - represents a vertical arrangement of elements
 * Elements are stacked vertically within the column
 */
export type ColumnLayout = ContainerLayout & {
  type: 'column';
  /** Optional relative width (useful when column is inside a row) */
  width?: number;
};

/**
 * Creates a column layout with the given parameters
 */
export function createColumn(
  id: string,
  children: any[] = [],
  width?: number
): ColumnLayout {
  return {
    id,
    type: 'column',
    children,
    width
  };
}