import { ContainerLayout } from './types';

/**
 * Section layout - represents a titled section that can contain other elements
 * Typically used to group related elements under a common heading
 */
export type SectionLayout = ContainerLayout & {
  type: 'section';
  /** Title displayed at the top of the section */
  title: string;
  /** Optional subtitle for additional context */
  subtitle?: string;
};

/**
 * Creates a section layout with the given parameters
 */
export function createSection(
  id: string,
  title: string,
  children: any[] = [],
  subtitle?: string
): SectionLayout {
  return {
    id,
    type: 'section',
    title,
    subtitle,
    children
  };
}