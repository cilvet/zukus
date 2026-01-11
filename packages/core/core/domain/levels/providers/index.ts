/**
 * EntityProvider module
 * 
 * Provides abstraction for obtaining entities:
 * - granted: Automatically given (by specific IDs and/or filter)
 * - selector: User chooses from a set
 * 
 * Both can coexist in the same provider.
 */

// Types
export type {
  EntityProvider,
  GrantedConfig,
  Selector,
  ProviderResolutionResult,
  GrantedResolutionResult,
  SelectorResolutionResult,
  ResolutionWarning,
} from './types';

// Functions
export { resolveProvider } from './resolveProvider';
