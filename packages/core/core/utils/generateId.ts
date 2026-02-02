/**
 * Generate a unique ID without using crypto (which is not available in React Native).
 * Uses timestamp + random string for uniqueness.
 */
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
}
