/**
 * Base types for visual layout system
 * Defines the fundamental structure for organizing visual elements
 */

export type LayoutType = 'section' | 'column' | 'row';

export type BaseLayout = {
  /** Unique identifier for the layout element */
  id: string;
  /** Type of layout element */
  type: LayoutType;
};

/**
 * Base type for layouts that can contain other elements
 */
export type ContainerLayout = BaseLayout & {
  /** Child elements contained within this layout */
  children: any[];
};

/**
 * Base type for all view elements that can be placed in layouts
 */
export type ViewElement = {
  /** Unique identifier for the view element */
  id: string;
  /** Type of view element */
  type: string;
};