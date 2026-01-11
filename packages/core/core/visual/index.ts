/**
 * Visual layout system for character sheet interfaces
 * 
 * This system provides a way to define visual layouts that reference custom variables
 * without being tightly coupled to the calculation logic. The visual system is purely
 * declarative and can be used to build UI components independently.
 * 
 * Key features:
 * - Layout primitives: sections, rows, columns
 * - View components: attribute views (with more to come)
 * - Value references: links to custom variables by identifier
 * - Complete separation from calculation logic
 */

// Layout system exports
export * from './layouts/types';
export * from './layouts/section';
export * from './layouts/column';
export * from './layouts/row';

// View system exports  
export * from './views/index';


// Examples for reference
export * from './examples/layouts';

// Import specific types for the union
import type { SectionLayout } from './layouts/section';
import type { ColumnLayout } from './layouts/column';
import type { RowLayout } from './layouts/row';
import type { AttributeView } from './views/attribute';

/**
 * Properly typed union for all possible layout elements
 */
export type LayoutElement = SectionLayout | ColumnLayout | RowLayout | AttributeView;

// Type re-exports for convenience
export type { SectionLayout } from './layouts/section';
export type { ColumnLayout } from './layouts/column';
export type { RowLayout } from './layouts/row';
export type { AttributeView } from './views/attribute';